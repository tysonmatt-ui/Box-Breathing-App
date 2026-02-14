const CACHE_NAME = 'breathing-app-v3';
const APP_PATH = '/Box-Breathing-App/';
const urlsToCache = [
    APP_PATH,
    APP_PATH + 'index.html',
    APP_PATH + 'app.js',
    APP_PATH + 'manifest.json'
];

// Install
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
    );
    self.skipWaiting();
});

// Activate
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys.map(key => key !== CACHE_NAME ? caches.delete(key) : null)
        ))
    );
    self.clients.claim();
});

// Fetch from cache
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(clientList => {
                for (let client of clientList) {
                    if (client.url.includes(APP_PATH) && 'focus' in client) {
                        client.postMessage({ type: 'SHOW_PROMPT' });
                        return client.focus();
                    }
                }
                return clients.openWindow(APP_PATH);
            })
    );
});

// ─── Timing Logic ─────────────────────────────────────────────────────────────

let checkTimer = null;

// Check waking hours (07:00 - 21:30)
function isWakingHours() {
    const now = new Date();
    const mins = now.getHours() * 60 + now.getMinutes();
    return mins >= 420 && mins <= 1290;
}

// Send the breathing notification
async function sendBreathingNotification() {
    if (!isWakingHours()) {
        console.log('[SW] Outside waking hours, skipping notification');
        scheduleNextCheck();
        return;
    }

    await self.registration.showNotification('Mindful Breathing', {
        body: 'Shall we do some autonomic nervous system regulation?',
        icon: APP_PATH + 'icon-192.png',
        badge: APP_PATH + 'icon-192.png',
        tag: 'breathing-reminder',
        requireInteraction: true,
        vibrate: [200, 100, 200]
    });

    console.log('[SW] Notification sent at', new Date().toLocaleTimeString());

    // Tell the app to show the prompt if it's open
    const allClients = await clients.matchAll({ type: 'window' });
    allClients.forEach(c => c.postMessage({ type: 'SHOW_PROMPT' }));
}

// Schedule the next check - runs every 2 minutes
// Each check reads the target time from IndexedDB
function scheduleNextCheck() {
    if (checkTimer) clearTimeout(checkTimer);
    checkTimer = setTimeout(runCheck, 2 * 60 * 1000); // 2 minutes
    console.log('[SW] Next check in 2 minutes');
}

// Read target time from IndexedDB and decide whether to notify
async function runCheck() {
    const targetTime = await getTargetTime();
    const now = Date.now();

    console.log('[SW] Running check at', new Date().toLocaleTimeString());
    console.log('[SW] Target time:', targetTime ? new Date(targetTime).toLocaleTimeString() : 'none');

    if (targetTime && now >= targetTime) {
        console.log('[SW] Time to notify!');
        await sendBreathingNotification();
        // Schedule a new random target after notifying
        const newTarget = generateNextTime();
        await saveTargetTime(newTarget);
        console.log('[SW] New target set for', new Date(newTarget).toLocaleTimeString());
    }

    scheduleNextCheck();
}

// Generate a random time 70-130 minutes from now
function generateNextTime() {
    const mins = Math.floor(Math.random() * 61) + 70; // 70-130
    return Date.now() + mins * 60 * 1000;
}

// ─── IndexedDB helpers ────────────────────────────────────────────────────────
// We use IndexedDB instead of localStorage because SW can't access localStorage

function openDB() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open('breathingApp', 1);
        req.onupgradeneeded = e => {
            e.target.result.createObjectStore('settings');
        };
        req.onsuccess = e => resolve(e.target.result);
        req.onerror = e => reject(e.target.error);
    });
}

async function getTargetTime() {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction('settings', 'readonly');
            const req = tx.objectStore('settings').get('nextNotificationTime');
            req.onsuccess = () => resolve(req.result || null);
            req.onerror = () => reject(req.error);
        });
    } catch (e) {
        console.error('[SW] getTargetTime error:', e);
        return null;
    }
}

async function saveTargetTime(time) {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction('settings', 'readwrite');
            const req = tx.objectStore('settings').put(time, 'nextNotificationTime');
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
        });
    } catch (e) {
        console.error('[SW] saveTargetTime error:', e);
    }
}

// ─── Messages from app.js ─────────────────────────────────────────────────────

self.addEventListener('message', async event => {
    const { type } = event.data;
    console.log('[SW] Message received:', type);

    if (type === 'START_SCHEDULING') {
        // App just enabled notifications - set first target and start checking
        const target = generateNextTime();
        await saveTargetTime(target);
        console.log('[SW] Scheduling started. First notification at', new Date(target).toLocaleTimeString());
        
        // Tell app what the target time is
        event.source.postMessage({ 
            type: 'TARGET_TIME_SET', 
            targetTime: target 
        });
        
        scheduleNextCheck();
    }

    if (type === 'GET_TARGET_TIME') {
        // App is asking what the current target time is (e.g. after refresh)
        const target = await getTargetTime();
        event.source.postMessage({ 
            type: 'TARGET_TIME_SET', 
            targetTime: target 
        });
        scheduleNextCheck();
    }

    if (type === 'RESET') {
        await saveTargetTime(null);
        if (checkTimer) clearTimeout(checkTimer);
        console.log('[SW] Reset complete');
    }
});

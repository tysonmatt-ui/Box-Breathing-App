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

    const allClients = await clients.matchAll({ type: 'window' });
    allClients.forEach(c => c.postMessage({ type: 'SHOW_PROMPT' }));
}

// *** TEST: Check every 30 seconds ***
function scheduleNextCheck() {
    if (checkTimer) clearTimeout(checkTimer);
    checkTimer = setTimeout(runCheck, 30 * 1000); // 30 seconds
    console.log('[SW] Next check in 30 seconds');
}

async function runCheck() {
    const targetTime = await getTargetTime();
    const now = Date.now();

    console.log('[SW] Running check at', new Date().toLocaleTimeString());
    console.log('[SW] Target:', targetTime ? new Date(targetTime).toLocaleTimeString() : 'none');

    if (targetTime && now >= targetTime) {
        console.log('[SW] Time to notify!');
        await sendBreathingNotification();
        const newTarget = generateNextTime();
        await saveTargetTime(newTarget);
        console.log('[SW] New target:', new Date(newTarget).toLocaleTimeString());
    }

    scheduleNextCheck();
}

// *** TEST: Random interval between 1-3 minutes ***
function generateNextTime() {
    const mins = Math.floor(Math.random() * 3) + 1; // 1-3 minutes
    console.log('[SW] Next notification in', mins, 'minutes');
    return Date.now() + mins * 60 * 1000;
}

// ─── IndexedDB helpers ────────────────────────────────────────────────────────

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
        const target = generateNextTime();
        await saveTargetTime(target);
        console.log('[SW] First notification at', new Date(target).toLocaleTimeString());
        event.source.postMessage({ type: 'TARGET_TIME_SET', targetTime: target });
        scheduleNextCheck();
    }

    if (type === 'GET_TARGET_TIME') {
        const target = await getTargetTime();
        event.source.postMessage({ type: 'TARGET_TIME_SET', targetTime: target });
        scheduleNextCheck();
    }

    if (type === 'RESET') {
        await saveTargetTime(null);
        if (checkTimer) clearTimeout(checkTimer);
        console.log('[SW] Reset complete');
    }
});

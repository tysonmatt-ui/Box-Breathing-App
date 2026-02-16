const CACHE_NAME = 'breathing-v5';
const ASSETS = [
    '/Box-Breathing-App/',
    '/Box-Breathing-App/index.html',
    '/Box-Breathing-App/app.js',
    '/Box-Breathing-App/manifest.json',
    '/Box-Breathing-App/icon-192.png',
    '/Box-Breathing-App/icon-512.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        ).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(cached => cached || fetch(event.request))
    );
});

self.addEventListener('push', event => {
    const data = event.data ? event.data.json() : {};
    event.waitUntil(
        self.registration.showNotification(data.title || 'Mindful Breathing', {
            body: data.body || 'Time for a breathing exercise',
            icon: 'icon-192.png',
            tag: 'breathing-reminder',
            renotify: true,
            actions: [
                { action: 'open', title: 'Yes, let\'s breathe' },
                { action: 'dismiss', title: 'Not now' }
            ]
        })
    );
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    if (event.action === 'dismiss') return;
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
            for (const client of clientList) {
                if (client.url.includes('Box-Breathing-App') && 'focus' in client) {
                    client.postMessage({ type: 'SHOW_PROMPT' });
                    return client.focus();
                }
            }
            return clients.openWindow('/Box-Breathing-App/');
        })
    );
});

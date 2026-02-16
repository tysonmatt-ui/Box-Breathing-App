const CACHE_NAME = 'breathing-app-v4';
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

// Handle notification clicks - open or focus the app
self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(clientList => {
                for (let client of clientList) {
                    if (client.url.includes(APP_PATH) && 'focus' in client) {
                        return client.focus();
                    }
                }
                return clients.openWindow(APP_PATH);
            })
    );
});

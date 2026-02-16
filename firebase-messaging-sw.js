// Firebase Messaging Service Worker
// This file MUST be named firebase-messaging-sw.js and placed at the root

importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyB0f6mJZ2qiw5ovrZ5X7wbamsyit-zc0is",
    authDomain: "mindful-breathing-6b0fe.firebaseapp.com",
    projectId: "mindful-breathing-6b0fe",
    storageBucket: "mindful-breathing-6b0fe.firebasestorage.app",
    messagingSenderId: "712095002849",
    appId: "1:712095002849:web:62fe1f703bebe554b707a0"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage(payload => {
    console.log('[FCM SW] Background message received:', payload);

    const { title, body } = payload.notification;

    self.registration.showNotification(title, {
        body,
        icon: '/Box-Breathing-App/icon-192.png',
        badge: '/Box-Breathing-App/icon-192.png',
        tag: 'breathing-reminder',
        requireInteraction: true,
        vibrate: [200, 100, 200]
    });
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(clientList => {
                for (let client of clientList) {
                    if (client.url.includes('/Box-Breathing-App/') && 'focus' in client) {
                        return client.focus();
                    }
                }
                return clients.openWindow('/Box-Breathing-App/');
            })
    );
});

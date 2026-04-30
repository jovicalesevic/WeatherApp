const CACHE_NAME = 'weatherapp-v1';
const APP_SHELL_ASSETS = [
    './',
    './index.html',
    './style.css',
    './manifest.webmanifest',
    './assets/icons/icon.svg',
    './js/app.js',
    './js/config.js',
    './js/i18n.js',
    './js/storage.js',
    './js/weather-api.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL_ASSETS))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') {
        return;
    }

    if (event.request.url.includes('/data/2.5/weather')) {
        event.respondWith(
            fetch(event.request).catch(() => caches.match('./index.html'))
        );
        return;
    }

    event.respondWith(
        caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
});

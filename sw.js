
const CACHE_NAME = 'pwa-cache-v1';
const OFFLINE_URL = '/offline.html';
const urlsToCache = [
  '/',
  '/index.html',
  '/tailwind.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/remixicon/4.6.0/remixicon.min.css',
  'https://fonts.googleapis.com/css2?family=Pacifico&display=swap',
   OFFLINE_URL
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.map(name => name !== CACHE_NAME && caches.delete(name)))
    )
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request).then(response => {
        return response || caches.match(OFFLINE_URL);
      });
    })
  );
});

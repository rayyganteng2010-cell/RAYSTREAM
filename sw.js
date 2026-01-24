/*
  Service Worker sederhana: cache app shell + runtime cache untuk gambar.
  Catatan: ini bukan CDN anti-hacker, ini buat offline-ish + load lebih cepat.
*/

const CACHE_NAME = 'raystream-v1';
const APP_SHELL = [
  '/',
  '/index.html',
  '/home.html',
  '/login.html',
  '/anime.html',
  '/donghua.html',
  '/genre.html',
  '/genresanime.html',
  '/schedule.html',
  '/series.html',
  '/stream.html',
  '/protect.js',
  '/pwa.js',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Cuma handle GET
  if (req.method !== 'GET') return;

  // Network-first untuk HTML biar update kebawa
  const isHTML = req.headers.get('accept')?.includes('text/html');
  if (isHTML) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((hit) => hit || caches.match('/index.html')))
    );
    return;
  }

  // Cache-first untuk aset (gambar/font/js/css)
  const isAsset = ['script', 'style', 'image', 'font'].includes(req.destination);
  if (isAsset) {
    event.respondWith(
      caches.match(req).then((hit) =>
        hit || fetch(req).then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        })
      )
    );
    return;
  }

  // Default: coba cache, lalu network
  event.respondWith(caches.match(req).then((hit) => hit || fetch(req)));
});

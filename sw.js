const CACHE_NAME = 'inmobiliaria-perez-araujo-v2';

const APP_SHELL = [
  './',
  './index.html',
  './pnl-a8f3k2m9.html',
  './publicar.html',
  './css/styles.css',
  './css/admin.css',
  './js/app.js',
  './js/admin.js',
  './js/datos.js',
  './js/publicar.js',
  './js/pwa.js',
  './js/firebase-app.js',
  './image/logo/PerezAraujoLogo.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
          return undefined;
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  const path = url.pathname || '';

  /* Página principal y app.js: red primero, para ver nuevas publicaciones sin borrar caché */
  if (request.mode === 'navigate' && (path === '/' || path === '/index.html' || path.endsWith('/'))) {
    event.respondWith(
      fetch(request)
        .then((res) => res.ok ? res : caches.match('./index.html'))
        .catch(() => caches.match('./index.html'))
    );
    return;
  }
  if (path === '/js/app.js' || path.endsWith('/js/app.js')) {
    event.respondWith(
      fetch(request)
        .then((res) => (res.ok ? res : caches.match(request)))
        .catch(() => caches.match(request))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        return cached;
      }
      return fetch(request).catch(() => {
        if (request.mode === 'navigate') {
          if (path.includes('pnl-a8f3k2m9')) {
            return caches.match('./pnl-a8f3k2m9.html');
          }
          return caches.match('./index.html');
        }
        return undefined;
      });
    })
  );
});


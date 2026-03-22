const CACHE_NAME = 'inmobiliaria-perez-araujo-v3';

const APP_SHELL = [
  './',
  './index.html',
  './publicar.html',
  './css/styles.css',
  './js/app.js',
  './js/datos.js',
  './js/publicar.js',
  './js/pwa.js',
  './js/firebase-app.js',
  './js/i18n.js',
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
          return caches.match('./index.html');
        }
        return undefined;
      });
    })
  );
});


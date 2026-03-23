const CACHE_NAME = 'inmobiliaria-perez-araujo-v20';

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
  './js/video-embed.js',
  './image/logo/LogoOriginalInmobiliariaPerezAraujo.png',
  './image/fondo/FondoHeader.png'
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

/** Opciones de fetch: sin esto Chrome reutiliza caché HTTP y parece que “nunca actualiza”. */
function fetchAlwaysRevalidate(request) {
  if (typeof Request !== 'undefined' && request instanceof Request) {
    return fetch(new Request(request, { cache: 'no-cache' }));
  }
  return fetch(request, { cache: 'no-cache' });
}

/** Red primero: al estar online ves cambios al recargar; offline se usa la caché. */
function networkFirst(request) {
  return fetchAlwaysRevalidate(request)
    .then((res) => {
      if (res.ok && request.method === 'GET') {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, copy).catch(() => {});
        });
      }
      if (request.mode === 'navigate' && !res.ok) {
        return caches.match('./index.html');
      }
      return res;
    })
    .catch(() =>
      caches.match(request).then((cached) => {
        if (cached) return cached;
        if (request.mode === 'navigate') {
          return caches.match('./index.html');
        }
        return undefined;
      })
    );
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(networkFirst(request));
});


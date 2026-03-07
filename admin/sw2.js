const CACHE_NAME = 'inmobiliaria-admin-v1';

const APP_SHELL = [
  '/admin/',
  '/admin/pnl-a8f3k2m9.html',
  '/css/styles.css',
  '/css/admin.css',
  '/js/datos.js',
  '/js/admin.js',
  '/js/colombia-data.js',
  '/js/PaisesBanderas-data.js',
  '/js/firebase-app.js',
  '/image/logo/PerezAraujoLogo.png'
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

  /* Solo intervenir en rutas del panel (/admin/) */
  if (!path.startsWith('/admin/')) {
    return;
  }

  /* Página del panel: red primero para tener sesión actualizada */
  if (request.mode === 'navigate' && (path === '/admin/' || path === '/admin/pnl-a8f3k2m9.html')) {
    event.respondWith(
      fetch(request)
        .then((res) => res.ok ? res : caches.match('/admin/pnl-a8f3k2m9.html'))
        .catch(() => caches.match('/admin/pnl-a8f3k2m9.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).catch(() => {
        if (request.mode === 'navigate' && path.startsWith('/admin/')) {
          return caches.match('/admin/pnl-a8f3k2m9.html');
        }
        return undefined;
      });
    })
  );
});

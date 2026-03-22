(function () {
  'use strict';

  var deferredPrompt = null;

  function isIos() {
    return /iphone|ipad|ipod/i.test(window.navigator.userAgent || '');
  }

  function isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
  }

  function isLocalDevHost() {
    var h = (typeof location !== 'undefined' && location.hostname) || '';
    return h === 'localhost' || h === '127.0.0.1' || h === '[::1]';
  }

  function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;

    /* Si aún no hay controlador, el primer controllerchange es la instalación (no recargar). El siguiente = actualización. */
    var ignoreNextControllerChange = !navigator.serviceWorker.controller;
    navigator.serviceWorker.addEventListener('controllerchange', function () {
      if (ignoreNextControllerChange) {
        ignoreNextControllerChange = false;
        return;
      }
      window.location.reload();
    });

    function checkUpdates(reg) {
      if (reg && typeof reg.update === 'function') {
        reg.update().catch(function () {});
      }
    }

    window.addEventListener('load', function () {
      /* En localhost no registramos SW: F5 basta para ver cambios. */
      if (isLocalDevHost()) return;

      /* updateViaCache: 'none' evita que Chrome sirva un sw.js viejo desde caché HTTP. */
      navigator.serviceWorker
        .register('./sw.js', { updateViaCache: 'none' })
        .then(function (reg) {
          checkUpdates(reg);
          /* Al volver a la pestaña, comprobar si hay SW nuevo (Chrome a veces tarda). */
          document.addEventListener('visibilitychange', function () {
            if (!document.hidden) checkUpdates(reg);
          });
        })
        .catch(function (err) {
          // eslint-disable-next-line no-console
          console.warn('SW registro falló', err);
        });
    });
  }

  function setupBeforeInstallPrompt() {
    var installBtn = document.getElementById('install-btn');
    if (!installBtn) return;

    /* Si ya está instalada (abierta como app), no mostrar el botón */
    if (isStandalone()) {
      installBtn.style.display = 'none';
      return;
    }

    window.addEventListener('beforeinstallprompt', function (event) {
      event.preventDefault();
      deferredPrompt = event;
      installBtn.style.display = '';
    });

    installBtn.addEventListener('click', function () {
      if (deferredPrompt) {
        installBtn.disabled = true;
        deferredPrompt.prompt();
        deferredPrompt.userChoice.finally(function () {
          deferredPrompt = null;
          installBtn.disabled = false;
        });
      } else {
        var isAndroid = /android/i.test(window.navigator.userAgent || '');
        var ta = window.I18n && typeof I18n.t === 'function' ? I18n.t.bind(I18n) : function (k) { return k; };
        if (isAndroid) {
          window.alert(ta('pwa.alert_android'));
        } else {
          window.alert(ta('pwa.alert_other'));
        }
      }
    });

    /* Ocultar botón hasta que beforeinstallprompt dispare (igual que en el panel) */
    installBtn.style.display = 'none';
  }

  function setupIosBanner() {
    var banner = document.getElementById('ios-install-banner');
    var close = banner ? banner.querySelector('[data-ios-banner-close]') : null;
    if (!banner) return;

    function hide() {
      banner.classList.remove('ios-install-banner--show');
      banner.setAttribute('aria-hidden', 'true');
    }

    if (close) {
      close.addEventListener('click', function () {
        hide();
      });
    }

    /* Ocultar si no es iOS o si ya está instalada (abierta como app) */
    if (!isIos() || isStandalone()) {
      hide();
      return;
    }

    banner.classList.add('ios-install-banner--show');
    banner.setAttribute('aria-hidden', 'false');
  }

  function init() {
    registerServiceWorker();
    setupBeforeInstallPrompt();
    setupIosBanner();

    // Ocultar el botón de instalar en iOS (solo mostrar banner)
    var installBtn = document.getElementById('install-btn');
    if (installBtn && isIos()) {
      installBtn.style.display = 'none';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();


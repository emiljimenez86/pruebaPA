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

  function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function () {
        navigator.serviceWorker.register('./sw.js').catch(function (err) {
          // eslint-disable-next-line no-console
          console.warn('SW registro falló', err);
        });
      });
    }
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
        if (isAndroid) {
          window.alert('No se puede usar el instalador automático aquí.\n\nPara añadir al inicio: menú del navegador (⋮) → «Añadir a pantalla de inicio» o «Instalar aplicación».');
        } else {
          window.alert('Instalación disponible en Chrome para Android. En este dispositivo usa la web en el navegador.');
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


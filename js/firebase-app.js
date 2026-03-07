/**
 * Inicializa Firebase (Auth y Firestore) solo si existe firebase-config.js con projectId.
 * Si no hay config, window.FIREBASE_READY queda false y la app usa datos.js.
 */
(function () {
  'use strict';

  window.FIREBASE_READY = false;
  window.FIREBASE_AUTH = null;
  window.FIREBASE_DB = null;

  var config = window.FIREBASE_CONFIG;
  if (!config || !config.projectId || config.projectId === 'tu-proyecto') {
    return;
  }

  if (typeof firebase === 'undefined') {
    return;
  }

  try {
    firebase.initializeApp(config);
    window.FIREBASE_AUTH = firebase.auth();
    window.FIREBASE_DB = firebase.firestore();
    window.FIREBASE_READY = true;
  } catch (e) {
    console.warn('Firebase init error:', e);
  }
})();

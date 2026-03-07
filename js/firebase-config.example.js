/**
 * Configuración de Firebase (ejemplo).
 *
 * Para publicar propiedades directamente desde el panel:
 * 1. Copia este archivo y renómbralo a firebase-config.js (en la misma carpeta js/).
 * 2. Crea un proyecto en https://console.firebase.google.com
 * 3. Activa Firestore y Authentication (Email/Password).
 * 4. En el proyecto: Configuración del proyecto → Tus apps → Añadir app (Web) → copia el objeto firebaseConfig.
 * 5. Sustituye abajo los valores de ejemplo por los de tu proyecto.
 *
 * No subas firebase-config.js al repositorio (está en .gitignore).
 */
window.FIREBASE_CONFIG = {
  apiKey: "TU_API_KEY",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

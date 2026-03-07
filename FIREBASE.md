# Configuración de Firebase para publicación directa

Con Firebase configurado, las propiedades que publiques o elimines en el panel se ven en la web al instante, sin tocar `js/datos.js`.

## Pasos

### 1. Crear proyecto en Firebase

1. Entra en [Firebase Console](https://console.firebase.google.com).
2. **Crear proyecto** (o usar uno existente).
3. En el proyecto:
   - **Build → Firestore Database → Create database** (modo producción).
   - **Build → Authentication → Get started → Sign-in method**: activa **Email/Password**.

### 2. Registrar la app web y obtener la configuración

1. En el proyecto: **Configuración del proyecto** (engranaje) → **General**.
2. En **Tus apps** → **Añadir app** → **Web** (`</>`).
3. Registra la app (nombre opcional, ej. "Inmobiliaria").
4. Copia el objeto `firebaseConfig` que te muestra.

### 3. Configurar el proyecto local

1. En la carpeta `js/`, copia `firebase-config.example.js` y renómbralo a **`firebase-config.js`**.
2. Abre `firebase-config.js` y sustituye los valores de ejemplo por los de tu `firebaseConfig` (apiKey, authDomain, projectId, etc.).
3. **No subas** `firebase-config.js` al repositorio (está en `.gitignore`).

### 4. Reglas de Firestore

En Firebase Console → **Firestore Database → Reglas**, usa estas reglas (lectura pública, escritura solo si estás autenticado):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /propiedades/{docId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null;
    }
  }
}
```

Pulsa **Publicar**.

### 5. Usuario administrador

1. **Authentication → Users → Add user**.
2. Indica un **correo** y **contraseña** (guárdalos).
3. Esa misma cuenta la usas en el panel: **pnl-a8f3k2m9.html** → Iniciar sesión con ese correo y contraseña.

### 6. Probar

1. Abre **pnl-a8f3k2m9.html** en el navegador.
2. Deberías ver el formulario de inicio de sesión (correo y contraseña).
3. Inicia sesión con el usuario que creaste.
4. Añade una propiedad: se guarda en Firestore y aparece en la web al recargar **index.html**.

### 7. Sitio en GitHub Pages

Para que la página pública cargue las propiedades desde Firestore en **GitHub Pages**, el archivo `js/firebase-config.js` tiene que estar en el repositorio (porque GitHub Pages solo publica lo que está en el repo). En `.gitignore` está comentada la línea que lo ignoraba: haz **commit** de `firebase-config.js` y **push**. La configuración web de Firebase (apiKey, projectId, etc.) puede ser pública; la seguridad la dan las reglas de Firestore (solo usuarios autenticados pueden escribir).

---

## Sin Firebase

Si no creas `firebase-config.js` o no configuras Firebase:

- La **web** sigue usando las propiedades de `js/datos.js`.
- El **panel** muestra un aviso con instrucciones y no permite entrar (no hay contraseña local; el acceso es solo con Firebase Auth).

## Índices en Firestore

Si al cargar propiedades en la web aparece un error que pide crear un índice, abre el enlace que muestra Firebase en la consola del navegador y créalo desde ahí (suele ser por `orderBy('titulo')` en la colección `propiedades`).

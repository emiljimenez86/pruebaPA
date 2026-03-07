(function () {
  'use strict';

  var listadoEl = document.getElementById('admin-listado');
  var formNueva = document.getElementById('form-nueva-propiedad');
  var formLogin = document.getElementById('form-login');
  var loginPanel = document.getElementById('admin-login');
  var adminPanel = document.getElementById('admin-panel');
  var avisoFirebase = document.getElementById('login-firebase-aviso');
  var exportarBox = document.getElementById('admin-exportar-box');
  var exportarText = document.getElementById('admin-exportar-text');

  /** Cuando Firebase está listo, aquí se guardan las propiedades del snapshot (para listado y export). */
  var propiedadesFirestore = [];

  function ocultar(el) { if (el) el.classList.add('oculto'); }
  function mostrar(el) { if (el) el.classList.remove('oculto'); }

  function getPropiedades() {
    if (window.FIREBASE_READY && propiedadesFirestore.length >= 0) {
      return propiedadesFirestore;
    }
    var p = window.PROPIEDADES;
    if (!Array.isArray(p)) window.PROPIEDADES = [];
    return window.PROPIEDADES;
  }

  function escapeHtml(s) {
    if (!s) return '';
    var div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  /** Convierte enlace de Google Drive "compartir" al formato que sirve en <img src>.
   * Usamos thumbnail para evitar 403 cuando se carga desde otro sitio. */
  function urlImagenDrive(url, size) {
    if (!url || typeof url !== 'string') return url;
    var u = url.trim();
    var id = null;
    var m = u.match(/drive\.google\.com\/file\/d\/([^/]+)/);
    if (m) id = m[1];
    else {
      m = u.match(/drive\.google\.com\/open\?id=([^&]+)/);
      if (m) id = m[1];
    }
    if (id) {
      var sz = (size && String(size).match(/^[wm]\d+$/)) ? size : 'w400';
      return 'https://drive.google.com/thumbnail?id=' + id + '&sz=' + sz;
    }
    return u;
  }

  function initLogin() {
    if (!window.FIREBASE_READY) {
      if (avisoFirebase) mostrar(avisoFirebase);
      if (formLogin) ocultar(formLogin);
      return;
    }

    if (avisoFirebase) ocultar(avisoFirebase);
    if (formLogin) mostrar(formLogin);

    var auth = window.FIREBASE_AUTH;
    if (!auth) return;

    auth.onAuthStateChanged(function (user) {
      if (user) {
        ocultar(loginPanel);
        mostrar(adminPanel);
        initPanel();
      } else {
        mostrar(loginPanel);
        ocultar(adminPanel);
      }
    });

    if (formLogin) {
      formLogin.addEventListener('submit', function (e) {
        e.preventDefault();
        var email = document.getElementById('admin-email');
        var password = document.getElementById('admin-password');
        var err = document.getElementById('login-error');
        if (!email || !password || !err) return;

        err.textContent = '';
        ocultar(err);
        auth.signInWithEmailAndPassword(email.value.trim(), password.value)
          .then(function () {
            email.value = '';
            password.value = '';
          })
          .catch(function (error) {
            err.textContent = error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found'
              ? 'Correo o contraseña incorrectos.'
              : (error.message || 'Error al iniciar sesión.');
            mostrar(err);
          });
      });
    }

    var passwordToggle = document.getElementById('admin-password-toggle');
    var passwordInput = document.getElementById('admin-password');
    if (passwordToggle && passwordInput) {
      var iconShow = passwordToggle.querySelector('.admin-login__password-icon--show');
      var iconHide = passwordToggle.querySelector('.admin-login__password-icon--hide');
      passwordToggle.addEventListener('click', function () {
        var isPassword = passwordInput.type === 'password';
        passwordInput.type = isPassword ? 'text' : 'password';
        passwordToggle.setAttribute('aria-label', isPassword ? 'Ocultar contraseña' : 'Mostrar contraseña');
        passwordToggle.setAttribute('title', isPassword ? 'Ocultar contraseña' : 'Mostrar contraseña');
        if (iconShow) iconShow.classList.toggle('oculto', isPassword);
        if (iconHide) iconHide.classList.toggle('oculto', !isPassword);
      });
    }

    var btnCerrar = document.getElementById('admin-cerrar');
    if (btnCerrar) {
      btnCerrar.addEventListener('click', function () {
        auth.signOut();
        mostrar(loginPanel);
        ocultar(adminPanel);
      });
    }
  }

  function initPaisesAdmin() {
    var list = document.getElementById('adm-pais-list');
    var triggerContent = document.getElementById('adm-pais-trigger-content');
    var inputPais = document.getElementById('adm-pais');
    var trigger = document.getElementById('adm-pais-trigger');
    var blockColombia = document.getElementById('adm-colombia-ubicacion');
    var paises = window.PAISES_BANDERAS;
    if (!list || !triggerContent || !inputPais || !trigger || !Array.isArray(paises)) return;

    list.innerHTML = '';
    paises.forEach(function (p) {
      var item = document.createElement('div');
      item.className = 'filtro-pais-item';
      item.setAttribute('role', 'option');
      item.dataset.country = p.country;
      item.dataset.flag = p.flag || '';
      item.innerHTML = '<img src="' + (p.flag || '').replace(/"/g, '&quot;') + '" alt="" class="filtro-pais-flag" width="24" height="18" aria-hidden="true"><span>' + escapeHtml(p.country) + '</span>';
      list.appendChild(item);
    });

    inputPais.value = 'Colombia';
    var colombia = paises.filter(function (p) { return p.country === 'Colombia'; })[0];
    if (colombia && triggerContent) {
      triggerContent.innerHTML = '<img src="' + (colombia.flag || '').replace(/"/g, '&quot;') + '" alt="" class="filtro-pais-flag" width="24" height="18" aria-hidden="true"><span>Colombia</span>';
    }
    if (blockColombia) blockColombia.classList.remove('oculto');

    list.querySelectorAll('.filtro-pais-item').forEach(function (item) {
      item.addEventListener('click', function () {
        var country = item.dataset.country;
        var flag = item.dataset.flag || '';
        inputPais.value = country;
        triggerContent.innerHTML = '<img src="' + flag.replace(/"/g, '&quot;') + '" alt="" class="filtro-pais-flag" width="24" height="18" aria-hidden="true"><span>' + escapeHtml(country) + '</span>';
        list.classList.add('oculto');
        trigger.setAttribute('aria-expanded', 'false');
        if (blockColombia) {
          if (country === 'Colombia') {
            blockColombia.classList.remove('oculto');
            initDepartamentos();
          } else {
            blockColombia.classList.add('oculto');
            document.getElementById('adm-departamento').value = '';
            document.getElementById('adm-municipio').innerHTML = '<option value="">Seleccione</option>';
          }
        }
      });
    });

    trigger.addEventListener('click', function () {
      var abierto = !list.classList.contains('oculto');
      list.classList.toggle('oculto', abierto);
      trigger.setAttribute('aria-expanded', !abierto);
    });
    document.addEventListener('click', function (e) {
      var wrap = document.getElementById('adm-pais-wrap');
      if (wrap && !wrap.contains(e.target)) {
        list.classList.add('oculto');
        trigger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  function initDepartamentos() {
    var dpto = document.getElementById('adm-departamento');
    var mun = document.getElementById('adm-municipio');
    if (!dpto || !mun) return;
    var mapa = window.CO_DEPARTAMENTOS;
    if (!mapa && window.CO_DEPARTAMENTOS_LIST && Array.isArray(window.CO_DEPARTAMENTOS_LIST)) {
      mapa = {};
      window.CO_DEPARTAMENTOS_LIST.forEach(function (item) {
        if (item && item.departamento) mapa[item.departamento] = item.ciudades || [];
      });
      window.CO_DEPARTAMENTOS = mapa;
    }
    if (!mapa) return;
    var deptos = Object.keys(mapa).sort();
    dpto.innerHTML = '<option value="">Seleccione</option>';
    deptos.forEach(function (d) {
      var opt = document.createElement('option');
      opt.value = d;
      opt.textContent = d;
      dpto.appendChild(opt);
    });
    dpto.addEventListener('change', function () {
      var d = dpto.value;
      var muns = d ? (mapa[d] || []) : [];
      mun.innerHTML = '<option value="">Seleccione</option>';
      muns.forEach(function (m) {
        var opt = document.createElement('option');
        opt.value = m;
        opt.textContent = m;
        mun.appendChild(opt);
      });
    });
  }

  function escapeJs(s) {
    if (s == null) return 'null';
    var t = String(s);
    return '"' + t.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r') + '"';
  }

  function generarDatosJs() {
    var arr = getPropiedades();
    var lineas = ['window.PROPIEDADES = ['];
    arr.forEach(function (p, i) {
      var id = p.id != null ? p.id : (i + 1);
      if (typeof id === 'string' && id.length > 0) id = i + 1;
      var props = [
        '    id: ' + (typeof id === 'number' ? id : (i + 1)),
        '    titulo: ' + escapeJs(p.titulo),
        '    tipo: ' + escapeJs(p.tipo),
        '    pais: ' + escapeJs(p.pais != null ? p.pais : 'Colombia'),
        '    ciudad: ' + escapeJs(p.ciudad || ''),
        '    municipio: ' + escapeJs(p.municipio || ''),
        '    precio: ' + escapeJs(p.precio),
        '    descripcion: ' + escapeJs(p.descripcion),
        '    imagen: ' + escapeJs(p.imagen || (p.imagenes && p.imagenes[0]) || '')
      ];
      if (p.imagenes && Array.isArray(p.imagenes) && p.imagenes.length > 0) {
        props.push('    imagenes: [' + p.imagenes.map(function (url) { return escapeJs(url); }).join(', ') + ']');
      }
      if (p.video) props.push('    video: ' + escapeJs(p.video));
      if (p.arriendoPorDia === true) props.push('    arriendoPorDia: true');
      var block = '  {\n' + props.join(',\n') + '\n  }' + (i < arr.length - 1 ? ',' : '');
      lineas.push(block);
    });
    lineas.push('];');
    return lineas.join('\n');
  }

  function renderListado() {
    if (!listadoEl) return;
    var arr = getPropiedades();
    listadoEl.innerHTML = '';
    if (arr.length === 0) {
      listadoEl.innerHTML = '<p class="admin-vacio">No hay propiedades. Añade una arriba.</p>';
      return;
    }
    arr.forEach(function (p, index) {
      var div = document.createElement('div');
      div.className = 'admin-item';
      var id = p.id != null ? String(p.id) : String(index);
      var img = p.imagen ? '<img src="' + urlImagenDrive(p.imagen).replace(/"/g, '&quot;') + '" alt="" class="admin-item__img" referrerpolicy="no-referrer">' : '<span class="admin-item__sin-img">Sin imagen</span>';
      var pais = p.pais != null ? p.pais : 'Colombia';
      div.innerHTML =
        '<div class="admin-item__preview">' + img + '</div>' +
        '<div class="admin-item__info">' +
          '<strong>' + escapeHtml(p.titulo || 'Sin título') + '</strong> — ' + (p.tipo === 'venta' ? 'Venta' : 'Arriendo') + (p.arriendoPorDia ? ' <span class="admin-item__por-dia">Por día</span>' : '') + '<br>' +
          pais + (p.ciudad ? ', ' + p.ciudad : '') + (p.municipio ? ', ' + p.municipio : '') + (p.precio ? ' · ' + p.precio : '') +
          (p.video ? ' <span class="admin-item__video">🎬 Video</span>' : '') +
        '</div>' +
        '<button type="button" class="btn btn--sec admin-item__edit" data-id="' + escapeHtml(id) + '" data-index="' + index + '">Editar</button>' +
        '<button type="button" class="btn btn--danger admin-item__del" data-id="' + escapeHtml(id) + '">Eliminar</button>';
      listadoEl.appendChild(div);
    });
  }

  function borrarPorId(id) {
    if (window.FIREBASE_READY && window.FIREBASE_DB) {
      firebase.firestore().collection('propiedades').doc(id).delete()
        .catch(function (err) {
          alert('Error al eliminar: ' + (err.message || err));
        });
      return;
    }
    var arr = window.PROPIEDADES;
    if (!Array.isArray(arr)) return;
    var idx = -1;
    for (var i = 0; i < arr.length; i++) {
      if (String(arr[i].id) === String(id)) { idx = i; break; }
    }
    if (idx >= 0) {
      arr.splice(idx, 1);
      renderListado();
    }
  }

  function abrirEdicion(p) {
    var tituloEl = document.getElementById('adm-titulo');
    var tipoEl = document.getElementById('adm-tipo');
    var paisInput = document.getElementById('adm-pais');
    var triggerContent = document.getElementById('adm-pais-trigger-content');
    var dptoEl = document.getElementById('adm-departamento');
    var munEl = document.getElementById('adm-municipio');
    var precioEl = document.getElementById('adm-precio');
    var descEl = document.getElementById('adm-descripcion');
    var imagenesEl = document.getElementById('adm-imagenes');
    var videoEl = document.getElementById('adm-video');
    var arriendoPorDiaCheck = document.getElementById('adm-arriendo-por-dia');
    var submitBtn = document.getElementById('adm-btn-submit');
    var cancelBtn = document.getElementById('adm-btn-cancelar-edicion');
    if (!tituloEl || !tipoEl) return;

    tituloEl.value = p.titulo || '';
    tipoEl.value = p.tipo || 'venta';
    paisInput.value = p.pais != null ? p.pais : 'Colombia';

    var paises = window.PAISES_BANDERAS || [];
    var paisObj = paises.filter(function (x) { return x.country === (p.pais != null ? p.pais : 'Colombia'); })[0];
    if (triggerContent && paisObj) {
      triggerContent.innerHTML = '<img src="' + (paisObj.flag || '').replace(/"/g, '&quot;') + '" alt="" class="filtro-pais-flag" width="24" height="18" aria-hidden="true"><span>' + escapeHtml(paisObj.country) + '</span>';
    }

    var blockColombia = document.getElementById('adm-colombia-ubicacion');
    if (blockColombia && (p.pais === 'Colombia' || !p.pais)) {
      blockColombia.classList.remove('oculto');
      var mapa = window.CO_DEPARTAMENTOS;
      if (mapa && dptoEl && munEl) {
        var deptos = Object.keys(mapa).sort();
        dptoEl.innerHTML = '<option value="">Seleccione</option>';
        deptos.forEach(function (d) {
          var opt = document.createElement('option');
          opt.value = d;
          opt.textContent = d;
          dptoEl.appendChild(opt);
        });
        dptoEl.value = p.ciudad || '';
        var muns = (p.ciudad && mapa[p.ciudad]) ? mapa[p.ciudad] : [];
        munEl.innerHTML = '<option value="">Seleccione</option>';
        muns.forEach(function (m) {
          var opt = document.createElement('option');
          opt.value = m;
          opt.textContent = m;
          munEl.appendChild(opt);
        });
        munEl.value = p.municipio || '';
      }
    } else if (blockColombia) {
      blockColombia.classList.add('oculto');
    }

    precioEl.value = p.precio || '';
    descEl.value = p.descripcion || '';
    imagenesEl.value = (p.imagenes && Array.isArray(p.imagenes)) ? p.imagenes.join('\n') : (p.imagen ? p.imagen : '');
    videoEl.value = p.video || '';
    if (arriendoPorDiaCheck) arriendoPorDiaCheck.checked = !!(p.tipo === 'arriendo' && p.arriendoPorDia);

    var arriendoWrap = document.getElementById('adm-arriendo-por-dia-wrap');
    if (tipoEl.value === 'arriendo' && arriendoWrap) arriendoWrap.classList.remove('oculto');

    window._adminEditingId = p.id;
    if (submitBtn) submitBtn.textContent = 'Guardar cambios';
    if (cancelBtn) cancelBtn.classList.remove('oculto');
    if (tituloEl) tituloEl.focus();
  }

  function cancelarEdicion() {
    window._adminEditingId = null;
    var submitBtn = document.getElementById('adm-btn-submit');
    var cancelBtn = document.getElementById('adm-btn-cancelar-edicion');
    if (formNueva) formNueva.reset();
    var paisInput = document.getElementById('adm-pais');
    if (paisInput) paisInput.value = 'Colombia';
    var colombia = (window.PAISES_BANDERAS || []).filter(function (x) { return x.country === 'Colombia'; })[0];
    var tc = document.getElementById('adm-pais-trigger-content');
    if (tc && colombia) tc.innerHTML = '<img src="' + (colombia.flag || '').replace(/"/g, '&quot;') + '" alt="" class="filtro-pais-flag" width="24" height="18" aria-hidden="true"><span>Colombia</span>';
    var dpto = document.getElementById('adm-departamento');
    var mun = document.getElementById('adm-municipio');
    if (dpto) dpto.value = '';
    if (mun) mun.innerHTML = '<option value="">Seleccione</option>';
    var wrap = document.getElementById('adm-arriendo-por-dia-wrap');
    var check = document.getElementById('adm-arriendo-por-dia');
    if (wrap) wrap.classList.add('oculto');
    if (check) check.checked = false;
    if (submitBtn) submitBtn.textContent = 'Añadir propiedad';
    if (cancelBtn) cancelBtn.classList.add('oculto');
  }

  function initPanel() {
    initPaisesAdmin();
    initDepartamentos();

    var tipoSelect = document.getElementById('adm-tipo');
    var arriendoPorDiaWrap = document.getElementById('adm-arriendo-por-dia-wrap');
    var arriendoPorDiaCheck = document.getElementById('adm-arriendo-por-dia');
    if (tipoSelect && arriendoPorDiaWrap) {
      function toggleArriendoPorDia() {
        if (tipoSelect.value === 'arriendo') {
          arriendoPorDiaWrap.classList.remove('oculto');
        } else {
          arriendoPorDiaWrap.classList.add('oculto');
          if (arriendoPorDiaCheck) arriendoPorDiaCheck.checked = false;
        }
      }
      tipoSelect.addEventListener('change', toggleArriendoPorDia);
      toggleArriendoPorDia();
    }

    if (window.FIREBASE_READY && window.FIREBASE_DB) {
      var db = window.FIREBASE_DB;
      db.collection('propiedades').orderBy('titulo').onSnapshot(function (snapshot) {
        propiedadesFirestore = [];
        snapshot.docs.forEach(function (doc) {
          var d = doc.data();
          var o = {
            id: doc.id,
            titulo: d.titulo || '',
            tipo: d.tipo || 'venta',
            pais: d.pais != null ? d.pais : 'Colombia',
            ciudad: d.ciudad || '',
            municipio: d.municipio || '',
            precio: d.precio || 'Consultar',
            descripcion: d.descripcion || '',
            imagen: (d.imagenes && d.imagenes[0]) || d.imagen || '',
            imagenes: Array.isArray(d.imagenes) ? d.imagenes : (d.imagen ? [d.imagen] : [])
          };
          if (d.video) o.video = d.video;
          if (d.arriendoPorDia === true) o.arriendoPorDia = true;
          propiedadesFirestore.push(o);
        });
        renderListado();
      });
    } else {
      propiedadesFirestore = [];
      renderListado();
    }

    if (listadoEl && !listadoEl._adminDelegation) {
      listadoEl._adminDelegation = true;
      listadoEl.addEventListener('click', function (e) {
        var btn = e.target;
        if (btn && btn.classList && btn.classList.contains('admin-item__del')) {
          e.preventDefault();
          e.stopPropagation();
          var id = btn.getAttribute('data-id');
          if (id != null) borrarPorId(id);
        }
        if (btn && btn.classList && btn.classList.contains('admin-item__edit')) {
          e.preventDefault();
          e.stopPropagation();
          var idx = btn.getAttribute('data-index');
          var arr = getPropiedades();
          var p = idx != null && arr[parseInt(idx, 10)] ? arr[parseInt(idx, 10)] : null;
          if (p) abrirEdicion(p);
        }
      });
    }

    if (formNueva) {
      formNueva.removeEventListener('submit', formNueva._submitHandler);
      formNueva._submitHandler = function (e) {
        e.preventDefault();
        var titulo = (document.getElementById('adm-titulo').value || '').trim();
        var tipo = document.getElementById('adm-tipo').value;
        var pais = (document.getElementById('adm-pais').value || '').trim();
        var departamento = (document.getElementById('adm-departamento').value || '').trim();
        var municipio = (document.getElementById('adm-municipio').value || '').trim();
        var precio = (document.getElementById('adm-precio').value || '').trim();
        var descripcion = (document.getElementById('adm-descripcion').value || '').trim();
        var imagenesRaw = (document.getElementById('adm-imagenes').value || '').trim();
        var videoRaw = (document.getElementById('adm-video').value || '').trim();
        var arriendoPorDia = (document.getElementById('adm-arriendo-por-dia') && document.getElementById('adm-arriendo-por-dia').checked) && (tipo === 'arriendo');

        if (pais === 'Colombia' && (!departamento || !municipio)) {
          alert('Para Colombia debes seleccionar Departamento y Municipio.');
          return;
        }

        var urls = imagenesRaw.split(/\n/).map(function (s) { return s.trim(); }).filter(Boolean);
        var imagen = urls[0] || '';
        var imagenes = urls.length ? urls : (imagen ? [imagen] : []);

        var video = '';
        if (videoRaw) {
          if (videoRaw.indexOf('youtu.be/') !== -1) {
            video = 'https://www.youtube.com/watch?v=' + videoRaw.split('youtu.be/')[1].split('?')[0].split('&')[0];
          } else {
            var m = videoRaw.match(/[?&]v=([^&]+)/);
            video = m ? 'https://www.youtube.com/watch?v=' + m[1] : videoRaw;
          }
        }

        var data = {
          titulo: titulo,
          tipo: tipo || 'venta',
          pais: pais || 'Colombia',
          ciudad: departamento,
          municipio: municipio,
          precio: precio || 'Consultar',
          descripcion: descripcion,
          imagen: imagen,
          imagenes: imagenes
        };
        if (video) data.video = video;
        if (arriendoPorDia) data.arriendoPorDia = true;

        var editingId = window._adminEditingId;

        if (window.FIREBASE_READY && window.FIREBASE_DB) {
          if (editingId) {
            window.FIREBASE_DB.collection('propiedades').doc(editingId).update(data)
              .then(function () {
                cancelarEdicion();
              })
              .catch(function (err) {
                alert('Error al actualizar: ' + (err.message || err));
              });
          } else {
            window.FIREBASE_DB.collection('propiedades').add(data)
              .then(function () {
                formNueva.reset();
                resetPaisForm();
              })
              .catch(function (err) {
                alert('Error al publicar: ' + (err.message || err));
              });
          }
        } else {
          if (editingId != null) {
            var arr = getPropiedades();
            for (var i = 0; i < arr.length; i++) {
              if (String(arr[i].id) === String(editingId)) {
                data.id = arr[i].id;
                arr[i] = data;
                break;
              }
            }
            renderListado();
            cancelarEdicion();
          } else {
            var arr = getPropiedades();
            var maxId = 0;
            arr.forEach(function (p) { var n = parseInt(p.id, 10); if (!isNaN(n) && n > maxId) maxId = n; });
            data.id = maxId + 1;
            arr.push(data);
            renderListado();
            formNueva.reset();
            resetPaisForm();
          }
        }
      };
      formNueva.addEventListener('submit', formNueva._submitHandler);
    }

    var cancelBtnEdit = document.getElementById('adm-btn-cancelar-edicion');
    if (cancelBtnEdit) cancelBtnEdit.addEventListener('click', cancelarEdicion);

    function resetPaisForm() {
      document.getElementById('adm-pais').value = 'Colombia';
      var colombia = (window.PAISES_BANDERAS || []).filter(function (p) { return p.country === 'Colombia'; })[0];
      var tc = document.getElementById('adm-pais-trigger-content');
      if (tc && colombia) tc.innerHTML = '<img src="' + (colombia.flag || '').replace(/"/g, '&quot;') + '" alt="" class="filtro-pais-flag" width="24" height="18" aria-hidden="true"><span>Colombia</span>';
      document.getElementById('adm-departamento').value = '';
      document.getElementById('adm-municipio').innerHTML = '<option value="">Seleccione</option>';
      var wrap = document.getElementById('adm-arriendo-por-dia-wrap');
      var check = document.getElementById('adm-arriendo-por-dia');
      if (wrap) wrap.classList.add('oculto');
      if (check) check.checked = false;
    }

    var btnExportar = document.getElementById('btn-exportar');
    if (btnExportar) {
      btnExportar.onclick = function () {
        exportarText.value = generarDatosJs();
        mostrar(exportarBox);
        exportarText.select();
      };
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLogin);
  } else {
    initLogin();
  }
})();

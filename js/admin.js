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

  function formatPrecio(precioRaw) {
    if (precioRaw == null) return 'Consultar';
    var s = String(precioRaw).trim();
    if (!s) return 'Consultar';
    if (!/\d/.test(s)) return s;
    var idxBarra = s.indexOf('/');
    var sufijo = '';
    if (idxBarra !== -1) {
      sufijo = ' ' + s.slice(idxBarra).trim();
    }
    var soloDigitos = s.replace(/[^\d]/g, '');
    if (!soloDigitos) return s;
    var n = parseInt(soloDigitos, 10);
    if (isNaN(n)) return s;
    var base = n.toLocaleString('es-CO');
    return '$ ' + base + sufijo;
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

  function normalizarYoutubeUrl(videoRaw) {
    if (!videoRaw) return '';
    var v = String(videoRaw).trim();
    if (!v) return '';
    if (v.indexOf('youtu.be/') !== -1) {
      return 'https://www.youtube.com/watch?v=' + v.split('youtu.be/')[1].split('?')[0].split('&')[0];
    }
    var m = v.match(/[?&]v=([^&]+)/);
    if (m) return 'https://www.youtube.com/watch?v=' + m[1];
    return v;
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
        '    codigo: ' + escapeJs(p.codigo || ''),
        '    estado: ' + escapeJs(p.estado || 'disponible'),
        '    aliadoNombre: ' + escapeJs(p.aliadoNombre || ''),
        '    aliadoDocumento: ' + escapeJs(p.aliadoDocumento || ''),
        '    propietarioNombre: ' + escapeJs(p.propietarioNombre || ''),
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

  function generarCSV() {
    var arr = getPropiedades();
    if (!arr || !arr.length) return '';

    // En la mayoría de instalaciones de Excel en español el separador por defecto es ;
    var SEP = ';';

    var headers = [
      'codigo',
      'estado',
      'aliadoNombre',
      'aliadoDocumento',
      'propietarioNombre',
      'titulo',
      'tipo',
      'pais',
      'ciudad',
      'municipio',
      'precio',
      'arriendoPorDia'
    ];
    function csvEscape(value) {
      if (value == null) return '';
      var s = String(value);
      if (s.indexOf('"') !== -1 || s.indexOf(SEP) !== -1 || s.indexOf('\n') !== -1 || s.indexOf('\r') !== -1) {
        return '"' + s.replace(/"/g, '""') + '"';
      }
      return s;
    }
    var rows = [headers.map(csvEscape).join(SEP)];
    arr.forEach(function (p) {
      var row = [
        p.codigo || '',
        p.estado || 'disponible',
        p.aliadoNombre || '',
        p.aliadoDocumento || '',
        p.propietarioNombre || '',
        p.titulo || '',
        p.tipo || '',
        p.pais != null ? p.pais : 'Colombia',
        p.ciudad || '',
        p.municipio || '',
        p.precio || '',
        p.arriendoPorDia === true ? '1' : ''
      ];
      rows.push(row.map(csvEscape).join(SEP));
    });
    return rows.join('\n');
  }

  function calcularSiguienteCodigo() {
    var arr = getPropiedades();
    var maxNum = 0;
    arr.forEach(function (p) {
      if (!p || !p.codigo) return;
      var c = String(p.codigo).trim();
      var m = c.match(/^PA(\d+)$/i);
      if (!m) return;
      var n = parseInt(m[1], 10);
      if (!isNaN(n) && n > maxNum) maxNum = n;
    });
    var siguiente = maxNum + 1;
    var numStr = String(siguiente).padStart(3, '0');
    return 'PA' + numStr;
  }

  function setCodigoPorDefecto() {
    if (window._adminEditingId) return;
    var idEl = document.getElementById('adm-id');
    if (!idEl) return;
    idEl.value = calcularSiguienteCodigo();
  }

  function renderListado() {
    if (!listadoEl) return;
    var arr = getPropiedades();
    var filtroIdInput = document.getElementById('admin-buscar-id');
    var filtro = (filtroIdInput && filtroIdInput.value) ? filtroIdInput.value.trim().toLowerCase() : '';
    if (filtro) {
      arr = arr.filter(function (p) {
        var codigo = (p.codigo != null && String(p.codigo).trim() !== '') ? String(p.codigo) : (p.id != null ? String(p.id) : '');
        return codigo.toLowerCase().indexOf(filtro) !== -1;
      });
    }
    listadoEl.innerHTML = '';
    if (arr.length === 0) {
      listadoEl.innerHTML = '<p class="admin-vacio">No hay propiedades. Añade una arriba.</p>';
      setCodigoPorDefecto();
      return;
    }
    arr.forEach(function (p, index) {
      var div = document.createElement('div');
      div.className = 'admin-item';
      var id = p.id != null ? String(p.id) : String(index);
      var codigo = (p.codigo != null && String(p.codigo).trim() !== '') ? String(p.codigo) : id;
      var img = p.imagen ? '<img src="' + urlImagenDrive(p.imagen).replace(/"/g, '&quot;') + '" alt="" class="admin-item__img" referrerpolicy="no-referrer">' : '<span class="admin-item__sin-img">Sin imagen</span>';
      var pais = p.pais != null ? p.pais : 'Colombia';
      var estado = p.estado || 'disponible';
      var estadoTexto = estado === 'arrendada' ? 'Arrendada' : 'Disponible';
      div.innerHTML =
        '<div class="admin-item__preview">' + img + '</div>' +
        '<div class="admin-item__info">' +
          '<span class="admin-item__codigo">Código Inmueble: ' + escapeHtml(codigo) + '</span><br>' +
          '<strong>' + escapeHtml(p.titulo || 'Sin título') + '</strong> — ' + (p.tipo === 'venta' ? 'Venta' : 'Arriendo') + (p.arriendoPorDia ? ' <span class="admin-item__por-dia">Por día</span>' : '') + '<br>' +
          '<span class="admin-item__estado admin-item__estado--' + (estado === 'arrendada' ? 'arrendada' : 'disponible') + '">' + escapeHtml(estadoTexto) + '</span> · ' +
          pais + (p.ciudad ? ', ' + p.ciudad : '') + (p.municipio ? ', ' + p.municipio : '') + (p.precio ? ' · ' + formatPrecio(p.precio) : '') +
          (p.video ? ' <span class="admin-item__video">🎬 Video</span>' : '') +
        '</div>' +
        '<button type="button" class="btn btn--sec admin-item__edit" data-id="' + escapeHtml(id) + '" data-index="' + index + '">Editar</button>' +
        '<button type="button" class="btn btn--danger admin-item__del" data-id="' + escapeHtml(id) + '">Eliminar</button>';
      listadoEl.appendChild(div);
    });
    setCodigoPorDefecto();
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
    var idEl = document.getElementById('adm-id');
    var tituloEl = document.getElementById('adm-titulo');
    var tipoEl = document.getElementById('adm-tipo');
    var estadoEl = document.getElementById('adm-estado');
    var aliadoNombreEl = document.getElementById('adm-aliado-nombre');
    var aliadoDocumentoEl = document.getElementById('adm-aliado-documento');
    var propietarioNombreEl = document.getElementById('adm-propietario-nombre');
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

    if (idEl) idEl.value = (p.codigo != null ? p.codigo : '');
    tituloEl.value = p.titulo || '';
    tipoEl.value = p.tipo || 'venta';
    if (estadoEl) estadoEl.value = p.estado || 'disponible';
    if (aliadoNombreEl) aliadoNombreEl.value = p.aliadoNombre || '';
    if (aliadoDocumentoEl) aliadoDocumentoEl.value = p.aliadoDocumento || '';
    if (propietarioNombreEl) propietarioNombreEl.value = p.propietarioNombre || '';
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
    imagenesEl.value = (p.imagenes && Array.isArray(p.imagenes)) ? p.imagenes.join(', ') : (p.imagen ? p.imagen : '');
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
    var idEl = document.getElementById('adm-id');
    var estadoEl = document.getElementById('adm-estado');
    var aliadoNombreEl = document.getElementById('adm-aliado-nombre');
    var aliadoDocumentoEl = document.getElementById('adm-aliado-documento');
    var propietarioNombreEl = document.getElementById('adm-propietario-nombre');
    if (formNueva) formNueva.reset();
    if (idEl) idEl.value = '';
    if (estadoEl) estadoEl.value = 'disponible';
    if (aliadoNombreEl) aliadoNombreEl.value = '';
    if (aliadoDocumentoEl) aliadoDocumentoEl.value = '';
    if (propietarioNombreEl) propietarioNombreEl.value = '';
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
    setCodigoPorDefecto();
    if (submitBtn) submitBtn.textContent = 'Añadir propiedad';
    if (cancelBtn) cancelBtn.classList.add('oculto');
  }

  function initPanel() {
    initPaisesAdmin();
    initDepartamentos();

    /* Banner publicitario (video de inicio) — YouTube, Drive, Facebook, Instagram, TikTok, MP4… */
    (function initBannerVideo() {
      var input = document.getElementById('adm-banner-video');
      var form = document.getElementById('form-banner-video');
      var estado = document.getElementById('adm-banner-estado');
      if (!input || !form) return;

      function setEstado(msg) {
        if (!estado) return;
        estado.textContent = msg || '';
      }

      function loadBannerFromServer() {
        if (!window.FIREBASE_READY || !window.FIREBASE_DB) return;
        window.FIREBASE_DB.collection('config').doc('banner')
          .get({ source: 'server' })
          .then(function (doc) {
            var d = typeof doc.data === 'function' ? doc.data() : null;
            if (d && d.videoUrl != null && String(d.videoUrl).trim() !== '') {
              input.value = String(d.videoUrl).trim();
            }
          })
          .catch(function (err) {
            setEstado('No se pudo cargar el banner: ' + (err && err.message ? err.message : String(err)));
          });
      }

      loadBannerFromServer();

      if (form.getAttribute('data-pa-video-bound') === '1') return;
      form.setAttribute('data-pa-video-bound', '1');

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var raw = (input.value || '').trim();
        if (raw && !/^https?:\/\//i.test(raw) && raw.indexOf('/') !== -1) {
          raw = 'https://' + raw.replace(/^\/+/, '');
          input.value = raw;
        }
        if (!window.FIREBASE_READY || !window.FIREBASE_DB) {
          alert('Para editar el banner necesitas tener Firebase configurado en la web pública.');
          return;
        }
        if (raw && window.VideoEmbed && !VideoEmbed.isLikelyVideoUrl(raw)) {
          setEstado('La URL no parece válida (usa http/https o enlace reconocido).');
          return;
        }
        window.FIREBASE_DB.collection('config').doc('banner').set({
          videoUrl: raw
        }, { merge: true }).then(function () {
          loadBannerFromServer();
          setEstado(raw
            ? 'Banner actualizado. Recarga la página principal para ver el cambio.'
            : 'Banner vacío: en la web se usará el video por defecto del HTML.');
        }).catch(function (err) {
          var msg = err && err.message ? err.message : String(err);
          setEstado('Error al guardar: ' + msg);
          alert('Error al guardar el banner: ' + msg);
        });
      });
    })();

    /* Video institucional (Firestore config/institutional) */
    (function initInstitucionalVideo() {
      var input = document.getElementById('adm-institucional-video');
      var verticalEl = document.getElementById('adm-institucional-vertical');
      var form = document.getElementById('form-institucional-video');
      var estado = document.getElementById('adm-institucional-estado');
      if (!input || !form) return;

      function setEstado(msg) {
        if (!estado) return;
        estado.textContent = msg || '';
      }

      function loadInstitucionalFromServer() {
        if (!window.FIREBASE_READY || !window.FIREBASE_DB) return;
        window.FIREBASE_DB.collection('config').doc('institutional')
          .get({ source: 'server' })
          .then(function (doc) {
            var d = typeof doc.data === 'function' ? doc.data() : null;
            if (d && d.videoUrl != null && String(d.videoUrl).trim() !== '') {
              input.value = String(d.videoUrl).trim();
            }
            if (verticalEl) {
              verticalEl.checked = !!(d && d.videoVertical === true);
            }
          })
          .catch(function (err) {
            setEstado('No se pudo cargar el enlace: ' + (err && err.message ? err.message : String(err)));
          });
      }

      loadInstitucionalFromServer();

      if (form.getAttribute('data-pa-video-bound') === '1') return;
      form.setAttribute('data-pa-video-bound', '1');

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var raw = (input.value || '').trim();
        if (raw && !/^https?:\/\//i.test(raw) && raw.indexOf('/') !== -1) {
          raw = 'https://' + raw.replace(/^\/+/, '');
          input.value = raw;
        }
        if (!window.FIREBASE_READY || !window.FIREBASE_DB) {
          alert('Para esto necesitas Firebase configurado.');
          return;
        }
        if (raw && window.VideoEmbed && !VideoEmbed.isLikelyVideoUrl(raw)) {
          setEstado('La URL no parece válida.');
          return;
        }
        var vert = !!(verticalEl && verticalEl.checked);
        window.FIREBASE_DB.collection('config').doc('institutional').set({
          videoUrl: raw,
          videoVertical: vert
        }, { merge: true }).then(function () {
          loadInstitucionalFromServer();
          setEstado(raw
            ? 'Guardado. Recarga la web pública para ver el video.'
            : 'Guardado vacío: se mostrará el MP4 local por defecto.');
        }).catch(function (err) {
          var msg = err && err.message ? err.message : String(err);
          setEstado('Error al guardar: ' + msg);
          alert('Error al guardar el video institucional: ' + msg);
        });
      });
    })();

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
            codigo: d.codigo || '',
            estado: d.estado || 'disponible',
            aliadoNombre: d.aliadoNombre || '',
            aliadoDocumento: d.aliadoDocumento || '',
            propietarioNombre: d.propietarioNombre || '',
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
        var codigo = (document.getElementById('adm-id') && document.getElementById('adm-id').value) ? document.getElementById('adm-id').value.trim() : '';
        var titulo = (document.getElementById('adm-titulo').value || '').trim();
        var tipo = document.getElementById('adm-tipo').value;
        var estado = (document.getElementById('adm-estado') && document.getElementById('adm-estado').value) || 'disponible';
        var aliadoNombre = (document.getElementById('adm-aliado-nombre') && document.getElementById('adm-aliado-nombre').value) ? document.getElementById('adm-aliado-nombre').value.trim() : '';
        var aliadoDocumento = (document.getElementById('adm-aliado-documento') && document.getElementById('adm-aliado-documento').value) ? document.getElementById('adm-aliado-documento').value.trim() : '';
        var propietarioNombre = (document.getElementById('adm-propietario-nombre') && document.getElementById('adm-propietario-nombre').value) ? document.getElementById('adm-propietario-nombre').value.trim() : '';
        var pais = (document.getElementById('adm-pais').value || '').trim();
        var departamento = (document.getElementById('adm-departamento').value || '').trim();
        var municipio = (document.getElementById('adm-municipio').value || '').trim();
        var precio = (document.getElementById('adm-precio').value || '').trim();
        var descripcion = (document.getElementById('adm-descripcion').value || '').trim();
        var imagenesRaw = (document.getElementById('adm-imagenes').value || '').trim();
        var videoRaw = (document.getElementById('adm-video').value || '').trim();
        var arriendoPorDia = (document.getElementById('adm-arriendo-por-dia') && document.getElementById('adm-arriendo-por-dia').checked) && (tipo === 'arriendo');

        var editingId = window._adminEditingId;

        if (!codigo) {
          alert('Debes ingresar el Código Inmueble (obligatorio).');
          return;
        }

        var arrCodigos = getPropiedades();
        var codLower = codigo.toLowerCase();
        var codigoRepetido = false;
        arrCodigos.forEach(function (p) {
          if (!p) return;
          if (editingId != null && String(p.id) === String(editingId)) return;
          if (p.codigo != null && String(p.codigo).trim().toLowerCase() === codLower) {
            codigoRepetido = true;
          }
        });
        if (codigoRepetido) {
          alert('Ya existe una propiedad con ese Código Inmueble. Usa uno diferente.');
          return;
        }

        if (pais === 'Colombia' && (!departamento || !municipio)) {
          alert('Para Colombia debes seleccionar Departamento y Municipio.');
          return;
        }

        var urls = imagenesRaw.split(/\n|,/).map(function (s) { return s.trim(); }).filter(Boolean);
        var imagen = urls[0] || '';
        var imagenes = urls.length ? urls : (imagen ? [imagen] : []);

        var video = normalizarYoutubeUrl(videoRaw);

        var data = {
          codigo: codigo || '',
          estado: estado || 'disponible',
          aliadoNombre: aliadoNombre || '',
          aliadoDocumento: aliadoDocumento || '',
          propietarioNombre: propietarioNombre || '',
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
      setCodigoPorDefecto();
    }

    var btnExportar = document.getElementById('btn-exportar');
    if (btnExportar) {
      btnExportar.onclick = function () {
        exportarText.value = generarDatosJs();
        mostrar(exportarBox);
        exportarText.select();
      };
    }

    var btnExportarCsv = document.getElementById('btn-exportar-csv');
    if (btnExportarCsv) {
      btnExportarCsv.onclick = function () {
        var csv = generarCSV();
        if (!csv) {
          alert('No hay propiedades para exportar.');
          return;
        }
        var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        var fecha = new Date().toISOString().slice(0, 10);
        a.download = 'propiedades_' + fecha + '.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      };
    }

    var filtroIdInput = document.getElementById('admin-buscar-id');
    if (filtroIdInput) {
      filtroIdInput.addEventListener('input', function () {
        renderListado();
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLogin);
  } else {
    initLogin();
  }
})();

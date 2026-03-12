(function () {
  'use strict';

  var WHATSAPP_NUMERO = '573145000000'; // Colombia +57 314 500 00 00

  function getWhatsAppUrl(mensaje) {
    return 'https://wa.me/' + WHATSAPP_NUMERO + '?text=' + encodeURIComponent(mensaje);
  }

  /** Convierte enlace de Google Drive "compartir" al formato que sirve en <img src>.
   * Usamos el endpoint thumbnail porque uc?export=view suele dar 403 desde otros sitios. */
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
      var sz = (size && String(size).match(/^[wm]\d+$/)) ? size : 'w800';
      return 'https://drive.google.com/thumbnail?id=' + id + '&sz=' + sz;
    }
    return u;
  }

  /** URL alternativa de Drive (uc?export=view) para usar como fallback si thumbnail falla en algún dispositivo */
  function urlImagenDriveUc(url) {
    if (!url || typeof url !== 'string') return '';
    var u = url.trim();
    var m = u.match(/drive\.google\.com\/file\/d\/([^/]+)/) || u.match(/drive\.google\.com\/open\?id=([^&]+)/);
    if (m) return 'https://drive.google.com/uc?export=view&id=' + m[1];
    return '';
  }

  /** Proxy de imágenes para cuando Drive falla en algunos móviles (thumbnail y uc dan error) */
  function urlImagenDriveProxy(url) {
    var uc = urlImagenDriveUc(url);
    if (!uc) return '';
    return 'https://wsrv.nl/?url=' + encodeURIComponent(uc) + '&n=-1';
  }

  function initVideoYoutube() {
    var section = document.getElementById('seccion-video');
    var iframe = document.getElementById('iframe-youtube');
    if (!section || !iframe) return;

    function aplicarDesdeUrl(url) {
      url = (url || '').trim();
      if (!url) {
        url = (section.getAttribute('data-youtube-url') || '').trim();
      }
      if (!url) return;
      var id = null;
      if (url.indexOf('youtu.be/') !== -1) {
        id = url.split('youtu.be/')[1].split('?')[0].split('&')[0];
      } else {
        var match = url.match(/[?&]v=([^&]+)/);
        id = match ? match[1] : null;
      }
      if (!id) return;
      iframe.src = 'https://www.youtube.com/embed/' + id + '?rel=0';
    }

    var urlAttr = (section.getAttribute('data-youtube-url') || '').trim();

    if (window.FIREBASE_READY && window.FIREBASE_DB) {
      window.FIREBASE_DB.collection('config').doc('banner').get()
        .then(function (doc) {
          var d = doc && doc.exists ? doc.data() : null;
          var urlDb = d && d.videoUrl ? String(d.videoUrl) : '';
          aplicarDesdeUrl(urlDb || urlAttr);
        })
        .catch(function () {
          aplicarDesdeUrl(urlAttr);
        });
    } else {
      aplicarDesdeUrl(urlAttr);
    }
  }

  function llenarSelect(selectId, opciones, valorVacio) {
    var select = document.getElementById(selectId);
    if (!select) return;
    select.innerHTML = '';
    var opt0 = document.createElement('option');
    opt0.value = '';
    opt0.textContent = valorVacio || 'Todos';
    select.appendChild(opt0);
    opciones.forEach(function (valor) {
      var opt = document.createElement('option');
      opt.value = valor;
      opt.textContent = valor;
      select.appendChild(opt);
    });
  }

  function extraerValoresUnicos(propiedades, campo) {
    var set = {};
    propiedades.forEach(function (p) {
      var v = (p[campo] || '').trim();
      if (v) set[v] = true;
    });
    return Object.keys(set).sort();
  }

  function filtrarPropiedades(propiedades, filtros) {
    var mapa = window.CO_DEPARTAMENTOS || null;
    var paisSel = filtros.pais;
    var esColombia = paisSel === 'Colombia';

    return propiedades.filter(function (p) {
      var paisProp = p.pais != null ? p.pais : 'Colombia';
      if (paisSel && paisProp !== paisSel) return false;

      if (esColombia && paisProp === 'Colombia') {
        var departamentoSel = filtros.ciudad;
        if (departamentoSel && mapa) {
          var municipiosDepto = mapa[departamentoSel] || [];
          if (!filtros.municipio) {
            if (municipiosDepto.indexOf(p.municipio) === -1) return false;
          }
        }
        if (filtros.municipio && p.municipio !== filtros.municipio) return false;
      }

      if (filtros.tipo && p.tipo !== filtros.tipo) return false;

      return true;
    });
  }

  function ubicacionTexto(p) {
    var partes = [];
    if (p.municipio && p.municipio !== p.ciudad) partes.push(p.municipio);
    if (p.ciudad) partes.push(p.ciudad);
    if (p.pais && partes.length === 0) partes.push(p.pais);
    return partes.length ? partes.join(', ') : (p.pais || 'Sin ubicación');
  }

  function formatPrecio(precioRaw) {
    if (precioRaw == null) return 'Consultar';
    var s = String(precioRaw).trim();
    if (!s) return 'Consultar';
    // Si ya parece un texto sin números, dejarlo igual
    if (!/\d/.test(s)) return s;
    // Detectar posible sufijo tipo "/ mes"
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

  function renderTarjeta(p) {
    var esPorDia = p.tipo === 'arriendo' && p.arriendoPorDia === true;
    var ubicacion = ubicacionTexto(p);
    var primeraImg = (p.imagenes && p.imagenes[0]) || p.imagen;
    primeraImg = urlImagenDrive(primeraImg);
    var primeraImgFallback = urlImagenDriveUc((p.imagenes && p.imagenes[0]) || p.imagen);
    var primeraImgProxy = urlImagenDriveProxy((p.imagenes && p.imagenes[0]) || p.imagen);
    var numFotos = (p.imagenes && p.imagenes.length) || (p.imagen ? 1 : 0);

    var codigo = (p.codigo != null && String(p.codigo).trim() !== '') ? String(p.codigo) : String(p.id);

    var div = document.createElement('article');
    div.className = 'tarjeta';
    div.setAttribute('data-titulo', p.titulo || '');
    div.setAttribute('data-ubicacion', ubicacion);
    div.setAttribute('data-codigo', codigo);

    var imagenHtml;
    if (primeraImg) {
      var fallbackAttr = primeraImgFallback ? ' data-fallback="' + escapeAttr(primeraImgFallback) + '"' : '';
      var proxyAttr = primeraImgProxy ? ' data-fallback-proxy="' + escapeAttr(primeraImgProxy) + '"' : '';
      imagenHtml =
        '<a href="propiedad.html?id=' + escapeAttr(String(p.id)) + '" class="tarjeta-imagen-link">' +
          '<div class="tarjeta-imagen">' +
            '<img src="' + escapeAttr(primeraImg) + '" alt="' + escapeHtml(p.titulo) + '" referrerpolicy="no-referrer" loading="lazy"' + fallbackAttr + proxyAttr + '>' +
            (numFotos > 1 ? '<span class="tarjeta-n-fotos">+' + (numFotos - 1) + ' fotos</span>' : '') +
          '</div>' +
        '</a>';
    } else {
      imagenHtml = '<a href="propiedad.html?id=' + escapeAttr(String(p.id)) + '" class="tarjeta-imagen-link"><div class="tarjeta-imagen">🏠</div></a>';
    }

    var videoHtml = '';
    if (p.video) {
      videoHtml = '<a href="' + escapeAttr(p.video) + '" class="tarjeta-video" target="_blank" rel="noopener">🎬 Ver video</a>';
    }

    var tipoLabel = p.tipo === 'venta' ? 'Venta' : 'Arriendo';
    if (esPorDia) tipoLabel += ' por día';

    var cuerpo = imagenHtml +
      '<div class="tarjeta-cuerpo">' +
        '<div class="tarjeta-tipo">' + tipoLabel + '</div>' +
        '<p class="tarjeta-codigo">Código Inmueble: ' + escapeHtml(codigo) + '</p>' +
        '<h3 class="tarjeta-titulo"><a href="propiedad.html?id=' + escapeAttr(String(p.id)) + '" class="tarjeta-titulo-link">' + escapeHtml(p.titulo) + '</a></h3>' +
        '<p class="tarjeta-ubicacion">' + escapeHtml(ubicacion) + '</p>' +
        '<p class="tarjeta-precio">' + escapeHtml(formatPrecio(p.precio)) + '</p>' +
        '<a href="propiedad.html?id=' + escapeAttr(String(p.id)) + '" class="tarjeta-ver-mas">Ver más fotos y video</a>' +
        videoHtml;

    if (esPorDia) {
      cuerpo +=
        '<div class="tarjeta-por-dia">' +
          '<label class="tarjeta-por-dia__label">Fecha de entrada</label>' +
          '<input type="date" class="tarjeta-por-dia__input tarjeta-fecha-entrada" min="">' +
          '<label class="tarjeta-por-dia__label">Fecha de salida</label>' +
          '<input type="date" class="tarjeta-por-dia__input tarjeta-fecha-salida" min="">' +
          '<label class="tarjeta-por-dia__label">Adultos</label>' +
          '<input type="number" class="tarjeta-por-dia__input tarjeta-adultos" min="1" value="1" placeholder="1">' +
          '<label class="tarjeta-por-dia__label">Niños</label>' +
          '<input type="number" class="tarjeta-por-dia__input tarjeta-ninos" min="0" value="0" placeholder="0">' +
          '<button type="button" class="btn btn-whatsapp-por-dia">Consultar por WhatsApp</button>' +
        '</div>';
    } else {
      var mensaje = 'Hola, me interesa esta propiedad para ' + (p.tipo === 'venta' ? 'comprar' : 'arrendar') + ':\n\n' +
        p.titulo + '\n' + ubicacion + '\n' +
        'Código Inmueble: ' + codigo + '\n\n' +
        'Vi el anuncio en la Aplicación Web de Inmobiliaria Pérez Araujo.';
      var urlWhatsApp = getWhatsAppUrl(mensaje);
      cuerpo += '<a href="' + escapeAttr(urlWhatsApp) + '" class="btn" target="_blank" rel="noopener">Consultar por WhatsApp</a>';
    }

    cuerpo += '</div>';
    div.innerHTML = cuerpo;

    if (esPorDia) {
      var hoy = new Date().toISOString().slice(0, 10);
      div.querySelectorAll('.tarjeta-fecha-entrada, .tarjeta-fecha-salida').forEach(function (input) {
        input.setAttribute('min', hoy);
      });
    }

    return div;
  }

  function escapeHtml(s) {
    if (!s) return '';
    var div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }
  function escapeAttr(s) {
    return escapeHtml(s).replace(/"/g, '&quot;');
  }

  function actualizarListado(propiedades) {
    var grid = document.getElementById('grid-propiedades');
    var info = document.getElementById('resultados-info');
    var sinResultados = document.getElementById('sin-resultados');
    if (!grid || !info) return;

    grid.innerHTML = '';
    if (propiedades.length === 0) {
      info.textContent = 'No se encontraron propiedades.';
      if (sinResultados) sinResultados.classList.remove('oculto');
      return;
    }
    if (sinResultados) sinResultados.classList.add('oculto');
    info.textContent = propiedades.length + ' propiedad(es).';
    propiedades.forEach(function (p) {
      grid.appendChild(renderTarjeta(p));
    });

    if (!grid._imgFallbackDelegation) {
      grid._imgFallbackDelegation = true;
      grid.addEventListener('error', function (e) {
        var img = e.target;
        if (!img || img.tagName !== 'IMG' || !img.dataset) return;
        if (img.dataset.fallback) {
          img.src = img.dataset.fallback;
          img.removeAttribute('data-fallback');
        } else if (img.dataset.fallbackProxy) {
          img.src = img.dataset.fallbackProxy;
          img.removeAttribute('data-fallback-proxy');
        }
        img.onerror = null;
      }, true);
    }

    if (!grid._whatsappPorDiaDelegation) {
      grid._whatsappPorDiaDelegation = true;
      grid.addEventListener('click', function (e) {
        var btn = e.target;
        if (!btn || !btn.classList || !btn.classList.contains('btn-whatsapp-por-dia')) return;
        e.preventDefault();
        var tarjeta = btn.closest && btn.closest('.tarjeta');
        if (!tarjeta) return;
        var titulo = tarjeta.getAttribute('data-titulo') || '';
        var ubicacion = tarjeta.getAttribute('data-ubicacion') || '';
        var codigo = tarjeta.getAttribute('data-codigo') || '';
        var fechaEntrada = (tarjeta.querySelector('.tarjeta-fecha-entrada') && tarjeta.querySelector('.tarjeta-fecha-entrada').value) || '';
        var fechaSalida = (tarjeta.querySelector('.tarjeta-fecha-salida') && tarjeta.querySelector('.tarjeta-fecha-salida').value) || '';
        var adultos = (tarjeta.querySelector('.tarjeta-adultos') && tarjeta.querySelector('.tarjeta-adultos').value) || '1';
        var ninos = (tarjeta.querySelector('.tarjeta-ninos') && tarjeta.querySelector('.tarjeta-ninos').value) || '0';
        var mensaje = 'Hola, me interesa esta propiedad para arrendar por día:\n\n' +
          titulo + '\n' + ubicacion + '\n' +
          'Código Inmueble: ' + (codigo || 'Sin código') + '\n\n' +
          '*Fecha de entrada:* ' + (fechaEntrada || 'Por definir') + '\n' +
          '*Fecha de salida:* ' + (fechaSalida || 'Por definir') + '\n' +
          '*Adultos:* ' + adultos + '\n' +
          '*Niños:* ' + ninos + '\n\n' +
          'Vi el anuncio en la Aplicación Web de Inmobiliaria Pérez Araujo.';
        window.open(getWhatsAppUrl(mensaje), '_blank', 'noopener');
      });
    }
  }

  function aplicarFiltros() {
    var propiedades = window.PROPIEDADES || [];
    var paisEl = document.getElementById('filtro-pais');
    var ciudadEl = document.getElementById('filtro-ciudad');
    var municipioEl = document.getElementById('filtro-municipio');
    var tipoEl = document.getElementById('filtro-tipo');

    var filtros = {
      pais: paisEl ? paisEl.value.trim() : '',
      ciudad: ciudadEl ? ciudadEl.value.trim() : '',
      municipio: municipioEl ? municipioEl.value.trim() : '',
      tipo: tipoEl ? tipoEl.value.trim() : ''
    };

    var listaFiltrada = filtrarPropiedades(propiedades, filtros);
    actualizarListado(listaFiltrada);
  }

  function initFiltrosCascada() {
    var ciudad = document.getElementById('filtro-ciudad');
    var municipio = document.getElementById('filtro-municipio');
    var propiedades = window.PROPIEDADES || [];

    function actualizarMunicipios() {
      var ciudadVal = ciudad ? ciudad.value : '';
      var sub = ciudadVal ? propiedades.filter(function (p) { return p.ciudad === ciudadVal; }) : propiedades;
      var munOpts = extraerValoresUnicos(sub, 'municipio');
      llenarSelect('filtro-municipio', munOpts, 'Todos los municipios');
      if (municipio) municipio.value = '';
    }

    if (ciudad) ciudad.addEventListener('change', actualizarMunicipios);
  }

  function initWhatsApp() {
    var mensajeGeneral = 'Hola, entré desde la web de Inmobiliaria Pérez Araujo. Me gustaría recibir información sobre propiedades (venta o arriendo).';
    var urlGeneral = getWhatsAppUrl(mensajeGeneral);

    var linkContacto = document.getElementById('link-whatsapp-contacto');
    if (linkContacto) {
      linkContacto.href = urlGeneral;
    }
  }

  // Inicializa selects de Departamento y Municipio usando JSON de Colombia
  function initDepartamentosMunicipios() {
    var dptoSelect = document.getElementById('filtro-ciudad'); // representa Departamento
    var munSelect = document.getElementById('filtro-municipio');

    if (!dptoSelect || !munSelect) return;

    function aplicarMapa(mapa) {
      window.CO_DEPARTAMENTOS = mapa;
      var departamentos = Object.keys(mapa).sort();
      llenarSelect('filtro-ciudad', departamentos, 'Todos los departamentos');

      function actualizarMunicipiosPorDepto() {
        var dpto = dptoSelect.value;
        var municipios = dpto ? (mapa[dpto] || []) : [];
        llenarSelect('filtro-municipio', municipios, 'Todos los municipios');
      }

      if (!dptoSelect.dataset.deptoInicializado) {
        dptoSelect.dataset.deptoInicializado = '1';
        dptoSelect.addEventListener('change', actualizarMunicipiosPorDepto);
      }
      llenarSelect('filtro-municipio', [], 'Todos los municipios');
    }

    if (window.CO_DEPARTAMENTOS) {
      aplicarMapa(window.CO_DEPARTAMENTOS);
      return;
    }

    if (window.CO_DEPARTAMENTOS_LIST && Array.isArray(window.CO_DEPARTAMENTOS_LIST)) {
      var mapa = {};
      window.CO_DEPARTAMENTOS_LIST.forEach(function (item) {
        if (!item || !item.departamento) return;
        mapa[item.departamento] = item.ciudades || [];
      });
      aplicarMapa(mapa);
      return;
    }
  }

  function mostrarOcultarColombiaUbicacion(mostrar) {
    var block = document.getElementById('filtro-colombia-ubicacion');
    var dpto = document.getElementById('filtro-ciudad');
    var mun = document.getElementById('filtro-municipio');
    if (!block) return;
    if (mostrar) {
      block.classList.remove('oculto');
      initDepartamentosMunicipios();
    } else {
      block.classList.add('oculto');
      if (dpto) dpto.value = '';
      if (mun) {
        mun.innerHTML = '';
        var opt = document.createElement('option');
        opt.value = '';
        opt.textContent = 'Todos los municipios';
        mun.appendChild(opt);
      }
      window.CO_DEPARTAMENTOS = null;
    }
  }

  function llenarSelectPaises(paises) {
    var list = document.getElementById('filtro-pais-list');
    var triggerContent = document.getElementById('filtro-pais-trigger-content');
    var inputPais = document.getElementById('filtro-pais');
    var trigger = document.getElementById('filtro-pais-trigger');
    if (!list || !triggerContent || !inputPais || !trigger) return;

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

    list.querySelectorAll('.filtro-pais-item').forEach(function (item) {
      item.addEventListener('click', function () {
        var country = item.dataset.country;
        var flag = item.dataset.flag || '';
        inputPais.value = country;
        triggerContent.innerHTML = '<img src="' + flag.replace(/"/g, '&quot;') + '" alt="" class="filtro-pais-flag" width="24" height="18" aria-hidden="true"><span>' + escapeHtml(country) + '</span>';
        list.classList.add('oculto');
        trigger.setAttribute('aria-expanded', 'false');
        if (inputPais.onchange) inputPais.onchange();
        inputPais.dispatchEvent(new Event('change', { bubbles: true }));
      });
    });

    trigger.addEventListener('click', function () {
      var abierto = !list.classList.contains('oculto');
      list.classList.toggle('oculto', abierto);
      trigger.setAttribute('aria-expanded', !abierto);
    });

    document.addEventListener('click', function (e) {
      var wrap = document.getElementById('filtro-pais-wrap');
      if (wrap && !wrap.contains(e.target)) {
        list.classList.add('oculto');
        trigger.setAttribute('aria-expanded', 'false');
      }
    });
  }


  function initPaisYUbicacion() {
    var inputPais = document.getElementById('filtro-pais');
    var blockColombia = document.getElementById('filtro-colombia-ubicacion');
    if (!inputPais || !blockColombia) return;

    inputPais.addEventListener('change', function () {
      var esColombia = inputPais.value === 'Colombia';
      mostrarOcultarColombiaUbicacion(esColombia);
    });
  }

  function init() {
    function runInit(propiedades) {
      propiedades = (propiedades || []).filter(function (p) { return !p.estado || p.estado !== 'arrendada'; });
      window.PROPIEDADES = propiedades;
      initVideoYoutube();

      function initDespuesDePaises() {
        initPaisYUbicacion();
        mostrarOcultarColombiaUbicacion(true);
        actualizarListado(propiedades);
        initWhatsApp();

        var form = document.getElementById('form-filtros');
        if (form) {
          form.addEventListener('submit', function (e) {
            e.preventDefault();
            aplicarFiltros();
          });
        }
        var ciudadEl = document.getElementById('filtro-ciudad');
        var municipioEl = document.getElementById('filtro-municipio');
        var tipoEl = document.getElementById('filtro-tipo');
        var paisEl = document.getElementById('filtro-pais');
        if (ciudadEl) ciudadEl.addEventListener('change', aplicarFiltros);
        if (municipioEl) municipioEl.addEventListener('change', aplicarFiltros);
        if (tipoEl) tipoEl.addEventListener('change', aplicarFiltros);
        if (paisEl) paisEl.addEventListener('change', aplicarFiltros);
      }

      var inputPais = document.getElementById('filtro-pais');
      if (!inputPais) {
        initDespuesDePaises();
        return;
      }

      function cargarPaisesYContinuar() {
        var paises = window.PAISES_BANDERAS;
        if (Array.isArray(paises) && paises.length > 0) {
          llenarSelectPaises(paises);
          initDespuesDePaises();
          return;
        }
        var jsonUrl = (function () {
          var a = document.createElement('a');
          a.href = 'js/PaisesBanderas.json';
          return a.href;
        })();
        fetch(jsonUrl)
          .then(function (r) {
            if (!r.ok) throw new Error('No se pudo cargar la lista de países');
            return r.json();
          })
          .then(function (paises) {
            if (!Array.isArray(paises)) paises = [];
            llenarSelectPaises(paises);
            initDespuesDePaises();
          })
          .catch(function () {
            inputPais.value = 'Colombia';
            initDespuesDePaises();
          });
      }

      cargarPaisesYContinuar();
    }

    function loadPropiedades() {
      if (window.FIREBASE_READY && window.FIREBASE_DB) {
        return window.FIREBASE_DB.collection('propiedades').orderBy('titulo').get()
          .then(function (snapshot) {
            var list = [];
            snapshot.docs.forEach(function (doc, i) {
              var d = doc.data();
              list.push(normalizarPropiedadItem(Object.assign({ id: doc.id }, d), i));
            });
            return list;
          })
          .catch(function (err) {
            console.warn('No se pudieron cargar propiedades desde Firestore:', err && err.message);
            if (err && err.message && err.message.indexOf('index') !== -1 && err.message.indexOf('https://') !== -1) {
              var link = err.message.match(/https:\/\/[^\s]+/);
              if (link && link[0]) console.warn('Crea el índice en Firebase y vuelve a cargar:', link[0]);
            }
            return (window.PROPIEDADES || []).map(normalizarPropiedadItem);
          });
      }
      return Promise.resolve((window.PROPIEDADES || []).map(normalizarPropiedadItem));
    }

    function listFromSnapshot(snapshot) {
      var list = [];
      snapshot.docs.forEach(function (doc, i) {
        var d = doc.data();
        list.push(normalizarPropiedadItem(Object.assign({ id: doc.id }, d), i));
      });
      return list;
    }

    function subscribePropiedades(onUpdate) {
      if (!window.FIREBASE_READY || !window.FIREBASE_DB) return null;
      return window.FIREBASE_DB.collection('propiedades').orderBy('titulo').onSnapshot(
        function (snapshot) {
          onUpdate(listFromSnapshot(snapshot));
        },
        function (err) {
          console.warn('Error en tiempo real Firestore:', err && err.message);
          onUpdate((window.PROPIEDADES || []).map(normalizarPropiedadItem));
        }
      );
    }

    function normalizarPropiedadItem(p, i) {
      var id = p.id != null ? p.id : (i + 1);
      var imagenes = Array.isArray(p.imagenes) ? p.imagenes : (p.imagen ? [p.imagen] : []);
      return {
        id: id,
        codigo: p.codigo || '',
        estado: p.estado || 'disponible',
        titulo: p.titulo || '',
        tipo: p.tipo || 'venta',
        pais: p.pais != null ? p.pais : 'Colombia',
        ciudad: p.ciudad || '',
        municipio: p.municipio || '',
        precio: p.precio || 'Consultar',
        descripcion: p.descripcion || '',
        imagen: (p.imagenes && p.imagenes[0]) || p.imagen || '',
        imagenes: imagenes,
        video: p.video || '',
        arriendoPorDia: p.arriendoPorDia === true
      };
    }

    /* Con Firebase: escucha en tiempo real para que las nuevas publicaciones aparezcan sin recargar */
    if (window.FIREBASE_READY && window.FIREBASE_DB) {
      var initDone = false;
      subscribePropiedades(function (list) {
        if (!initDone) {
          runInit(list);
          initDone = true;
        } else {
          window.PROPIEDADES = list;
          aplicarFiltros();
        }
      });
    } else {
      loadPropiedades().then(runInit);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

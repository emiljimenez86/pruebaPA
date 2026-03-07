(function () {
  'use strict';

  var WHATSAPP_NUMERO = '573215000000'; // Colombia +57 321 500 00 00

  function getWhatsAppUrl(mensaje) {
    return 'https://wa.me/' + WHATSAPP_NUMERO + '?text=' + encodeURIComponent(mensaje);
  }

  function initVideoYoutube() {
    var section = document.getElementById('seccion-video');
    var iframe = document.getElementById('iframe-youtube');
    if (!section || !iframe) return;
    var url = (section.getAttribute('data-youtube-url') || '').trim();
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

  function renderTarjeta(p) {
    var mensaje = 'Hola, me interesa esta propiedad para ' + (p.tipo === 'venta' ? 'comprar' : 'arrendar') + ':\n\n' +
      p.titulo + '\n' + ubicacionTexto(p) + '\n\n' + 'Vi el anuncio en la web de Inmobiliaria Pérez Araujo.';
    var urlWhatsApp = getWhatsAppUrl(mensaje);

    var div = document.createElement('article');
    div.className = 'tarjeta';
    var imagenHtml;
    if (p.imagen) {
      imagenHtml =
        '<div class="tarjeta-imagen"><img src="' + escapeAttr(p.imagen) + '" alt="' + escapeHtml(p.titulo) + '"></div>';
    } else {
      imagenHtml = '<div class="tarjeta-imagen">🏠</div>';
    }

    var videoHtml = '';
    if (p.video) {
      videoHtml = '<a href="' + escapeAttr(p.video) + '" class="tarjeta-video" target="_blank" rel="noopener">🎬 Ver video</a>';
    }

    div.innerHTML =
      imagenHtml +
      '<div class="tarjeta-cuerpo">' +
        '<div class="tarjeta-tipo">' + (p.tipo === 'venta' ? 'Venta' : 'Arriendo') + '</div>' +
        '<h3 class="tarjeta-titulo">' + escapeHtml(p.titulo) + '</h3>' +
        '<p class="tarjeta-ubicacion">' + escapeHtml(ubicacionTexto(p)) + '</p>' +
        '<p class="tarjeta-precio">' + escapeHtml(p.precio || 'Consultar') + '</p>' +
        videoHtml +
        '<a href="' + escapeAttr(urlWhatsApp) + '" class="btn" target="_blank" rel="noopener">Consultar por WhatsApp</a>' +
      '</div>';
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
  }

  function aplicarFiltros() {
    var propiedades = window.PROPIEDADES || [];
    var pais = document.getElementById('filtro-pais');
    var ciudad = document.getElementById('filtro-ciudad');
    var municipio = document.getElementById('filtro-municipio');
    var tipo = document.getElementById('filtro-tipo');

    var filtros = {
      pais: pais ? pais.value : '',
      ciudad: ciudad ? ciudad.value : '',
      municipio: municipio ? municipio.value : '',
      tipo: tipo ? tipo.value : ''
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

    var fab = document.getElementById('fab-whatsapp');
    if (fab) {
      fab.href = urlGeneral;
    }
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
            snapshot.docs.forEach(function (doc) {
              var d = doc.data();
              list.push({
                id: doc.id,
                titulo: d.titulo || '',
                tipo: d.tipo || 'venta',
                pais: d.pais != null ? d.pais : 'Colombia',
                ciudad: d.ciudad || '',
                municipio: d.municipio || '',
                precio: d.precio || 'Consultar',
                descripcion: d.descripcion || '',
                imagen: d.imagen || '',
                video: d.video || ''
              });
            });
            return list;
          })
          .catch(function () {
            return window.PROPIEDADES || [];
          });
      }
      return Promise.resolve(window.PROPIEDADES || []);
    }

    loadPropiedades().then(runInit);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

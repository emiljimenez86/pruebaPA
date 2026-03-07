(function () {
  'use strict';

  var WHATSAPP_NUMERO = '573215000000'; // +57 321 500 00 00

  function getWhatsAppUrl(mensaje) {
    return 'https://wa.me/' + WHATSAPP_NUMERO + '?text=' + encodeURIComponent(mensaje);
  }

  function escapeHtml(s) {
    if (!s) return '';
    var div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function llenarSelect(selectId, opciones, valorVacio) {
    var select = document.getElementById(selectId);
    if (!select) return;
    select.innerHTML = '';
    var opt0 = document.createElement('option');
    opt0.value = '';
    opt0.textContent = valorVacio || 'Seleccione';
    select.appendChild(opt0);
    (opciones || []).forEach(function (valor) {
      var opt = document.createElement('option');
      opt.value = valor;
      opt.textContent = valor;
      select.appendChild(opt);
    });
  }

  function initDepartamentosMunicipiosPublicar() {
    var dptoSelect = document.getElementById('publicar-departamento');
    var munSelect = document.getElementById('publicar-municipio');
    if (!dptoSelect || !munSelect) return;

    var mapa = window.CO_DEPARTAMENTOS;
    if (!mapa) {
      if (window.CO_DEPARTAMENTOS_LIST && Array.isArray(window.CO_DEPARTAMENTOS_LIST)) {
        mapa = {};
        window.CO_DEPARTAMENTOS_LIST.forEach(function (item) {
          if (item && item.departamento) mapa[item.departamento] = item.ciudades || [];
        });
        window.CO_DEPARTAMENTOS = mapa;
      } else return;
    }

    var departamentos = Object.keys(mapa).sort();
    llenarSelect('publicar-departamento', departamentos, 'Seleccione departamento');
    llenarSelect('publicar-municipio', [], 'Seleccione municipio');

    if (!dptoSelect.dataset.deptoInicializado) {
      dptoSelect.dataset.deptoInicializado = '1';
      dptoSelect.addEventListener('change', function () {
        var dpto = dptoSelect.value;
        var municipios = dpto ? (mapa[dpto] || []) : [];
        llenarSelect('publicar-municipio', municipios, 'Seleccione municipio');
      });
    }
  }

  function mostrarOcultarColombiaUbicacion(mostrar) {
    var block = document.getElementById('filtro-colombia-ubicacion');
    var dpto = document.getElementById('publicar-departamento');
    var mun = document.getElementById('publicar-municipio');
    if (!block) return;
    if (mostrar) {
      block.classList.remove('oculto');
      initDepartamentosMunicipiosPublicar();
    } else {
      block.classList.add('oculto');
      if (dpto) dpto.value = '';
      if (mun) llenarSelect('publicar-municipio', [], 'Seleccione municipio');
    }
  }

  function llenarSelectPaisesPublicar(paises) {
    var list = document.getElementById('filtro-pais-list');
    var triggerContent = document.getElementById('filtro-pais-trigger-content');
    var inputPais = document.getElementById('filtro-pais');
    var trigger = document.getElementById('filtro-pais-trigger');
    if (!list || !triggerContent || !inputPais || !trigger) return;

    list.innerHTML = '';
    (paises || []).forEach(function (p) {
      var item = document.createElement('div');
      item.className = 'filtro-pais-item';
      item.setAttribute('role', 'option');
      item.dataset.country = p.country;
      item.dataset.flag = p.flag || '';
      item.innerHTML = '<img src="' + (p.flag || '').replace(/"/g, '&quot;') + '" alt="" class="filtro-pais-flag" width="24" height="18" aria-hidden="true"><span>' + escapeHtml(p.country) + '</span>';
      list.appendChild(item);
    });

    inputPais.value = 'Colombia';
    var colombia = (paises || []).filter(function (p) { return p.country === 'Colombia'; })[0];
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

  function initPaisYUbicacionPublicar() {
    var inputPais = document.getElementById('filtro-pais');
    var blockColombia = document.getElementById('filtro-colombia-ubicacion');
    if (!inputPais || !blockColombia) return;
    inputPais.addEventListener('change', function () {
      mostrarOcultarColombiaUbicacion(inputPais.value === 'Colombia');
    });
  }

  function armarMensajePublicar(form) {
    var datos = new FormData(form);
    var nombre = (datos.get('nombre') || '').trim();
    var telefono = (datos.get('telefono') || '').trim();
    var email = (datos.get('email') || '').trim();
    var pais = (datos.get('pais') || '').trim();
    var departamento = (datos.get('departamento') || '').trim();
    var municipio = (datos.get('municipio') || '').trim();
    var zona = (datos.get('zona') || '').trim();
    var tipoInmueble = (datos.get('tipo_inmueble') || '').trim();
    var valorEstimado = (datos.get('valor_estimado') || '').trim();
    var mensaje = (datos.get('mensaje') || '').trim();

    var lineas = [
      'Hola, quiero *publicar* una propiedad en la web de Inmobiliaria Pérez Araujo.',
      '',
      '*Nombre:* ' + nombre,
      '*Celular:* ' + telefono,
      '*E-mail:* ' + email,
      '*País:* ' + (pais || '-'),
      '*Departamento:* ' + (departamento || '-'),
      '*Municipio:* ' + (municipio || '-'),
      '*Zona / Sector / Barrio:* ' + (zona || '-'),
      '*Tipo de inmueble:* ' + (tipoInmueble || '-'),
      '*Valor estimado:* ' + (valorEstimado || 'A convenir'),
      '',
      '*Mensaje:*',
      mensaje,
      '',
      '_(Enviado desde el formulario Publicar de la web)_'
    ];
    return lineas.join('\n');
  }

  function init() {
    var paises = window.PAISES_BANDERAS;
    if (Array.isArray(paises) && paises.length > 0) {
      llenarSelectPaisesPublicar(paises);
    }
    initPaisYUbicacionPublicar();
    mostrarOcultarColombiaUbicacion(true);

    var form = document.getElementById('form-publicar');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var check = document.getElementById('acepto-politica');
        if (check && !check.checked) {
          alert('Debes aceptar la Política de tratamiento de datos para continuar.');
          check.focus();
          return;
        }
        var mensaje = armarMensajePublicar(form);
        var url = getWhatsAppUrl(mensaje);
        window.open(url, '_blank', 'noopener');
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

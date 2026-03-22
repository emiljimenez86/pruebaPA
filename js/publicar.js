(function () {
  'use strict';

  function tt(key, vars) {
    return window.I18n && typeof I18n.t === 'function' ? I18n.t(key, vars) : key;
  }

  var WHATSAPP_NUMERO = '573145000000'; // +57 314 500 00 00

  var DRAFT_KEY = 'publicarFormDraft';

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
    opt0.textContent = valorVacio || tt('pub.ph_sel');
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
    llenarSelect('publicar-departamento', departamentos, tt('pub.opt_sel_dept'));
    llenarSelect('publicar-municipio', [], tt('pub.opt_sel_mun'));

    if (!dptoSelect.dataset.deptoInicializado) {
      dptoSelect.dataset.deptoInicializado = '1';
      dptoSelect.addEventListener('change', function () {
        var dpto = dptoSelect.value;
        var municipios = dpto ? (mapa[dpto] || []) : [];
        llenarSelect('publicar-municipio', municipios, tt('pub.opt_sel_mun'));
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
      if (mun) llenarSelect('publicar-municipio', [], tt('pub.opt_sel_mun'));
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

  function saveFormDraft(form) {
    var inputPais = document.getElementById('filtro-pais');
    var draft = {
      nombre: (form.nombre && form.nombre.value) || '',
      telefono: (form.telefono && form.telefono.value) || '',
      email: (form.email && form.email.value) || '',
      pais: (inputPais && inputPais.value) || 'Colombia',
      departamento: (form.departamento && form.departamento.value) || '',
      municipio: (form.municipio && form.municipio.value) || '',
      zona: (form.zona && form.zona.value) || '',
      tipo_inmueble: (form.tipo_inmueble && form.tipo_inmueble.value) || '',
      valor_estimado: (form.valor_estimado && form.valor_estimado.value) || '',
      mensaje: (form.mensaje && form.mensaje.value) || ''
    };
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch (e) {}
  }

  function restoreFormDraft(form) {
    var json;
    try {
      json = sessionStorage.getItem(DRAFT_KEY);
    } catch (e) { return false; }
    if (!json) return false;
    var draft;
    try {
      draft = JSON.parse(json);
    } catch (e) { return false; }
    if (!draft) return false;

    if (form.nombre) form.nombre.value = draft.nombre || '';
    if (form.telefono) form.telefono.value = draft.telefono || '';
    if (form.email) form.email.value = draft.email || '';
    if (form.zona) form.zona.value = draft.zona || '';
    if (form.tipo_inmueble) form.tipo_inmueble.value = draft.tipo_inmueble || '';
    if (form.valor_estimado) form.valor_estimado.value = draft.valor_estimado || '';
    if (form.mensaje) form.mensaje.value = draft.mensaje || '';

    var inputPais = document.getElementById('filtro-pais');
    if (inputPais && draft.pais) {
      inputPais.value = draft.pais;
      var paises = window.PAISES_BANDERAS;
      if (Array.isArray(paises)) {
        var found = paises.filter(function (p) { return p.country === draft.pais; })[0];
        var triggerContent = document.getElementById('filtro-pais-trigger-content');
        if (triggerContent && found) {
          triggerContent.innerHTML = '<img src="' + (found.flag || '').replace(/"/g, '&quot;') + '" alt="" class="filtro-pais-flag" width="24" height="18" aria-hidden="true"><span>' + escapeHtml(found.country) + '</span>';
        }
      }
      mostrarOcultarColombiaUbicacion(draft.pais === 'Colombia');
      if (draft.pais === 'Colombia' && draft.departamento) {
        initDepartamentosMunicipiosPublicar();
        var dptoSelect = document.getElementById('publicar-departamento');
        var munSelect = document.getElementById('publicar-municipio');
        if (dptoSelect) dptoSelect.value = draft.departamento;
        if (dptoSelect && dptoSelect.value) dptoSelect.dispatchEvent(new Event('change', { bubbles: true }));
        setTimeout(function () {
          if (munSelect) munSelect.value = draft.municipio || '';
        }, 0);
      }
    }

    try {
      sessionStorage.removeItem(DRAFT_KEY);
    } catch (e) {}
    var acepto = document.getElementById('acepto-politica');
    if (acepto) {
      acepto.focus();
      acepto.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return true;
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
      tt('pub.wa_1'),
      '',
      tt('pub.wa_name') + nombre,
      tt('pub.wa_cell') + telefono,
      tt('pub.wa_email') + email,
      tt('pub.wa_country') + (pais || '-'),
      tt('pub.wa_dept') + (departamento || '-'),
      tt('pub.wa_mun') + (municipio || '-'),
      tt('pub.wa_zone') + (zona || '-'),
      tt('pub.wa_type') + (tipoInmueble || '-'),
      tt('pub.wa_price') + (valorEstimado || tt('pub.wa_valor_def')),
      '',
      tt('pub.wa_msg'),
      mensaje,
      '',
      tt('pub.wa_footer')
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
      var linkPolitica = document.getElementById('link-politica-publicar');
      if (linkPolitica) {
        linkPolitica.addEventListener('click', function (e) {
          e.preventDefault();
          saveFormDraft(form);
          window.location.href = 'politica-privacidad.html';
        });
      }
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var check = document.getElementById('acepto-politica');
        if (check && !check.checked) {
          alert(tt('pub.alert_politica'));
          check.focus();
          return;
        }
        var mensaje = armarMensajePublicar(form);
        var url = getWhatsAppUrl(mensaje);
        window.open(url, '_blank', 'noopener');
        try {
          sessionStorage.removeItem(DRAFT_KEY);
        } catch (err) {}
      });
    }

    if (form) {
      setTimeout(function () {
        restoreFormDraft(form);
      }, 100);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

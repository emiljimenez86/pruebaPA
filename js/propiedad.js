(function () {
  'use strict';

  function tt(key, vars) {
    return window.I18n && typeof I18n.t === 'function' ? I18n.t(key, vars) : key;
  }

  var WHATSAPP_NUMERO = '573145000000';

  function getWhatsAppUrl(mensaje) {
    return 'https://wa.me/' + WHATSAPP_NUMERO + '?text=' + encodeURIComponent(mensaje);
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

  function ubicacionTexto(p) {
    var partes = [];
    if (p.municipio && p.municipio !== p.ciudad) partes.push(p.municipio);
    if (p.ciudad) partes.push(p.ciudad);
    if (p.pais && partes.length === 0) partes.push(p.pais);
    return partes.length ? partes.join(', ') : (p.pais || tt('tarjeta.sin_ubicacion'));
  }

  function formatPrecio(precioRaw) {
    if (precioRaw == null) return tt('tarjeta.consultar_precio');
    var s = String(precioRaw).trim();
    if (!s) return tt('tarjeta.consultar_precio');
    if (!/\d/.test(s)) {
      if (/^consultar$/i.test(s.trim())) return tt('tarjeta.consultar_precio');
      return s;
    }
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

  function loadPropiedades() {
    if (window.FIREBASE_READY && window.FIREBASE_DB) {
      return window.FIREBASE_DB.collection('propiedades').orderBy('titulo').get()
        .then(function (snapshot) {
          var list = [];
          snapshot.docs.forEach(function (doc) {
            var d = doc.data();
            list.push(normalizarPropiedad(doc.id, d));
          });
          return list;
        })
        .catch(function () {
          return (window.PROPIEDADES || []).map(function (p, i) {
            return normalizarPropiedad(p.id || (i + 1), p);
          });
        });
    }
    var list = window.PROPIEDADES || [];
    return Promise.resolve(list.map(function (p, i) {
      return normalizarPropiedad(p.id || (i + 1), p);
    }));
  }

  function normalizarPropiedad(id, d) {
    var imagenes = Array.isArray(d.imagenes) ? d.imagenes : (d.imagen ? [d.imagen] : []);
    return {
      id: id,
      estado: d.estado || 'disponible',
      codigo: d.codigo || '',
      titulo: d.titulo || '',
      tipo: d.tipo || 'venta',
      pais: d.pais != null ? d.pais : 'Colombia',
      ciudad: d.ciudad || '',
      municipio: d.municipio || '',
      precio: d.precio || 'Consultar',
      descripcion: d.descripcion || '',
      imagen: (d.imagenes && d.imagenes[0]) || d.imagen || '',
      imagenes: imagenes,
      video: d.video || '',
      arriendoPorDia: d.arriendoPorDia === true
    };
  }

  function extraerIdYoutube(url) {
    if (!url || !url.trim()) return null;
    if (url.indexOf('youtu.be/') !== -1) return url.split('youtu.be/')[1].split('?')[0].split('&')[0];
    var match = url.match(/[?&]v=([^&]+)/);
    return match ? match[1] : null;
  }

  /** Convierte enlace de Google Drive "compartir" al formato que sirve en <img src>.
   * Usamos thumbnail para evitar 403 cuando se carga desde otro sitio. size ej: w800, w1200 */
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
      var sz = (size && String(size).match(/^[wm]\d+$/)) ? size : 'w1200';
      return 'https://drive.google.com/thumbnail?id=' + id + '&sz=' + sz;
    }
    return u;
  }

  /** Si la thumbnail de Drive falla, probar uc?export=view (en algunos dispositivos funciona mejor) */
  function driveThumbToUc(src) {
    if (!src || src.indexOf('drive.google.com/thumbnail') === -1) return '';
    var m = src.match(/[?&]id=([^&]+)/);
    return m ? 'https://drive.google.com/uc?export=view&id=' + m[1] : '';
  }

  /** Proxy para cuando thumbnail y uc fallan (p. ej. en algunos móviles) */
  function driveThumbToProxy(src) {
    var uc = driveThumbToUc(src);
    return uc ? 'https://wsrv.nl/?url=' + encodeURIComponent(uc) + '&n=-1' : '';
  }

  function renderDetalle(p) {
    var main = document.getElementById('detalle-propiedad');
    var cargando = document.getElementById('detalle-cargando');
    var noEncontrado = document.getElementById('detalle-no-encontrado');
    if (!main || !cargando || !noEncontrado) return;

    cargando.classList.add('oculto');
    noEncontrado.classList.add('oculto');

    var ubicacion = ubicacionTexto(p);
    var imagenes = p.imagenes && p.imagenes.length > 0 ? p.imagenes : (p.imagen ? [p.imagen] : []);
    imagenes = imagenes.map(function (u) { return urlImagenDrive(u, 'w1200'); });
    var tipoLabel = p.tipo === 'venta' ? tt('tarjeta.venta') : tt('tarjeta.arriendo');
    if (p.arriendoPorDia) tipoLabel += tt('tarjeta.por_dia');
    var codigo = (p.codigo != null && String(p.codigo).trim() !== '') ? String(p.codigo) : String(p.id);

    var galeriaHtml = '';
    if (imagenes.length > 0) {
      galeriaHtml = '<div class="detalle-galeria" role="region" aria-label="' + escapeAttr(tt('detalle.galeria_aria')) + '">' +
        '<div class="detalle-galeria__principal">' +
          '<img class="detalle-galeria__img" id="detalle-galeria-img" src="' + escapeAttr(imagenes[0]) + '" alt="' + escapeHtml(p.titulo) + '" title="' + escapeAttr(tt('detalle.toca_amp')) + '" referrerpolicy="no-referrer">' +
          (imagenes.length > 1 ? (
            '<button type="button" class="detalle-galeria__btn detalle-galeria__btn--prev" id="galeria-prev" aria-label="' + escapeAttr(tt('detalle.foto_ant')) + '">‹</button>' +
            '<button type="button" class="detalle-galeria__btn detalle-galeria__btn--next" id="galeria-next" aria-label="' + escapeAttr(tt('detalle.foto_sig')) + '">›</button>' +
            '<div class="detalle-galeria__dots" id="galeria-dots"></div>'
          ) : '') +
        '</div>' +
        '</div>';
    } else {
      galeriaHtml = '<div class="detalle-galeria"><div class="detalle-galeria__principal"><div class="detalle-galeria__placeholder">🏠</div></div></div>';
    }

    var videoHtml = '';
    var videoId = extraerIdYoutube(p.video);
    if (videoId) {
      videoHtml = '<section class="detalle-video" aria-label="' + escapeAttr(tt('detalle.video')) + '">' +
        '<h3>' + escapeHtml(tt('detalle.video')) + '</h3>' +
        '<div class="detalle-video__wrap">' +
          '<iframe src="https://www.youtube.com/embed/' + escapeAttr(videoId) + '?rel=0" title="' + escapeAttr(tt('detalle.video')) + '" allowfullscreen class="detalle-video__iframe"></iframe>' +
        '</div>' +
        '</section>';
    } else if (p.video) {
      videoHtml = '<section class="detalle-video"><h3>' + escapeHtml(tt('detalle.video')) + '</h3><a href="' + escapeAttr(p.video) + '" target="_blank" rel="noopener" class="btn">' + escapeHtml(tt('detalle.ver_video_ext')) + '</a></section>';
    }

    var intro = p.tipo === 'venta' ? tt('msg.wa_prop_sale') : tt('msg.wa_prop_rent');
    var mensaje = intro + p.titulo + '\n' + ubicacion + '\n' +
      tt('msg.wa_prop_codigo') + codigo + tt('msg.wa_prop_footer');
    var urlWhatsApp = getWhatsAppUrl(mensaje);

    /* Lightbox fuera de .detalle-wrap: ese bloque usa backdrop-filter y en móvil ancla
       position:fixed al panel (no a la ventana), provocando franjas negras y recorte. */
    main.innerHTML =
      '<div class="detalle-wrap">' +
        '<a href="index.html" class="detalle-volver">' + escapeHtml(tt('detalle.volver')) + '</a>' +
        galeriaHtml +
        '<div class="detalle-info">' +
        '<span class="detalle-tipo">' + escapeHtml(tipoLabel) + '</span>' +
        '<h1 class="detalle-titulo">' + escapeHtml(p.titulo) + '</h1>' +
        '<p class="detalle-codigo">' + escapeHtml(tt('detalle.codigo')) + escapeHtml(codigo) + '</p>' +
          '<p class="detalle-ubicacion">' + escapeHtml(ubicacion) + '</p>' +
          '<p class="detalle-precio">' + escapeHtml(formatPrecio(p.precio)) + '</p>' +
          (p.descripcion ? '<div class="detalle-descripcion">' + escapeHtml(p.descripcion) + '</div>' : '') +
          videoHtml +
          '<a href="' + escapeAttr(urlWhatsApp) + '" class="btn detalle-whatsapp" target="_blank" rel="noopener">' + escapeHtml(tt('detalle.whatsapp')) + '</a>' +
        '</div>' +
      '</div>' +
      '<div id="detalle-lightbox" class="detalle-lightbox oculto" aria-hidden="true">' +
        '<button type="button" class="detalle-lightbox__cerrar" id="lightbox-cerrar" aria-label="' + escapeAttr(tt('detalle.cerrar')) + '">×</button>' +
        (imagenes.length > 1 ? '<button type="button" class="detalle-lightbox__prev" id="lightbox-prev" aria-label="' + escapeAttr(tt('detalle.amp_ant')) + '">‹</button>' : '') +
        '<div class="detalle-lightbox__viewport" id="lightbox-viewport" role="img" aria-label="' + escapeAttr(tt('detalle.tap_more')) + '">' +
          '<img class="detalle-lightbox__img" id="lightbox-img" src="" alt="" referrerpolicy="no-referrer">' +
        '</div>' +
        (imagenes.length > 1 ? '<button type="button" class="detalle-lightbox__next" id="lightbox-next" aria-label="' + escapeAttr(tt('detalle.amp_sig')) + '">›</button>' : '') +
      '</div>';
    if (typeof document.title !== 'undefined') {
      document.title = (p.titulo || 'Propiedad') + ' | Inmobiliaria Pérez Araujo';
    }

    var galleryImgEl = document.getElementById('detalle-galeria-img');
    if (galleryImgEl) {
      galleryImgEl.referrerPolicy = 'no-referrer';
      galleryImgEl.onerror = function () {
        var uc = driveThumbToUc(galleryImgEl.src);
        var proxy = driveThumbToProxy(galleryImgEl.src);
        if (uc && galleryImgEl.src !== uc) {
          galleryImgEl.src = uc;
          galleryImgEl.dataset.proxyUrl = proxy;
        } else if (galleryImgEl.dataset.proxyUrl) {
          galleryImgEl.src = galleryImgEl.dataset.proxyUrl;
          delete galleryImgEl.dataset.proxyUrl;
          galleryImgEl.onerror = null;
        }
      };
    }

    if (imagenes.length > 1) {
      var idx = 0;
      var imgEl = document.getElementById('detalle-galeria-img');
      var dotsEl = document.getElementById('galeria-dots');
      for (var i = 0; i < imagenes.length; i++) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'detalle-galeria__dot' + (i === 0 ? ' detalle-galeria__dot--active' : '');
        dot.setAttribute('aria-label', tt('detalle.ir_foto', { n: i + 1 }));
        dot.setAttribute('data-index', String(i));
        dotsEl.appendChild(dot);
      }
      function actualizarGaleria() {
        if (idx < 0) idx = imagenes.length - 1;
        if (idx >= imagenes.length) idx = 0;
        if (imgEl) imgEl.src = imagenes[idx];
        if (dotsEl) {
          dotsEl.querySelectorAll('.detalle-galeria__dot').forEach(function (d, i) {
            d.classList.toggle('detalle-galeria__dot--active', i === idx);
          });
        }
      }
      document.getElementById('galeria-prev').addEventListener('click', function () {
        idx--;
        actualizarGaleria();
      });
      document.getElementById('galeria-next').addEventListener('click', function () {
        idx++;
        actualizarGaleria();
      });
      dotsEl.querySelectorAll('.detalle-galeria__dot').forEach(function (dot) {
        dot.addEventListener('click', function () {
          idx = parseInt(dot.getAttribute('data-index'), 10);
          actualizarGaleria();
        });
      });
    }

    /* Lightbox: tocar imagen para ver a pantalla completa */
    var galleryImg = document.getElementById('detalle-galeria-img');
    var lightbox = document.getElementById('detalle-lightbox');
    var lightboxViewport = document.getElementById('lightbox-viewport');
    var lightboxImg = document.getElementById('lightbox-img');
    var lightboxCerrar = document.getElementById('lightbox-cerrar');
    var lightboxPrev = document.getElementById('lightbox-prev');
    var lightboxNext = document.getElementById('lightbox-next');
    if (lightboxImg) {
      lightboxImg.referrerPolicy = 'no-referrer';
      lightboxImg.onerror = function () {
        var uc = driveThumbToUc(lightboxImg.src);
        var proxy = driveThumbToProxy(lightboxImg.src);
        if (uc && lightboxImg.src !== uc) {
          lightboxImg.src = uc;
          lightboxImg.dataset.proxyUrl = proxy;
        } else if (lightboxImg.dataset.proxyUrl) {
          lightboxImg.src = lightboxImg.dataset.proxyUrl;
          delete lightboxImg.dataset.proxyUrl;
          lightboxImg.onerror = null;
        }
      };
    }
    function resetZoomAndScroll() {
      if (lightboxViewport) {
        lightboxViewport.classList.remove('is-zoomed');
        lightboxViewport.scrollLeft = 0;
        lightboxViewport.scrollTop = 0;
      }
    }

    function toggleZoomAt(clientX, clientY) {
      if (!lightboxViewport) return;
      var wasZoomed = lightboxViewport.classList.contains('is-zoomed');
      if (wasZoomed) {
        resetZoomAndScroll();
        return;
      }

      lightboxViewport.classList.add('is-zoomed');

      // Centrar el punto tocado/clicado en la medida de lo posible
      var rect = lightboxViewport.getBoundingClientRect();
      var x = clientX - rect.left;
      var y = clientY - rect.top;
      var targetLeft = Math.max(0, x + lightboxViewport.scrollLeft - (lightboxViewport.clientWidth / 2));
      var targetTop = Math.max(0, y + lightboxViewport.scrollTop - (lightboxViewport.clientHeight / 2));
      lightboxViewport.scrollLeft = targetLeft;
      lightboxViewport.scrollTop = targetTop;
    }

    if (galleryImg && lightbox && lightboxImg && lightboxViewport) {
      var lightboxIdx = 0;
      function openLightbox() {
        var src = galleryImg.src;
        for (var i = 0; i < imagenes.length; i++) {
          if (imagenes[i] === src || src.indexOf(imagenes[i]) !== -1) {
            lightboxIdx = i;
            break;
          }
        }
        lightboxImg.src = imagenes[lightboxIdx] || src;
        lightbox.classList.remove('oculto');
        lightbox.setAttribute('aria-hidden', 'false');
        if (lightboxPrev) lightboxPrev.classList.toggle('oculto', imagenes.length <= 1);
        if (lightboxNext) lightboxNext.classList.toggle('oculto', imagenes.length <= 1);
        resetZoomAndScroll();
      }
      function closeLightbox() {
        lightbox.classList.add('oculto');
        lightbox.setAttribute('aria-hidden', 'true');
        resetZoomAndScroll();
      }
      galleryImg.addEventListener('click', openLightbox);
      if (lightboxCerrar) lightboxCerrar.addEventListener('click', closeLightbox);
      lightbox.addEventListener('click', function (e) {
        if (e.target === lightbox) closeLightbox();
      });

      // Zoom con desplazamiento
      // Desktop: doble clic; móvil: un toque
      lightboxViewport.addEventListener('dblclick', function (e) {
        e.preventDefault();
        toggleZoomAt(e.clientX, e.clientY);
      });
      lightboxViewport.addEventListener('click', function (e) {
        // En móviles es más natural un solo toque
        if ('ontouchstart' in window) {
          e.preventDefault();
          toggleZoomAt(e.clientX, e.clientY);
        }
      });

      // Arrastrar para mover cuando está en zoom
      (function enableDragToPan() {
        var dragging = false;
        var startX = 0;
        var startY = 0;
        var startScrollLeft = 0;
        var startScrollTop = 0;

        function onPointerDown(e) {
          if (!lightboxViewport.classList.contains('is-zoomed')) return;
          if (e.button != null && e.button !== 0) return; // solo click izquierdo
          dragging = true;
          startX = e.clientX;
          startY = e.clientY;
          startScrollLeft = lightboxViewport.scrollLeft;
          startScrollTop = lightboxViewport.scrollTop;
          try { lightboxViewport.setPointerCapture(e.pointerId); } catch (err) {}
        }

        function onPointerMove(e) {
          if (!dragging) return;
          var dx = e.clientX - startX;
          var dy = e.clientY - startY;
          lightboxViewport.scrollLeft = startScrollLeft - dx;
          lightboxViewport.scrollTop = startScrollTop - dy;
        }

        function endDrag(e) {
          if (!dragging) return;
          dragging = false;
          try { lightboxViewport.releasePointerCapture(e.pointerId); } catch (err) {}
        }

        lightboxViewport.addEventListener('pointerdown', onPointerDown);
        lightboxViewport.addEventListener('pointermove', onPointerMove);
        lightboxViewport.addEventListener('pointerup', endDrag);
        lightboxViewport.addEventListener('pointercancel', endDrag);
        lightboxViewport.addEventListener('pointerleave', endDrag);
      })();

      document.addEventListener('keydown', function onKey(e) {
        if (e.key === 'Escape' && !lightbox.classList.contains('oculto')) {
          closeLightbox();
        }
      });
      if (imagenes.length > 1 && lightboxPrev && lightboxNext) {
        lightboxPrev.addEventListener('click', function (e) {
          e.stopPropagation();
          lightboxIdx = (lightboxIdx - 1 + imagenes.length) % imagenes.length;
          lightboxImg.src = imagenes[lightboxIdx];
          resetZoomAndScroll();
        });
        lightboxNext.addEventListener('click', function (e) {
          e.stopPropagation();
          lightboxIdx = (lightboxIdx + 1) % imagenes.length;
          lightboxImg.src = imagenes[lightboxIdx];
          resetZoomAndScroll();
        });
      }
    }
  }

  function init() {
    var params = new URLSearchParams(window.location.search);
    var id = params.get('id');
    var main = document.getElementById('detalle-propiedad');
    var cargando = document.getElementById('detalle-cargando');
    var noEncontrado = document.getElementById('detalle-no-encontrado');

    if (!id || !main) return;

    loadPropiedades().then(function (list) {
      var p = list.filter(function (x) { return String(x.id) === String(id); })[0];
      if (!p) {
        if (cargando) cargando.classList.add('oculto');
        if (noEncontrado) noEncontrado.classList.remove('oculto');
        return;
      }
      renderDetalle(p);
    }).catch(function () {
      if (cargando) cargando.classList.add('oculto');
      if (noEncontrado) noEncontrado.classList.remove('oculto');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

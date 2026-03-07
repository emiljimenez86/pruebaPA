(function () {
  'use strict';

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
    return partes.length ? partes.join(', ') : (p.pais || 'Sin ubicación');
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
    var tipoLabel = p.tipo === 'venta' ? 'Venta' : 'Arriendo';
    if (p.arriendoPorDia) tipoLabel += ' por día';

    var galeriaHtml = '';
    if (imagenes.length > 0) {
      galeriaHtml = '<div class="detalle-galeria" role="region" aria-label="Galería de fotos">' +
        '<div class="detalle-galeria__principal">' +
          '<img class="detalle-galeria__img" id="detalle-galeria-img" src="' + escapeAttr(imagenes[0]) + '" alt="' + escapeHtml(p.titulo) + '" title="Toca para ver más grande">' +
          (imagenes.length > 1 ? (
            '<button type="button" class="detalle-galeria__btn detalle-galeria__btn--prev" id="galeria-prev" aria-label="Foto anterior">‹</button>' +
            '<button type="button" class="detalle-galeria__btn detalle-galeria__btn--next" id="galeria-next" aria-label="Siguiente foto">›</button>' +
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
      videoHtml = '<section class="detalle-video" aria-label="Video">' +
        '<h3>Video</h3>' +
        '<div class="detalle-video__wrap">' +
          '<iframe src="https://www.youtube.com/embed/' + escapeAttr(videoId) + '?rel=0" title="Video de la propiedad" allowfullscreen class="detalle-video__iframe"></iframe>' +
        '</div>' +
        '</section>';
    } else if (p.video) {
      videoHtml = '<section class="detalle-video"><h3>Video</h3><a href="' + escapeAttr(p.video) + '" target="_blank" rel="noopener" class="btn">🎬 Ver video</a></section>';
    }

    var mensaje = 'Hola, me interesa esta propiedad para ' + (p.tipo === 'venta' ? 'comprar' : 'arrendar') + ':\n\n' +
      p.titulo + '\n' + ubicacion + '\n\n' + 'Vi el anuncio en la web de Inmobiliaria Pérez Araujo.';
    var urlWhatsApp = getWhatsAppUrl(mensaje);

    main.innerHTML =
      '<div class="detalle-wrap">' +
        '<a href="index.html" class="detalle-volver">← Volver al listado</a>' +
        galeriaHtml +
        '<div id="detalle-lightbox" class="detalle-lightbox oculto" aria-hidden="true">' +
          '<button type="button" class="detalle-lightbox__cerrar" id="lightbox-cerrar" aria-label="Cerrar">×</button>' +
          (imagenes.length > 1 ? '<button type="button" class="detalle-lightbox__prev" id="lightbox-prev" aria-label="Anterior">‹</button>' : '') +
          '<img class="detalle-lightbox__img" id="lightbox-img" src="" alt="">' +
          (imagenes.length > 1 ? '<button type="button" class="detalle-lightbox__next" id="lightbox-next" aria-label="Siguiente">›</button>' : '') +
        '</div>' +
        '<div class="detalle-info">' +
          '<span class="detalle-tipo">' + escapeHtml(tipoLabel) + '</span>' +
          '<h1 class="detalle-titulo">' + escapeHtml(p.titulo) + '</h1>' +
          '<p class="detalle-ubicacion">' + escapeHtml(ubicacion) + '</p>' +
          '<p class="detalle-precio">' + escapeHtml(p.precio || 'Consultar') + '</p>' +
          (p.descripcion ? '<div class="detalle-descripcion">' + escapeHtml(p.descripcion) + '</div>' : '') +
          videoHtml +
          '<a href="' + escapeAttr(urlWhatsApp) + '" class="btn detalle-whatsapp" target="_blank" rel="noopener">Consultar por WhatsApp</a>' +
        '</div>' +
      '</div>';
    if (typeof document.title !== 'undefined') {
      document.title = (p.titulo || 'Propiedad') + ' | Inmobiliaria Pérez Araujo';
    }

    if (imagenes.length > 1) {
      var idx = 0;
      var imgEl = document.getElementById('detalle-galeria-img');
      var dotsEl = document.getElementById('galeria-dots');
      for (var i = 0; i < imagenes.length; i++) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'detalle-galeria__dot' + (i === 0 ? ' detalle-galeria__dot--active' : '');
        dot.setAttribute('aria-label', 'Ir a foto ' + (i + 1));
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
    var lightboxImg = document.getElementById('lightbox-img');
    var lightboxCerrar = document.getElementById('lightbox-cerrar');
    var lightboxPrev = document.getElementById('lightbox-prev');
    var lightboxNext = document.getElementById('lightbox-next');
    if (galleryImg && lightbox && lightboxImg) {
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
      }
      function closeLightbox() {
        lightbox.classList.add('oculto');
        lightbox.setAttribute('aria-hidden', 'true');
      }
      galleryImg.addEventListener('click', openLightbox);
      if (lightboxCerrar) lightboxCerrar.addEventListener('click', closeLightbox);
      lightbox.addEventListener('click', function (e) {
        if (e.target === lightbox) closeLightbox();
      });
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
        });
        lightboxNext.addEventListener('click', function (e) {
          e.stopPropagation();
          lightboxIdx = (lightboxIdx + 1) % imagenes.length;
          lightboxImg.src = imagenes[lightboxIdx];
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

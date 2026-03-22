/**
 * Resuelve enlaces de video (YouTube, Google Drive, Facebook, Instagram, TikTok, MP4/WebM)
 * y pinta iframe, <video> o enlace según corresponda.
 */
(function () {
  'use strict';

  function trimUrl(raw) {
    if (raw == null) return '';
    return String(raw).trim();
  }

  function extractYoutubeId(url) {
    var u = url;
    if (u.indexOf('youtu.be/') !== -1) {
      return u.split('youtu.be/')[1].split('?')[0].split('&')[0];
    }
    var m = u.match(/[?&]v=([^&]+)/);
    if (m) return m[1];
    m = u.match(/youtube\.com\/shorts\/([^/?&#]+)/i);
    if (m) return m[1];
    m = u.match(/youtube\.com\/embed\/([^/?&#]+)/i);
    if (m) return m[1];
    return null;
  }

  function extractDriveFileId(url) {
    var m = url.match(/drive\.google\.com\/file\/d\/([^/]+)/i);
    if (m) return m[1];
    m = url.match(/drive\.google\.com\/open\?[^#]*id=([^&]+)/i);
    if (m) return m[1];
    m = url.match(/drive\.google\.com\/uc\?[^#]*id=([^&]+)/i);
    if (m) return m[1];
    return null;
  }

  function extractInstagramPath(url) {
    var m = url.match(/instagram\.com\/(p|reel|reels|tv)\/([^/?#]+)/i);
    if (!m) return null;
    var kind = m[1].toLowerCase();
    if (kind === 'reels') kind = 'reel';
    return { kind: kind, code: m[2] };
  }

  function extractTikTokVideoId(url) {
    var m = url.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/i);
    if (m) return m[1];
    m = url.match(/tiktok\.com\/v\/(\d+)/i);
    if (m) return m[1];
    return null;
  }

  function isFacebookHost(url) {
    return /facebook\.com|fb\.com/i.test(url);
  }

  function isYoutubeShortsUrl(url) {
    return /youtube\.com\/shorts\//i.test(url);
  }

  /**
   * @returns {{ mode: 'iframe'|'video'|'link', src?: string, href?: string, label?: string, portrait?: boolean }|null}
   */
  function resolve(raw) {
    var url = trimUrl(raw);
    if (!url) return null;
    if (!/^https?:\/\//i.test(url) && !/^\//.test(url)) {
      if (/\.(mp4|webm)(\?.*)?$/i.test(url)) {
        return { mode: 'video', src: url };
      }
      return null;
    }

    if (/\.(mp4|webm)(\?.*)?$/i.test(url.split('?')[0] || url)) {
      return { mode: 'video', src: url };
    }

    var yid = extractYoutubeId(url);
    if (yid) {
      return {
        mode: 'iframe',
        src: 'https://www.youtube.com/embed/' + yid + '?rel=0',
        portrait: isYoutubeShortsUrl(url)
      };
    }

    var did = extractDriveFileId(url);
    if (did) {
      return { mode: 'iframe', src: 'https://drive.google.com/file/d/' + did + '/preview' };
    }

    if (/fb\.watch\//i.test(url) || /vm\.tiktok\.com\//i.test(url) || /tiktok\.com\/t\//i.test(url)) {
      return { mode: 'link', href: url, label: 'TikTok / enlace corto' };
    }

    if (isFacebookHost(url)) {
      return {
        mode: 'iframe',
        src: 'https://www.facebook.com/plugins/video.php?href=' + encodeURIComponent(url) + '&show_text=false&width=1280'
      };
    }

    var ig = extractInstagramPath(url);
    if (ig) {
      return {
        mode: 'iframe',
        src: 'https://www.instagram.com/' + ig.kind + '/' + ig.code + '/embed',
        portrait: ig.kind === 'reel'
      };
    }

    var tid = extractTikTokVideoId(url);
    if (tid) {
      return { mode: 'iframe', src: 'https://www.tiktok.com/embed/v2/' + tid, portrait: true };
    }

    return { mode: 'link', href: url, label: '' };
  }

  function render(container, raw, opts) {
    if (!container) return;
    opts = opts || {};
    var url = trimUrl(raw);
    container.innerHTML = '';
    container.classList.remove('video-embed-aspect', 'video-embed-aspect--portrait', 'video-embed--link-only');

    if (!url) return;

    var r = resolve(url);
    if (!r) return;

    var portrait = r.portrait === true || opts.forcePortrait === true;

    var skipAspect = opts.skipAspectClass === true;
    var title = opts.title || 'Video';
    var allow =
      'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen; web-share';

    if (r.mode === 'iframe') {
      if (!skipAspect) {
        container.classList.add('video-embed-aspect');
        if (portrait) container.classList.add('video-embed-aspect--portrait');
      }
      var iframe = document.createElement('iframe');
      iframe.src = r.src;
      iframe.className = opts.iframeClass || 'video-embed__iframe';
      iframe.setAttribute('title', title);
      iframe.setAttribute('allowfullscreen', '');
      iframe.setAttribute('allow', allow);
      iframe.setAttribute('loading', 'lazy');
      container.appendChild(iframe);
      return;
    }

    if (r.mode === 'video') {
      if (!skipAspect) {
        container.classList.add('video-embed-aspect');
        if (portrait) container.classList.add('video-embed-aspect--portrait');
      }
      var v = document.createElement('video');
      v.className = opts.videoClass || 'video-local__video';
      v.setAttribute('controls', '');
      v.setAttribute('playsinline', '');
      v.setAttribute('preload', 'metadata');
      v.src = r.src;
      container.appendChild(v);
      return;
    }

    if (r.mode === 'link') {
      container.classList.add('video-embed--link-only');
      var a = document.createElement('a');
      a.href = r.href;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.className = 'btn video-embed__external';
      a.textContent = opts.linkText || 'Ver video';
      container.appendChild(a);
    }
  }

  function isLikelyVideoUrl(raw) {
    var url = trimUrl(raw);
    if (!url) return true;
    if (/^https?:\/\//i.test(url) || /^\//.test(url)) return true;
    return /\.(mp4|webm)(\?.*)?$/i.test(url);
  }

  window.VideoEmbed = {
    resolve: resolve,
    render: render,
    isLikelyVideoUrl: isLikelyVideoUrl
  };
})();

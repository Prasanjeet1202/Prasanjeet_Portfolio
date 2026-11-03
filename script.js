(function () {
  'use strict';

  /* =========================================================
     1. PLACEHOLDER IMAGES
     If an image file is missing, a coloured placeholder is
     generated so the layout and hover effects still work.
     ========================================================= */
  function makePlaceholder(label, w, h, hue) {
    var fs = Math.round(Math.min(w, h * 1.4) / 9);
    var sub = Math.round(fs / 3.2);
    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '">' +
      '<defs>' +
      '<linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="hsl(' + hue + ',75%,46%)"/>' +
      '<stop offset=".55" stop-color="hsl(' + ((hue + 30) % 360) + ',60%,18%)"/>' +
      '<stop offset="1" stop-color="#070707"/></linearGradient>' +
      '<radialGradient id="r" cx=".75" cy=".2" r=".6">' +
      '<stop offset="0" stop-color="#fff" stop-opacity=".25"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>' +
      '</defs>' +
      '<rect width="100%" height="100%" fill="url(#g)"/>' +
      '<rect width="100%" height="100%" fill="url(#r)"/>' +
      '<path d="M0 ' + (h * 0.78) + ' L' + w + ' ' + (h * 0.45) + ' L' + w + ' ' + h + ' L0 ' + h + 'Z" fill="#000" opacity=".28"/>' +
      '<rect x="0" y="' + (h - 8) + '" width="' + (w * 0.28) + '" height="8" fill="#FF5A1F"/>' +
      '<text x="50%" y="49%" fill="#fff" font-family="Impact,Arial Black,sans-serif" font-size="' + fs +
      '" text-anchor="middle" dominant-baseline="middle" letter-spacing="5">' + label + '</text>' +
      '<text x="50%" y="' + (h * 0.49 + fs * 0.85) + '" fill="#ffffff" fill-opacity=".7" font-family="Arial,sans-serif" font-size="' + sub +
      '" text-anchor="middle" letter-spacing="4">REPLACE WITH YOUR OWN FILE</text>' +
      '</svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  function applyFallback(img) {
    if (img.dataset.fallback) return;
    img.dataset.fallback = '1';
    img.src = makePlaceholder(
      img.dataset.ph || 'PLACEHOLDER',
      parseInt(img.dataset.w, 10) || 900,
      parseInt(img.dataset.h, 10) || 900,
      parseInt(img.dataset.hue, 10) || 20
    );
  }

  document.querySelectorAll('img[data-ph]').forEach(function (img) {
    img.addEventListener('error', function () { applyFallback(img); });
    if (img.complete && img.naturalWidth === 0) applyFallback(img);
  });


  /* =========================================================
     2. HEADER STATE + SCROLL PROGRESS
     ========================================================= */
  var header = document.getElementById('header');
  var progress = document.getElementById('progress');

  function onScroll() {
    header.classList.toggle('scrolled', window.scrollY > 40);
    var max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();


  /* =========================================================
     3. MOBILE NAVIGATION
     ========================================================= */
  var navToggle = document.getElementById('navToggle');
  var nav = document.getElementById('nav');

  function setNav(open) {
    nav.classList.toggle('open', open);
    navToggle.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';
  }

  navToggle.addEventListener('click', function () {
    setNav(!nav.classList.contains('open'));
  });
  nav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () { setNav(false); });
  });
  window.addEventListener('resize', function () {
    if (window.innerWidth > 960 && nav.classList.contains('open')) setNav(false);
  });


  /* =========================================================
     4. SMOOTH SCROLL FALLBACK (CSS handles modern browsers)
     ========================================================= */
  if (!('scrollBehavior' in document.documentElement.style)) {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var target = document.querySelector(a.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        window.scrollTo(0, target.getBoundingClientRect().top + window.scrollY - 60);
      });
    });
  }


  /* =========================================================
     5. ACTIVE NAV LINK (highlights the section you are in)
     ========================================================= */
  var navLinks = nav.querySelectorAll('a[data-section]');
  var sections = document.querySelectorAll('main > section[id]');

  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) {
          link.classList.toggle('active', link.dataset.section === entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }


  /* =========================================================
     6. SCROLL REVEAL ANIMATION
     ========================================================= */
  var revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(function (el) {
      var siblings = el.parentElement.querySelectorAll(':scope > .reveal');
      var index = Array.prototype.indexOf.call(siblings, el);
      el.style.setProperty('--rd', (index % 3) * 90 + 'ms');
      revealObserver.observe(el);
    });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }


  /* =========================================================
     7. HERO BACKGROUND VIDEO (hidden automatically if missing)
     ========================================================= */
  var heroVideo = document.getElementById('heroVideo');
  var heroSource = heroVideo.querySelector('source');
  function hideHeroVideo() { heroVideo.classList.add('is-missing'); }
  heroSource.addEventListener('error', hideHeroVideo);
  heroVideo.addEventListener('error', hideHeroVideo);


  /* =========================================================
     8. SHARED MODAL HELPERS
     ========================================================= */
  var videoModal = document.getElementById('videoModal');
  var imageModal = document.getElementById('imageModal');
  var playerEl = document.getElementById('player');
  var activeModal = null;
  var lastFocus = null;

  function openModal(modal) {
    lastFocus = document.activeElement;
    activeModal = modal;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    modal.querySelector('.modal-close').focus();
  }

  function closeModal() {
    if (!activeModal) return;
    activeModal.classList.remove('open');
    activeModal.setAttribute('aria-hidden', 'true');
    if (activeModal === videoModal) playerEl.innerHTML = ''; // stops playback
    activeModal = null;
    document.body.style.overflow = nav.classList.contains('open') ? 'hidden' : '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  [videoModal, imageModal].forEach(function (modal) {
    modal.querySelectorAll('[data-close]').forEach(function (el) {
      el.addEventListener('click', closeModal);
    });
  });

  // Keyboard: Escape closes, arrows change image, Tab stays inside the popup
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (activeModal) closeModal();
      else if (nav.classList.contains('open')) setNav(false);
      return;
    }
    if (!activeModal) return;

    if (activeModal === imageModal) {
      if (e.key === 'ArrowLeft') showImage(currentIndex - 1);
      if (e.key === 'ArrowRight') showImage(currentIndex + 1);
    }

    if (e.key === 'Tab') {
      var focusable = activeModal.querySelectorAll('button, video[controls]');
      if (!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  function activateOnKey(el, fn) {
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); }
    });
  }


  /* =========================================================
     9. VIDEO PLAYER POPUP (switches shape for 9:16 videos)
     ========================================================= */
  var videoTitle = document.getElementById('videoModalTitle');

  function openVideo(card) {
    var src = card.dataset.video;
    var thumb = card.querySelector('img');

    // Switch the popup shape for vertical (9:16) videos
    var box = videoModal.querySelector('.modal-box');
    box.classList.toggle('is-vertical', card.classList.contains('vertical'));

    videoTitle.textContent = card.dataset.title || 'Video';
    playerEl.innerHTML = '';

    var video = document.createElement('video');
    video.controls = true;
    video.autoplay = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.poster = thumb ? thumb.src : '';
    video.src = src;

    video.addEventListener('error', function () {
      playerEl.innerHTML =
        '<div class="player-msg"><strong>Video placeholder</strong>' +
        '<p>Add your video file at <code>' + src + '</code></p></div>';
    });

    playerEl.appendChild(video);
    openModal(videoModal);
    var p = video.play();
    if (p && p.catch) p.catch(function () {});
  }

  document.querySelectorAll('.video-card').forEach(function (card) {
    card.addEventListener('click', function () { openVideo(card); });
    activateOnKey(card, function () { openVideo(card); });
  });


  /* =========================================================
     10. IMAGE PREVIEW POPUP (with previous / next)
     ========================================================= */
  var items = Array.prototype.slice.call(document.querySelectorAll('.g-item'));
  var lbImg = document.getElementById('lbImg');
  var lbCount = document.getElementById('lbCount');
  var imageTitle = document.getElementById('imageModalTitle');
  var currentIndex = 0;

  function showImage(index) {
    currentIndex = (index + items.length) % items.length;
    var item = items[currentIndex];
    var img = item.querySelector('img');
    var title = item.dataset.title || 'Preview';

    lbImg.classList.add('swap');
    setTimeout(function () {
      lbImg.src = img.currentSrc || img.src;
      lbImg.alt = title;
      imageTitle.textContent = title;
      lbCount.textContent = String(currentIndex + 1).padStart(2, '0') + ' / ' + String(items.length).padStart(2, '0');
      lbImg.classList.remove('swap');
    }, 120);
  }

  function openImage(index) {
    currentIndex = index;
    var item = items[index];
    var img = item.querySelector('img');
    var title = item.dataset.title || 'Preview';
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = title;
    imageTitle.textContent = title;
    lbCount.textContent = String(index + 1).padStart(2, '0') + ' / ' + String(items.length).padStart(2, '0');
    openModal(imageModal);
  }

  items.forEach(function (item, i) {
    item.addEventListener('click', function () { openImage(i); });
    activateOnKey(item, function () { openImage(i); });
  });

  document.getElementById('lbPrev').addEventListener('click', function () { showImage(currentIndex - 1); });
  document.getElementById('lbNext').addEventListener('click', function () { showImage(currentIndex + 1); });

  // Swipe support on touch devices
  var touchX = null;
  imageModal.addEventListener('touchstart', function (e) { touchX = e.touches[0].clientX; }, { passive: true });
  imageModal.addEventListener('touchend', function (e) {
    if (touchX === null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) showImage(currentIndex + (dx < 0 ? 1 : -1));
    touchX = null;
  }, { passive: true });


  /* =========================================================
     11. FOOTER YEAR
     ========================================================= */
  document.getElementById('year').textContent = new Date().getFullYear();

})();
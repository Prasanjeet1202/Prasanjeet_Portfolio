
(function () {
  'use strict';

  /* =========================================================
     1. PLACEHOLDER IMAGES
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
      '<stop offset="1" stop-color="#070707"/>' +
      '</linearGradient>' +
      '<radialGradient id="r" cx=".75" cy=".2" r=".6">' +
      '<stop offset="0" stop-color="#fff" stop-opacity=".25"/>' +
      '<stop offset="1" stop-color="#fff" stop-opacity="0"/>' +
      '</radialGradient>' +
      '</defs>' +
      '<rect width="100%" height="100%" fill="url(#g)"/>' +
      '<rect width="100%" height="100%" fill="url(#r)"/>' +
      '<path d="M0 ' + (h * 0.78) + ' L' + w + ' ' + (h * 0.45) + ' L' + w + ' ' + h + ' L0 ' + h + 'Z" fill="#000" opacity=".28"/>' +
      '<rect x="0" y="' + (h - 8) + '" width="' + (w * 0.28) + '" height="8" fill="#FF5A1F"/>' +
      '<text x="50%" y="49%" fill="#fff" font-family="Impact,Arial Black,sans-serif" font-size="' + fs + '" text-anchor="middle" dominant-baseline="middle" letter-spacing="5">' + label + '</text>' +
      '<text x="50%" y="' + (h * 0.49 + fs * 0.85) + '" fill="#ffffff" fill-opacity=".7" font-family="Arial,sans-serif" font-size="' + sub + '" text-anchor="middle" letter-spacing="4">REPLACE WITH YOUR OWN FILE</text>' +
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
    img.addEventListener('error', function () {
      applyFallback(img);
    });

    if (img.complete && img.naturalWidth === 0) {
      applyFallback(img);
    }
  });


  /* =========================================================
     2. HEADER + SCROLL PROGRESS
     ========================================================= */

  var header = document.getElementById('header');
  var progress = document.getElementById('progress');

  function onScroll() {
    if (header) {
      header.classList.toggle('scrolled', window.scrollY > 40);
    }

    if (progress) {
      var max = document.documentElement.scrollHeight - window.innerHeight;

      var percentage = max > 0
        ? (window.scrollY / max) * 100
        : 0;

      progress.style.width = percentage + '%';
    }
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
    if (!nav || !navToggle) return;

    nav.classList.toggle('open', open);
    navToggle.classList.toggle('open', open);

    navToggle.setAttribute('aria-expanded', String(open));

    navToggle.setAttribute(
      'aria-label',
      open ? 'Close menu' : 'Open menu'
    );

    document.body.style.overflow = open ? 'hidden' : '';
  }

  if (navToggle && nav) {

    navToggle.addEventListener('click', function () {
      setNav(!nav.classList.contains('open'));
    });

    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        setNav(false);
      });
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 960 && nav.classList.contains('open')) {
        setNav(false);
      }
    });
  }


  /* =========================================================
     4. SMOOTH SCROLL FALLBACK
     ========================================================= */

  if (!('scrollBehavior' in document.documentElement.style)) {

    document.querySelectorAll('a[href^="#"]').forEach(function (a) {

      a.addEventListener('click', function (e) {

        var target = document.querySelector(a.getAttribute('href'));

        if (!target) return;

        e.preventDefault();

        window.scrollTo(
          0,
          target.getBoundingClientRect().top + window.scrollY - 60
        );

      });

    });

  }


  /* =========================================================
     5. ACTIVE NAVIGATION LINK
     ========================================================= */

  if (nav) {

    var navLinks = nav.querySelectorAll('a[data-section]');
    var sections = document.querySelectorAll('main > section[id]');

    if ('IntersectionObserver' in window) {

      var spy = new IntersectionObserver(function (entries) {

        entries.forEach(function (entry) {

          if (!entry.isIntersecting) return;

          navLinks.forEach(function (link) {

            link.classList.toggle(
              'active',
              link.dataset.section === entry.target.id
            );

          });

        });

      }, {
        rootMargin: '-45% 0px -50% 0px'
      });

      sections.forEach(function (section) {
        spy.observe(section);
      });

    }

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

    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    revealEls.forEach(function (el) {

      var siblings = el.parentElement.querySelectorAll(':scope > .reveal');

      var index = Array.prototype.indexOf.call(siblings, el);

      el.style.setProperty('--rd', (index % 3) * 90 + 'ms');

      revealObserver.observe(el);

    });

  } else {

    revealEls.forEach(function (el) {
      el.classList.add('visible');
    });

  }


  /* =========================================================
     7. MODAL ELEMENTS
     ========================================================= */

  var videoModal = document.getElementById('videoModal');
  var imageModal = document.getElementById('imageModal');

  var playerEl = document.getElementById('player');

  var activeModal = null;
  var lastFocus = null;


  /* =========================================================
     8. SHARED MODAL FUNCTIONS
     ========================================================= */

  function openModal(modal) {

    if (!modal) return;

    lastFocus = document.activeElement;

    activeModal = modal;

    modal.classList.add('open');

    modal.setAttribute('aria-hidden', 'false');

    document.body.style.overflow = 'hidden';

    var closeButton = modal.querySelector('.modal-close');

    if (closeButton) {
      closeButton.focus();
    }

  }


  function closeModal() {

    if (!activeModal) return;

    var closingModal = activeModal;

    closingModal.classList.remove('open');

    closingModal.setAttribute('aria-hidden', 'true');

    // Stop video playback completely.
    if (closingModal === videoModal && playerEl) {

      var video = playerEl.querySelector('video');

      if (video) {
        video.pause();
        video.removeAttribute('src');
        video.load();
      }

      playerEl.innerHTML = '';

    }

    // Reset vertical video popup.
    if (closingModal === videoModal) {

      var box = videoModal.querySelector('.modal-box');

      if (box) {
        box.classList.remove('is-vertical');
      }

    }

    activeModal = null;

    document.body.style.overflow =
      nav && nav.classList.contains('open') ? 'hidden' : '';

    if (lastFocus && lastFocus.focus && lastFocus.isConnected) {
      lastFocus.focus();
    }

  }


  // Close buttons and modal backgrounds.
  [videoModal, imageModal].forEach(function (modal) {

    if (!modal) return;

    modal.querySelectorAll('[data-close]').forEach(function (el) {

      el.addEventListener('click', function (e) {

        if (e.target === el || el.hasAttribute('data-close')) {
          closeModal();
        }

      });

    });

  });


  /* =========================================================
     9. KEYBOARD CONTROLS
     ========================================================= */

  document.addEventListener('keydown', function (e) {

    // Escape closes modal or mobile menu.
    if (e.key === 'Escape') {

      if (activeModal) {
        closeModal();
      } else if (nav && nav.classList.contains('open')) {
        setNav(false);
      }

      return;
    }

    if (!activeModal) return;

    // Image lightbox navigation.
    if (activeModal === imageModal) {

      if (e.key === 'ArrowLeft') {
        showImage(currentIndex - 1);
      }

      if (e.key === 'ArrowRight') {
        showImage(currentIndex + 1);
      }

    }

    // Keep keyboard focus inside the open modal.
    if (e.key === 'Tab') {

      var focusable = activeModal.querySelectorAll(
        'button:not([disabled]), video[controls], [tabindex="0"]'
      );

      if (!focusable.length) return;

      var first = focusable[0];
      var last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {

        e.preventDefault();
        last.focus();

      } else if (!e.shiftKey && document.activeElement === last) {

        e.preventDefault();
        first.focus();

      }

    }

  });


  /* =========================================================
     10. KEYBOARD ACTIVATION
     ========================================================= */

  function activateOnKey(el, fn) {

    if (!el) return;

    el.addEventListener('keydown', function (e) {

      if (e.key === 'Enter' || e.key === ' ') {

        e.preventDefault();

        fn();

      }

    });

  }


  /* =========================================================
     11. VIDEO PLAYER POPUP
     Supports landscape and vertical videos.
     ========================================================= */

  var videoTitle = document.getElementById('videoModalTitle');

  function openVideo(card) {

    if (!card || !videoModal || !playerEl) return;

    var src = card.dataset.video;

    if (!src) {
      console.error('Video path missing:', card);
      return;
    }

    var thumb = card.querySelector('img');

    // Adjust popup dimensions for vertical videos.
    var box = videoModal.querySelector('.modal-box');

    if (box) {

      box.classList.toggle(
        'is-vertical',
        card.classList.contains('vertical')
      );

    }

    // Set video title.
    if (videoTitle) {

      videoTitle.textContent =
        card.dataset.title || 'Video';

    }

    // Clear previous player.
    playerEl.innerHTML = '';

    // Create video element.
    var video = document.createElement('video');

    video.controls = true;
    video.autoplay = true;
    video.playsInline = true;
    video.preload = 'auto';

    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');

    video.setAttribute('controlsList', 'nodownload');

    // Set thumbnail as poster.
    if (thumb) {
      video.poster = thumb.currentSrc || thumb.src;
    }

    // Video loading error handler.
    video.addEventListener('error', function () {

      console.error(
        'Video playback error:',
        src,
        video.error
      );

      var errorMessage = document.createElement('div');

      errorMessage.className = 'player-msg';

      var heading = document.createElement('strong');

      heading.textContent = 'Unable to play video';

      var message = document.createElement('p');

      message.textContent =
        'Check that the video file exists, the filename matches exactly, and the MP4 codec is supported.';

      var path = document.createElement('code');

      path.textContent = src;

      errorMessage.appendChild(heading);
      errorMessage.appendChild(message);
      errorMessage.appendChild(path);

      playerEl.innerHTML = '';

      playerEl.appendChild(errorMessage);

    });

    // Loading diagnostics.
    video.addEventListener('loadedmetadata', function () {

      console.log(
        'Video metadata loaded:',
        src,
        video.videoWidth + 'x' + video.videoHeight
      );

    });

    video.addEventListener('canplay', function () {

      console.log('Video ready to play:', src);

    });

    // Add video to popup.
    playerEl.appendChild(video);

    // Set exact existing GitHub video path.
    video.src = src;

    // Open popup.
    openModal(videoModal);

    // Load and play video.
    video.load();

    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {

      playPromise.catch(function (error) {

        console.warn('Autoplay was prevented:', error);

        // User can still start playback using controls.
      });

    }

  }


  // Attach video popup to all video cards.
  document.querySelectorAll('.video-card').forEach(function (card) {

    card.addEventListener('click', function () {
      openVideo(card);
    });

    if (!card.hasAttribute('tabindex')) {
      card.setAttribute('tabindex', '0');
    }

    activateOnKey(card, function () {
      openVideo(card);
    });

  });


  /* =========================================================
     12. IMAGE LIGHTBOX
     Previous / next navigation.
     ========================================================= */

  var items = Array.prototype.slice.call(
    document.querySelectorAll('.g-item')
  );

  var lbImg = document.getElementById('lbImg');

  var lbCount = document.getElementById('lbCount');

  var imageTitle = document.getElementById('imageModalTitle');

  var currentIndex = 0;


  function showImage(index) {

    if (!items.length || !lbImg) return;

    currentIndex = (index + items.length) % items.length;

    var item = items[currentIndex];

    var img = item.querySelector('img');

    if (!img) return;

    var title = item.dataset.title || 'Preview';

    lbImg.classList.add('swap');

    setTimeout(function () {

      lbImg.src = img.currentSrc || img.src;

      lbImg.alt = title;

      if (imageTitle) {
        imageTitle.textContent = title;
      }

      if (lbCount) {

        lbCount.textContent =
          String(currentIndex + 1).padStart(2, '0') +
          ' / ' +
          String(items.length).padStart(2, '0');

      }

      lbImg.classList.remove('swap');

    }, 120);

  }


  function openImage(index) {

    if (!items.length || !imageModal || !lbImg) return;

    currentIndex = index;

    var item = items[index];

    var img = item.querySelector('img');

    if (!img) return;

    var title = item.dataset.title || 'Preview';

    lbImg.src = img.currentSrc || img.src;

    lbImg.alt = title;

    if (imageTitle) {
      imageTitle.textContent = title;
    }

    if (lbCount) {

      lbCount.textContent =
        String(index + 1).padStart(2, '0') +
        ' / ' +
        String(items.length).padStart(2, '0');

    }

    openModal(imageModal);

  }


  // Attach image preview to gallery items.
  items.forEach(function (item, i) {

    item.addEventListener('click', function () {
      openImage(i);
    });

    if (!item.hasAttribute('tabindex')) {
      item.setAttribute('tabindex', '0');
    }

    activateOnKey(item, function () {
      openImage(i);
    });

  });


  // Previous and next buttons.
  var lbPrev = document.getElementById('lbPrev');

  var lbNext = document.getElementById('lbNext');

  if (lbPrev) {

    lbPrev.addEventListener('click', function () {
      showImage(currentIndex - 1);
    });

  }

  if (lbNext) {

    lbNext.addEventListener('click', function () {
      showImage(currentIndex + 1);
    });

  }


  /* =========================================================
     13. TOUCH SWIPE SUPPORT
     ========================================================= */

  if (imageModal) {

    var touchX = null;

    imageModal.addEventListener('touchstart', function (e) {

      if (!e.touches.length) return;

      touchX = e.touches[0].clientX;

    }, { passive: true });


    imageModal.addEventListener('touchend', function (e) {

      if (touchX === null || !e.changedTouches.length) return;

      var dx = e.changedTouches[0].clientX - touchX;

      if (Math.abs(dx) > 50) {

        showImage(
          currentIndex + (dx < 0 ? 1 : -1)
        );

      }

      touchX = null;

    }, { passive: true });

  }


  /* =========================================================
     14. FOOTER YEAR
     ========================================================= */

  var year = document.getElementById('year');

  if (year) {
    year.textContent = new Date().getFullYear();
  }


  /* =========================================================
     15. INITIALIZATION COMPLETE
     ========================================================= */

  console.log('Portfolio JavaScript initialized successfully.');

})();

/* ==========================================================================
   TRANSFORM YOUR KNOWLEDGE — script.js
   Core interactions: FAQ accordion, Vimeo popup modal, sticky mobile CTA
   (GSAP animations live separately in animation.js)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function () {

  /* ---------- FAQ Accordion ---------- */
  var triggers = document.querySelectorAll('.accordion__trigger');

  triggers.forEach(function (trigger) {
    var panel = trigger.nextElementSibling;

    trigger.addEventListener('click', function () {
      var isOpen = trigger.getAttribute('aria-expanded') === 'true';

      // Close all other panels (single-open accordion)
      triggers.forEach(function (otherTrigger) {
        if (otherTrigger !== trigger) {
          otherTrigger.setAttribute('aria-expanded', 'false');
          otherTrigger.nextElementSibling.style.maxHeight = null;
        }
      });

      if (isOpen) {
        trigger.setAttribute('aria-expanded', 'false');
        panel.style.maxHeight = null;
      } else {
        trigger.setAttribute('aria-expanded', 'true');
        panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });
  });

  /* ---------- Vimeo popup modal ---------- */
  var videoTriggers = document.querySelectorAll('.video-trigger');
  var modal = document.getElementById('videoModal');
  var modalVideoWrap = document.getElementById('modalVideoWrap');
  var closeButtons = modal ? modal.querySelectorAll('[data-close]') : [];
  var lastFocusedEl = null;
  var currentPlayer = null;
  var playerScriptPromise = null;

  // Load the Vimeo Player SDK once, only when the modal is first opened —
  // keeps it off the initial page load entirely.
  function loadVimeoPlayerScript() {
    if (window.Vimeo && window.Vimeo.Player) return Promise.resolve();
    if (playerScriptPromise) return playerScriptPromise;

    playerScriptPromise = new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = 'https://player.vimeo.com/api/player.js';
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
    return playerScriptPromise;
  }

  // Accepts the specific button that was clicked, so each trigger can point
  // at its own video via its own data-video-id — no shared ID needed.
  function openModal(triggerEl) {
    var vimeoId = triggerEl.getAttribute('data-video-id') || '76979871';

    lastFocusedEl = document.activeElement;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Reset sizing from any previous open before the new video's real
    // dimensions come back — falls back to a normal 16:9 box until then.
    modalVideoWrap.classList.remove('modal__video--portrait');
    modalVideoWrap.style.removeProperty('aspect-ratio');
    modalVideoWrap.innerHTML = '';

    loadVimeoPlayerScript().then(function () {
      currentPlayer = new Vimeo.Player(modalVideoWrap, {
        id: vimeoId,
        autoplay: true,
        byline: false,
        title: false,
        portrait: false
      });

      // Once we know the video's real width/height, size the box to match
      // instead of forcing every video into a fixed landscape frame.
      currentPlayer.ready().then(function () {
        return Promise.all([currentPlayer.getVideoWidth(), currentPlayer.getVideoHeight()]);
      }).then(function (dims) {
        var w = dims[0], h = dims[1];
        if (!w || !h) return;
        modalVideoWrap.style.aspectRatio = w + ' / ' + h;
        if (h > w) {
          modalVideoWrap.classList.add('modal__video--portrait');
        }
      }).catch(function () { /* keep the 16:9 fallback */ });
    }).catch(function () {
      // SDK failed to load (offline, blocked, etc.) — fall back to a plain iframe
      modalVideoWrap.innerHTML =
        '<iframe src="https://player.vimeo.com/video/' + vimeoId + '?autoplay=1&title=0&byline=0&portrait=0" ' +
        'allow="autoplay; fullscreen; picture-in-picture" allowfullscreen loading="lazy" ' +
        'title="GText Suites Dubai — Participant Testimonials"></iframe>';
    });

    var closeBtn = modal.querySelector('.modal__close');
    if (closeBtn) closeBtn.focus();
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    if (currentPlayer && currentPlayer.destroy) {
      currentPlayer.destroy().catch(function () {});
      currentPlayer = null;
    }
    modalVideoWrap.innerHTML = ''; // stop playback
    modalVideoWrap.classList.remove('modal__video--portrait');
    modalVideoWrap.style.removeProperty('aspect-ratio');

    if (lastFocusedEl) lastFocusedEl.focus();
  }

  videoTriggers.forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      openModal(trigger);
    });
  });
  closeButtons.forEach(function (btn) {
    btn.addEventListener('click', closeModal);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal && modal.classList.contains('is-open')) {
      closeModal();
    }
  });

  /* ---------- Scroll to top ---------- */
  var scrollTopBtn = document.getElementById('scrollTop');

  if (scrollTopBtn) {
    var toggleScrollTop = function () {
      if (window.scrollY > window.innerHeight * 0.8) {
        scrollTopBtn.classList.add('is-visible');
      } else {
        scrollTopBtn.classList.remove('is-visible');
      }
    };

    toggleScrollTop();
    window.addEventListener('scroll', toggleScrollTop, { passive: true });

    scrollTopBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

});
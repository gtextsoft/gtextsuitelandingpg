/* ==========================================================================
   TRANSFORM YOUR KNOWLEDGE — animation.js
   All GSAP animation lives here. Intensity: subtle (fades/slides on scroll).
   Loaded deferred after gsap.min.js + ScrollTrigger.min.js.
   ========================================================================== */

(function () {
  if (typeof gsap === 'undefined') return; // fail quiet if CDN blocked

  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ limitCallbacks: true });

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return; // respect user preference — content is visible by default via CSS

  /* ---------- Hero entrance (page load, not scroll-triggered) ---------- */
  var heroTl = gsap.timeline({ defaults: { ease: 'power2.out' } });

  heroTl
    .from('.hero .eyebrow', { opacity: 0, y: 14, duration: 0.6 })
    .from('.hero__title', { opacity: 0, y: 22, duration: 0.8 }, '-=0.35')
    .from('.hero__sub', { opacity: 0, y: 16, duration: 0.6 }, '-=0.4')
    .from('.hero__meta li', { opacity: 0, y: 10, duration: 0.5, stagger: 0.08 }, '-=0.3')
    .from('.hero .btn', { opacity: 0, y: 10, duration: 0.5 }, '-=0.25')
    .from('.hero__urgency', { opacity: 0, duration: 0.5 }, '-=0.2')
    .from('.gsap-ticket', { opacity: 0, x: 30, duration: 0.9, ease: 'power3.out' }, '-=0.9');

  /* ---------- Generic scroll reveal for standalone elements ---------- */
  var revealEls = gsap.utils.toArray('.gsap-reveal');

  revealEls.forEach(function (el) {
    // skip elements already handled by the hero timeline to avoid double-animating
    if (el.closest('.hero')) return;

    gsap.from(el, {
      opacity: 0,
      y: 24,
      duration: 0.7,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none none',
        lazy: true
      }
    });
  });

  /* ---------- Batched list reveals (checklist items, modules) ---------- */
  var listGroups = gsap.utils.toArray('.gsap-list');

  listGroups.forEach(function (list) {
    var items = list.querySelectorAll('li');
    if (!items.length) return;

    ScrollTrigger.batch(items, {
      start: 'top 88%',
      onEnter: function (batch) {
        gsap.to(batch, {
          opacity: 1,
          y: 0,
          duration: 0.55,
          stagger: 0.1,
          ease: 'power2.out'
        });
      },
      once: true
    });

    gsap.set(items, { opacity: 0, y: 16 });
  });

  /* ---------- Modules: numbered list, subtle stagger per item ---------- */
  var modules = gsap.utils.toArray('.module');

  ScrollTrigger.batch(modules, {
    start: 'top 88%',
    onEnter: function (batch) {
      gsap.to(batch, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.12,
        ease: 'power2.out'
      });
    },
    once: true
  });
  gsap.set(modules, { opacity: 0, y: 20 });

  /* ---------- Facilitator cards: photo + content in from opposite sides ---------- */
  gsap.utils.toArray('.facilitator').forEach(function (card) {
    var photo = card.querySelector('.facilitator__photo');
    var content = card.querySelector('.facilitator__content');
    var reversed = card.classList.contains('facilitator--reverse');

    gsap.from(photo, {
      opacity: 0,
      x: reversed ? 24 : -24,
      duration: 0.7,
      ease: 'power2.out',
      scrollTrigger: { trigger: card, start: 'top 82%', toggleActions: 'play none none none', lazy: true }
    });
    gsap.from(content, {
      opacity: 0,
      y: 18,
      duration: 0.7,
      ease: 'power2.out',
      scrollTrigger: { trigger: card, start: 'top 82%', toggleActions: 'play none none none', lazy: true }
    });
  });

  /* Note: .ticket--full is already covered by the generic .gsap-reveal
     loop above (it carries that class in the HTML) — no separate
     animation needed here. A duplicate tween on the same element was
     removed to avoid two ScrollTriggers fighting over the same props. */

  /* ---------- Urgency banner: quiet pulse on the gold strip ---------- */
  gsap.to('.urgency-banner', {
    backgroundColor: '#D8AE63',
    duration: 1.6,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut'
  });

  /* ---------- Recalculate trigger positions once layout has settled ----------
     Fonts (Fraunces / IBM Plex Mono) are deferred and swap in after first
     paint, which reflows heading sizes and shifts every ScrollTrigger start
     point below the fold. Refresh once the swap completes so later sections
     (e.g. Registration Details, near the bottom) don't end up with stale
     trigger positions that never fire. Image loads get the same treatment
     as a safety net. */
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      ScrollTrigger.refresh();
    });
  }
  window.addEventListener('load', function () {
    ScrollTrigger.refresh();
  });

  /* ---------- Hard safety net ----------
     Belt-and-suspenders: if anything above ever leaves a section stuck at
     opacity 0 (a mistimed refresh, a slow connection, a future edit that
     breaks a trigger), force everything visible after 4s so real users on
     a live sales page never hit permanently missing content. */
  window.setTimeout(function () {
    gsap.set('.gsap-reveal, .gsap-title, .gsap-ticket, .module, .gsap-list li', {
      clearProps: 'opacity,transform'
    });
  }, 4000);

})();
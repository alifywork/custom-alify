/* sliders.js — page-specific module, loaded only where its hooks exist. */
(function () {
  'use strict';


  function initServiceSlider() {
    var slider = document.querySelector('[data-service-slider]');
    if (!slider) return;
    var track = slider.querySelector('[data-service-track]');
    var cards = track ? track.querySelectorAll('.service-slide') : [];
    if (!track || !cards.length) return;
    function move(direction) {
      var first = cards[0];
      var styles = window.getComputedStyle(track);
      var gap = parseFloat(styles.columnGap || styles.gap) || 0;
      var maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
      if (direction > 0 && track.scrollLeft >= maxScroll - 2) {
        track.scrollTo({ left: 0, behavior: 'smooth' });
        return;
      }
      if (direction < 0 && track.scrollLeft <= 2) {
        track.scrollTo({ left: maxScroll, behavior: 'smooth' });
        return;
      }
      track.scrollBy({ left: direction * (first.getBoundingClientRect().width + gap), behavior: 'smooth' });
    }
    var prev = slider.querySelector('[data-service-prev]');
    var next = slider.querySelector('[data-service-next]');
    if (prev) prev.addEventListener('click', function () { move(-1); });
    if (next) next.addEventListener('click', function () { move(1); });
    if (window.AlifyAutoAdvance) {
      window.AlifyAutoAdvance(slider, function () { move(1); });
    }
  }

  /* ---------- Featured projects: sticky stack and GSAP image-scroll hover ---------- */


  function initFeaturedProjectEffects() {
    var cards = document.querySelectorAll('[data-featured-project]');
    if (!cards.length) return;
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    cards.forEach(function (card) {
      var viewport = card.querySelector('[data-project-image]');
      var image = viewport && viewport.querySelector('[data-project-art]');
      if (!viewport || !image || typeof gsap === 'undefined' || reduceMotion) return;
      function scrollImage() {
        var travel = Math.min(0, viewport.clientHeight - image.getBoundingClientRect().height);
        gsap.to(image, { y: travel, duration: 1.8, ease: 'none', overwrite: 'auto' });
      }
      function resetImage() {
        gsap.to(image, { y: 0, duration: 0.55, ease: 'power2.out', overwrite: 'auto' });
      }
      viewport.addEventListener('mouseenter', scrollImage);
      viewport.addEventListener('mouseleave', resetImage);
      viewport.addEventListener('focusin', scrollImage);
      viewport.addEventListener('focusout', resetImage);
      if (image.complete) gsap.set(image, { y: 0 });
      else image.addEventListener('load', function () { gsap.set(image, { y: 0 }); }, { once: true });
    });
  }

  /* ---------- Case study highlight carousel ---------- */


  function initCaseHighlightSlider() {
    var root = document.querySelector('[data-case-highlight]');
    if (!root) return;
    var items = [
      {
        slug: 'northstar', client: 'Northstar', category: 'Technology & Apps',
        image: 'assets/images/projects/Technology%20%26%20Apps/featured-northstar.svg',
        alt: 'Illustrative Northstar digital platform concept',
        title: 'Northstar: making complexity feel clear.',
        lead: 'A sample project story about helping a growing team bring its digital product and brand experience into focus.',
        challenge: 'A fragmented product story made it harder for customers to understand what to do next.',
        approach: 'Align the product narrative, simplify key journeys and create a flexible interface system.',
        outcome: 'A clearer digital direction and a stronger foundation for future product growth.'
      },
      {
        slug: 'fieldnotes', client: 'Fieldnotes', category: 'Shopping & eCommerce',
        image: 'assets/images/projects/Shopping%20%26%20eCommerce/featured-fieldnotes.svg',
        alt: 'Illustrative Fieldnotes e-commerce concept',
        title: 'Fieldnotes: a simpler way to shop.',
        lead: 'An illustrative commerce story about making product discovery feel clear, considered and easy to navigate.',
        challenge: 'A growing catalogue and competing priorities made the shopping journey feel harder than it needed to be.',
        approach: 'Bring product categories, editorial storytelling and store interactions into one coherent experience.',
        outcome: 'A clearer storefront direction designed to support confident browsing and checkout.'
      },
      {
        slug: 'wellspace', client: 'Wellspace', category: 'Health & Medical',
        image: 'assets/images/projects/Health%20%26%20Medical/featured-wellspace.svg',
        alt: 'Illustrative Wellspace health and wellbeing concept',
        title: 'Wellspace: making support easier to find.',
        lead: 'An illustrative wellbeing story focused on a calmer, more accessible way to discover support.',
        challenge: 'Important guidance and next steps were difficult to find across a busy digital experience.',
        approach: 'Organize key information into a reassuring visual system with simple, accessible pathways.',
        outcome: 'A calmer experience concept that puts clarity and people first.'
      }
    ];
    var layers = Array.prototype.slice.call(root.querySelectorAll('[data-case-image-layer]'));
    var content = root.querySelector('[data-case-content]');
    var counter = root.querySelector('[data-case-counter]');
    if (layers.length < 2 || !content) return;
    var activeLayer = layers[0];
    var current = 0;
    var request = 0;
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var loaded = items.map(function (item) {
      return new Promise(function (resolve) {
        var probe = new Image();
        probe.onload = resolve;
        probe.onerror = resolve;
        probe.src = item.image;
        if (probe.complete) resolve();
      });
    });

    function updateText(item, index) {
      root.querySelector('[data-case-client]').textContent = item.client;
      root.querySelector('[data-case-count]').textContent = 'Case study / ' + String(index + 1).padStart(2, '0');
      root.querySelector('[data-case-category]').textContent = item.category;
      root.querySelector('[data-case-title]').textContent = item.title;
      root.querySelector('[data-case-lead]').textContent = item.lead;
      root.querySelector('[data-case-point-copy="challenge"]').textContent = item.challenge;
      root.querySelector('[data-case-point-copy="approach"]').textContent = item.approach;
      root.querySelector('[data-case-point-copy="outcome"]').textContent = item.outcome;
      root.querySelector('[data-case-link]').href = 'single-case-study.html?case=' + item.slug;
      if (counter) counter.innerHTML = String(index + 1).padStart(2, '0') + ' <span>/ ' + String(items.length).padStart(2, '0') + '</span>';
    }

    function render(index) {
      current = (index + items.length) % items.length;
      var item = items[current];
      var thisRequest = ++request;
      if (counter) counter.innerHTML = String(current + 1).padStart(2, '0') + ' <span>/ ' + String(items.length).padStart(2, '0') + '</span>';
      loaded[current].then(function () {
        if (thisRequest !== request) return;
        var incoming = activeLayer === layers[0] ? layers[1] : layers[0];
        var outgoing = activeLayer;
        incoming.src = item.image;
        incoming.alt = item.alt;
        incoming.removeAttribute('aria-hidden');
        updateText(item, current);

        if (typeof gsap !== 'undefined' && !reduceMotion) {
          gsap.killTweensOf([incoming, outgoing, content]);
          gsap.set(incoming, { x: -44, autoAlpha: 0, zIndex: 2 });
          gsap.set(outgoing, { x: 0, autoAlpha: 1, zIndex: 1 });
          gsap.set(content, { x: 46, autoAlpha: 0 });
          var timeline = gsap.timeline({ defaults: { overwrite: 'auto' } });
          timeline.to(outgoing, { x: 34, autoAlpha: 0, duration: .46, ease: 'power2.in' }, 0)
            .to(incoming, { x: 0, autoAlpha: 1, duration: .58, ease: 'power3.out' }, 0)
            .to(content, { x: 0, autoAlpha: 1, duration: .52, ease: 'power3.out' }, .08)
            .call(function () {
              outgoing.classList.remove('is-active');
              outgoing.setAttribute('aria-hidden', 'true');
              incoming.classList.add('is-active');
              activeLayer = incoming;
              gsap.set(outgoing, { x: 0, zIndex: 0 });
            });
        } else {
          outgoing.classList.remove('is-active');
          outgoing.setAttribute('aria-hidden', 'true');
          incoming.classList.add('is-active');
          activeLayer = incoming;
        }
      });
    }
    var prev = root.querySelector('[data-case-prev]');
    var next = root.querySelector('[data-case-next]');
    if (prev) prev.addEventListener('click', function () { render(current - 1); });
    if (next) next.addEventListener('click', function () { render(current + 1); });
    if (window.AlifyAutoAdvance) {
      window.AlifyAutoAdvance(root, function () { render(current + 1); });
    }
  }

  /* ---------- Homepage testimonials: centre-active Google review slider ---------- */


  function initTestimonials() {
    var track = document.querySelector('[data-testimonial-track]');
    if (!track) return;
    var cards = Array.prototype.slice.call(track.children);
    if (!cards.length) return;
    var prev = document.querySelector('[data-testimonial-prev]');
    var next = document.querySelector('[data-testimonial-next]');
    var status = document.querySelector('[data-testimonial-status]');
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var active = 0;
    var frame = null;

    function centreFor(card) {
      return card.offsetLeft + card.offsetWidth / 2 - track.clientWidth / 2;
    }
    function nearestIndex() {
      var middle = track.scrollLeft + track.clientWidth / 2;
      var best = 0;
      var bestDistance = Infinity;
      cards.forEach(function (card, index) {
        var distance = Math.abs(card.offsetLeft + card.offsetWidth / 2 - middle);
        if (distance < bestDistance) { bestDistance = distance; best = index; }
      });
      return best;
    }
    function sync() {
      frame = null;
      active = nearestIndex();
      cards.forEach(function (card, index) {
        var isActive = index === active;
        card.classList.toggle('is-active', isActive);
        if (isActive) card.setAttribute('aria-current', 'true');
        else card.removeAttribute('aria-current');
      });
      if (prev) prev.disabled = active === 0;
      if (next) next.disabled = active === cards.length - 1;
      if (status) status.textContent = 'Review ' + (active + 1) + ' of ' + cards.length;
    }
    function schedule() {
      if (!frame) frame = requestAnimationFrame(sync);
    }
    function goTo(index) {
      var target = Math.max(0, Math.min(cards.length - 1, index));
      active = target;
      track.scrollTo({ left: centreFor(cards[target]), behavior: reduceMotion ? 'auto' : 'smooth' });
      schedule();
    }

    track.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    if (prev) prev.addEventListener('click', function () { goTo(nearestIndex() - 1); });
    if (next) next.addEventListener('click', function () { goTo(nearestIndex() + 1); });
    track.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowRight') { event.preventDefault(); goTo(nearestIndex() + 1); }
      if (event.key === 'ArrowLeft') { event.preventDefault(); goTo(nearestIndex() - 1); }
    });
    sync();
    if (window.AlifyAutoAdvance) {
      window.AlifyAutoAdvance(track, function () { goTo((nearestIndex() + 1) % cards.length); });
    }
    // Start on the first review even if the browser restores a scroll position.
    requestAnimationFrame(function () {
      if (track.scrollLeft > 0) track.scrollLeft = centreFor(cards[0]);
      schedule();
    });
  }

  /* ---------- Service detail personalization from carousel links ---------- */

  document.addEventListener('DOMContentLoaded', function () {
    initServiceSlider();
    initFeaturedProjectEffects();
    initCaseHighlightSlider();
    initTestimonials();
  });
})();

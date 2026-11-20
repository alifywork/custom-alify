/* smooth-scroll.js — GSAP-driven page scrolling, loaded on every page.
   Two jobs, kept out of main.js:
   1. anchor links glide to their section (ScrollToPlugin, 80px header offset);
   2. wheel scrolling is eased instead of jumping, with one tween reused and
      killed as soon as the reader keeps scrolling. Touch devices, reduced
      motion and inner scroll areas (drawer, modals, code blocks) keep their
      native behaviour. */
(function () {
  'use strict';

  function hasGsap() {
    return typeof gsap !== 'undefined' && typeof ScrollToPlugin !== 'undefined';
  }

  function prefersReduced() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  /* ---------- Anchor links ---------- */
  function initAnchorScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (event) {
        var id = link.getAttribute('href');
        if (!id || id === '#') return;
        var target = document.querySelector(id);
        if (!target) return;
        event.preventDefault();

        if (hasGsap()) {
          gsap.to(window, { duration: 0.8, scrollTo: { y: target, offsetY: 80 }, ease: 'power3.out' });
        } else {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        var openNav = document.querySelector('.navbar-collapse.show');
        if (openNav && typeof bootstrap !== 'undefined') {
          var instance = bootstrap.Collapse.getInstance(openNav);
          if (instance) instance.hide();
        }
      });
    });
  }

  /* ---------- Eased wheel scrolling ---------- */
  function initWheelScroll() {
    if (!hasGsap() || prefersReduced()) return;
    if (window.matchMedia && window.matchMedia('(hover: none), (pointer: coarse)').matches) return;

    // CSS smooth scrolling would fight every tween frame; GSAP owns scrolling now.
    document.documentElement.classList.add('gsap-scroll');

    var root = document.documentElement;
    var tween = null;
    var target = window.pageYOffset || root.scrollTop;

    function maxScroll() {
      return Math.max(0, root.scrollHeight - window.innerHeight);
    }

    // Anything that scrolls on its own (drawer, modal, table) keeps the wheel.
    function scrollableAncestor(node) {
      while (node && node !== document.body && node !== root) {
        var overflow = window.getComputedStyle(node).overflowY;
        if ((overflow === 'auto' || overflow === 'scroll' || overflow === 'overlay') &&
            node.scrollHeight - node.clientHeight > 4) {
          return node;
        }
        node = node.parentNode;
      }
      return null;
    }

    window.addEventListener('wheel', function (event) {
      if (event.ctrlKey || event.defaultPrevented) return;
      var delta = event.deltaY;
      if (event.deltaMode === 1) delta *= 16;
      else if (event.deltaMode === 2) delta *= window.innerHeight;
      if (!delta) return;
      if (scrollableAncestor(event.target)) return;

      event.preventDefault();
      target = Math.max(0, Math.min(maxScroll(), target + delta));
      if (tween) tween.kill();
      tween = gsap.to(window, {
        duration: 0.65,
        ease: 'power2.out',
        scrollTo: { y: target, autoKill: false },
        overwrite: true,
        onComplete: function () { tween = null; }
      });
    }, { passive: false });

    // Keyboard, scrollbar and anchor jumps move the page outside the tween —
    // pick that position up so the next wheel step starts from it.
    window.addEventListener('scroll', function () {
      if (!tween) target = window.pageYOffset || root.scrollTop;
    }, { passive: true });

    window.addEventListener('resize', function () {
      target = Math.min(target, maxScroll());
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initAnchorScroll();
    initWheelScroll();
  });
})();

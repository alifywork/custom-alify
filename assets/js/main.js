/* ============================================================
   main.js — Main JavaScript
   Dependencies: Bootstrap 5.3, GSAP 3.15 (+ ScrollTrigger)
   Load order: gsap.min.js → ScrollTrigger.min.js → bootstrap.bundle.min.js → main.js
   ============================================================ */

(function () {
  'use strict';

  /* ---------- Register GSAP Plugins ---------- */
  if (typeof gsap !== 'undefined') {
    if (typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }
    if (typeof ScrollToPlugin !== 'undefined') {
      gsap.registerPlugin(ScrollToPlugin);
    }
    if (typeof Draggable !== 'undefined') {
      gsap.registerPlugin(Draggable);
    }
    if (typeof Flip !== 'undefined') {
      gsap.registerPlugin(Flip);
    }
    if (typeof Observer !== 'undefined') {
      gsap.registerPlugin(Observer);
    }
  }

  /* ---------- DOM Ready ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    initHeader();
    initDrawers();
    initSmoothScroll();
    initBackToTop();
    initActiveNav();
    initRevealAnimations();
    initCounters();
    initForms();
    initTooltips();
    initYear();
  });

  /* ---------- Compact Sticky Header ---------- */
  function initHeader() {
    var header = document.querySelector('.site-header');
    if (!header) return;

    function updateHeader() {
      header.classList.toggle('is-scrolled', window.scrollY > 12);
    }
    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
  }

  /* ---------- Right-side About and Navigation Drawers ---------- */
  function initDrawers() {
    var backdrop = document.querySelector('.drawer-backdrop');
    var triggers = document.querySelectorAll('[aria-controls="aboutDrawer"], [aria-controls="menuDrawer"]');
    var drawers = document.querySelectorAll('.site-drawer');
    if (!backdrop || !drawers.length) return;

    var activeDrawer = null;
    var hideTimer = null;

    function closeDrawer() {
      if (!activeDrawer) return;
      activeDrawer.classList.remove('is-open');
      activeDrawer.setAttribute('aria-hidden', 'true');
      activeDrawer.inert = true;
      document.querySelectorAll('[aria-controls="' + activeDrawer.id + '"]').forEach(function (trigger) {
        trigger.setAttribute('aria-expanded', 'false');
      });
      activeDrawer = null;
      document.body.classList.remove('drawer-open');
      backdrop.classList.remove('is-visible');
      window.clearTimeout(hideTimer);
      hideTimer = window.setTimeout(function () { backdrop.hidden = true; }, 370);
    }

    function openDrawer(drawer, trigger) {
      if (activeDrawer && activeDrawer !== drawer) closeDrawer();
      window.clearTimeout(hideTimer);
      backdrop.hidden = false;
      requestAnimationFrame(function () { backdrop.classList.add('is-visible'); });
      drawer.inert = false;
      drawer.setAttribute('aria-hidden', 'false');
      requestAnimationFrame(function () { drawer.classList.add('is-open'); });
      activeDrawer = drawer;
      document.body.classList.add('drawer-open');
      trigger.setAttribute('aria-expanded', 'true');
      var closeButton = drawer.querySelector('.site-drawer__close');
      if (closeButton) window.setTimeout(function () { closeButton.focus(); }, 80);
    }

    triggers.forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        var drawer = document.getElementById(trigger.getAttribute('aria-controls'));
        if (!drawer) return;
        if (activeDrawer === drawer) closeDrawer();
        else openDrawer(drawer, trigger);
      });
    });

    drawers.forEach(function (drawer) {
      var closeButton = drawer.querySelector('.site-drawer__close');
      if (closeButton) closeButton.addEventListener('click', closeDrawer);
      drawer.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', closeDrawer);
      });
    });

    backdrop.addEventListener('click', closeDrawer);
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeDrawer();
    });
  }

  /* ---------- Smooth Scroll (GSAP ScrollTo or native) ---------- */
  function initSmoothScroll() {
    var anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(function (link) {
      link.addEventListener('click', function (e) {
        var targetId = link.getAttribute('href');
        if (targetId === '#') return;
        var target = document.querySelector(targetId);
        if (!target) return;

        e.preventDefault();

        if (typeof gsap !== 'undefined' && typeof ScrollToPlugin !== 'undefined') {
          gsap.to(window, {
            duration: 0.8,
            scrollTo: { y: target, offsetY: 80 },
            ease: 'power3.out'
          });
        } else {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        // Close mobile navbar if open
        var navbarCollapse = document.querySelector('.navbar-collapse.show');
        if (navbarCollapse && typeof bootstrap !== 'undefined') {
          var bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
          if (bsCollapse) bsCollapse.hide();
        }
      });
    });
  }

  /* ---------- Back to Top Button ---------- */
  function initBackToTop() {
    var btn = document.getElementById('backToTop');
    if (!btn) return;

    window.addEventListener('scroll', function () {
      if (window.scrollY > 400) {
        btn.classList.remove('d-none');
        btn.classList.add('d-flex');
      } else {
        btn.classList.add('d-none');
        btn.classList.remove('d-flex');
      }
    }, { passive: true });

    btn.addEventListener('click', function () {
      if (typeof gsap !== 'undefined' && typeof ScrollToPlugin !== 'undefined') {
        gsap.to(window, { duration: 0.8, scrollTo: 0, ease: 'power3.out' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  /* ---------- Active Nav Link on Scroll ---------- */
  function initActiveNav() {
    var sections = document.querySelectorAll('section[id]');
    var navLinks = document.querySelectorAll('.site-header .nav-link');
    if (!sections.length || !navLinks.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          navLinks.forEach(function (link) {
            link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
          });
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  /* ---------- GSAP Reveal Animations ---------- */
  function initRevealAnimations() {
    if (typeof gsap === 'undefined') return;

    // Fade-up elements
    var fadeUpElements = document.querySelectorAll('.fade-up');
    if (fadeUpElements.length) {
      if (typeof ScrollTrigger !== 'undefined') {
        fadeUpElements.forEach(function (el) {
          gsap.to(el, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              toggleActions: 'play none none none'
            }
          });
        });
      } else {
        gsap.to(fadeUpElements, { opacity: 1, y: 0, duration: 0.8, stagger: 0.1 });
      }
    }

    // Fade-in elements
    var fadeInElements = document.querySelectorAll('.fade-in');
    if (fadeInElements.length) {
      if (typeof ScrollTrigger !== 'undefined') {
        fadeInElements.forEach(function (el) {
          gsap.to(el, {
            opacity: 1,
            duration: 1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              toggleActions: 'play none none none'
            }
          });
        });
      } else {
        gsap.to(fadeInElements, { opacity: 1, duration: 1 });
      }
    }

    // Scale-in elements
    var scaleInElements = document.querySelectorAll('.scale-in');
    if (scaleInElements.length) {
      if (typeof ScrollTrigger !== 'undefined') {
        scaleInElements.forEach(function (el) {
          gsap.to(el, {
            opacity: 1,
            scale: 1,
            duration: 0.7,
            ease: 'back.out(1.7)',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              toggleActions: 'play none none none'
            }
          });
        });
      } else {
        gsap.to(scaleInElements, { opacity: 1, scale: 1, duration: 0.7 });
      }
    }

    // Hero entrance animation
    var heroTitle = document.querySelector('.hero-section h1');
    if (heroTitle) {
      gsap.from(heroTitle, {
        opacity: 0,
        y: 40,
        duration: 1,
        ease: 'power3.out',
        delay: 0.2
      });
    }
    var heroLead = document.querySelector('.hero-section .lead');
    if (heroLead) {
      gsap.from(heroLead, {
        opacity: 0,
        y: 30,
        duration: 1,
        ease: 'power3.out',
        delay: 0.4
      });
    }
  }

  /* ---------- Animated Counters ---------- */
  function initCounters() {
    var counters = document.querySelectorAll('[data-counter]');
    if (!counters.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseFloat(el.getAttribute('data-counter'));
        var suffix = el.getAttribute('data-suffix') || '';
        var duration = parseFloat(el.getAttribute('data-duration')) || 2000;
        var startTime = null;

        function animate(currentTime) {
          if (!startTime) startTime = currentTime;
          var progress = Math.min((currentTime - startTime) / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
          var current = Math.floor(eased * target);
          el.textContent = current.toLocaleString() + suffix;
          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            el.textContent = target.toLocaleString() + suffix;
          }
        }

        requestAnimationFrame(animate);
        observer.unobserve(el);
      });
    }, { threshold: 0.5 });

    counters.forEach(function (counter) {
      observer.observe(counter);
    });
  }

  /* ---------- Form Validation (Bootstrap) ---------- */
  function initForms() {
    var forms = document.querySelectorAll('.needs-validation');
    if (!forms.length) return;

    forms.forEach(function (form) {
      form.addEventListener('submit', function (event) {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }
        form.classList.add('was-validated');
      }, false);
    });
  }

  /* ---------- Bootstrap Tooltips & Popovers ---------- */
  function initTooltips() {
    if (typeof bootstrap === 'undefined') return;

    var tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltipTriggerList.forEach(function (el) {
      new bootstrap.Tooltip(el);
    });

    var popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
    popoverTriggerList.forEach(function (el) {
      new bootstrap.Popover(el);
    });
  }

  /* ---------- Dynamic Year ---------- */
  function initYear() {
    var yearEl = document.getElementById('currentYear');
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }
  }

  /* ---------- Public API (optional) ---------- */
  window.App = {
    gsap: typeof gsap !== 'undefined' ? gsap : null,
    bootstrap: typeof bootstrap !== 'undefined' ? bootstrap : null,
    version: '1.0.0'
  };

})();

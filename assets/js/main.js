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
    initBackgroundVideos();
    initLazyVideos();
    initHeader();
    initCurrentPage();
    initDrawers();
    initNavMenus();
    initPricingTabs();
    initNotFoundSearch();
    initIndustrySwitcher();
    initFilterSelects();
    initSmoothScroll();
    initBackToTop();
    initScrollToBottom();
    initActiveNav();
    initRevealAnimations();
    initSectionReveals();
    initQuoteSliders();
    initCounters();
    initForms();
    initAjaxForms();
    initTooltips();
    initYear();
  });

  /* ---------- Local Hero Background Videos ---------- */
  function initBackgroundVideos() {
    var videoSections = [
      { selector: '.home-hero', source: 'assets/images/background-videos/home-hero.mp4', poster: 'assets/images/background-videos/home-hero-poster.jpg', type: 'video/mp4' },
      { selector: '.inner-hero', source: 'assets/images/background-videos/inner-hero.mp4', poster: 'assets/images/background-videos/inner-hero-poster.jpg', type: 'video/mp4' }
    ];

    videoSections.forEach(function (item) {
      document.querySelectorAll(item.selector).forEach(function (section) {
        if (section.querySelector(':scope > .background-video')) return;

        section.classList.add('has-video-background');
        var video = document.createElement('video');
        video.className = 'background-video';
        video.autoplay = true;
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.preload = 'none';
        if (item.poster) video.setAttribute('poster', item.poster);
        video.setAttribute('aria-hidden', 'true');
        video.setAttribute('tabindex', '-1');
        video.setAttribute('disablepictureinpicture', '');

        var source = document.createElement('source');
        source.src = item.source;
        source.type = item.type;
        video.appendChild(source);
        section.prepend(video);
      });
    });
  }

  /* ---------- Lazy background videos (45 MB of MP4s, never fetched up front) ---------- */
  function initLazyVideos() {
    var videos = Array.prototype.slice.call(document.querySelectorAll('video.background-video'));
    if (!videos.length) return;

    function start(video) {
      var pending = video.querySelectorAll('source[data-src]');
      if (!pending.length) return;
      Array.prototype.forEach.call(pending, function (source) {
        source.setAttribute('src', source.getAttribute('data-src'));
        source.removeAttribute('data-src');
      });
      video.load();
      var playing = video.play();
      if (playing && playing.catch) playing.catch(function () { /* autoplay blocked: poster frame stays */ });
    }

    videos.forEach(function (video) {
      video.removeAttribute('autoplay');
      video.setAttribute('preload', 'none');
      video.muted = true;
      Array.prototype.forEach.call(video.querySelectorAll('source[src]'), function (source) {
        source.setAttribute('data-src', source.getAttribute('src'));
        source.removeAttribute('src');
      });
    });

    if (!('IntersectionObserver' in window)) {
      videos.forEach(start);
      return;
    }

    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        start(entry.target);
        obs.unobserve(entry.target);
      });
    }, { rootMargin: '250px 0px' });

    videos.forEach(function (video) { observer.observe(video); });
  }

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

  /* ---------- Header dropdown menus + mobile accordion ---------- */
  function initNavMenus() {
    var items = Array.prototype.slice.call(document.querySelectorAll('[data-nav-item]'));

    function close(item) {
      item.classList.remove('is-open');
      var btn = item.querySelector('[data-nav-toggle]');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    }

    function closeAll(except) {
      items.forEach(function (item) { if (item !== except) close(item); });
    }

    var desktop = window.matchMedia('(min-width: 992px)');

    items.forEach(function (item) {
      var btn = item.querySelector('[data-nav-toggle]');
      if (!btn) return;

      btn.addEventListener('click', function (event) {
        event.preventDefault();
        var willOpen = !item.classList.contains('is-open');
        closeAll(item);
        item.classList.toggle('is-open', willOpen);
        btn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
      });

      var closeTimer = null;

      function cancelClose() {
        if (closeTimer) {
          window.clearTimeout(closeTimer);
          closeTimer = null;
        }
      }

      item.addEventListener('mouseenter', function () {
        if (!desktop.matches) return;
        cancelClose();
        closeAll(item);
        item.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
      });

      item.addEventListener('mouseleave', function () {
        if (!desktop.matches) return;
        cancelClose();
        // Small grace period so the pointer can cross the gap into the panel.
        closeTimer = window.setTimeout(function () {
          close(item);
          closeTimer = null;
        }, 180);
      });

      item.addEventListener('focusout', function (event) {
        if (!item.contains(event.relatedTarget)) close(item);
      });
    });

    document.addEventListener('click', function (event) {
      if (!event.target.closest('[data-nav-item]')) closeAll(null);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeAll(null);
    });

    window.addEventListener('scroll', function () { closeAll(null); }, { passive: true });

    Array.prototype.slice.call(document.querySelectorAll('[data-nav-group-toggle]')).forEach(function (toggle) {
      toggle.addEventListener('click', function () {
        var group = toggle.closest('[data-nav-group]');
        var sub = document.getElementById(toggle.getAttribute('aria-controls'));
        var isOpen = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
        if (group) group.classList.toggle('is-open', !isOpen);
        if (sub) sub.hidden = isOpen;
      });
    });
  }

  /* ---------- Highlight the current page in both navigation menus ---------- */
  function initCurrentPage() {
    var currentFile = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.site-nav a[href], .site-drawer__nav a[href]').forEach(function (link) {
      var href = link.getAttribute('href');
      if (!href || href.charAt(0) === '#' || href.indexOf('://') !== -1) return;
      if (href.split('/').pop() === currentFile) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  /* ---------- AJAX forms: validation, submit state, success panel ---------- */
  function storeSubmission(payload) {
    try {
      var key = 'alify:submissions';
      var list = JSON.parse(window.localStorage.getItem(key) || '[]');
      list.push(payload);
      window.localStorage.setItem(key, JSON.stringify(list.slice(-25)));
    } catch (error) {
      /* storage blocked (private mode) — the flow still works, nothing is kept */
    }
  }

  function initAjaxForms() {
    var forms = Array.prototype.slice.call(document.querySelectorAll('[data-ajax-form]'));
    if (!forms.length) return;

    forms.forEach(function (form) {
      var section = form.closest('section') || document;
      var submit = form.querySelector('[type="submit"]');
      var submitLabel = submit ? submit.querySelector('.arrow__btn-text') : null;
      var idleLabel = submitLabel ? submitLabel.textContent : 'Send';
      var errorBox = section.querySelector('[data-form-error]');
      var successBox = section.querySelector('[data-form-success]');
      var successTitle = section.querySelector('[data-form-success-title]');
      var successText = section.querySelector('[data-form-success-text]');
      var again = section.querySelector('[data-form-again]');
      var fields = Array.prototype.slice.call(form.querySelectorAll('input, select, textarea'));
      var demoTitles = form.getAttribute('data-form-title-demo') || 'Saved — not sent yet.';
      var sentTitles = form.getAttribute('data-form-title-sent') || 'Sent.';
      var demoText = form.getAttribute('data-form-text-demo') ||
        'This preview build has no mail server connected, so your details are saved on this device only. Email hello@alify.studio and we will pick it up from there.';
      var sentText = form.getAttribute('data-form-text-sent') ||
        'Thanks — your message is with us. Expect a reply within one working day.';

      function clearInvalid() {
        fields.forEach(function (field) { field.classList.remove('is-invalid'); });
      }

      function setSending(sending) {
        if (submit) submit.disabled = sending;
        form.setAttribute('aria-busy', sending ? 'true' : 'false');
        if (submitLabel) submitLabel.textContent = sending ? 'Sending…' : idleLabel;
      }

      function showError(show) {
        if (errorBox) errorBox.hidden = !show;
      }

      function endpoint() {
        var action = (form.getAttribute('action') || '').trim();
        if (form.getAttribute('data-endpoint')) return form.getAttribute('data-endpoint').trim();
        return action && action !== '#' && !/^(javascript:|mailto:|tel:)/i.test(action) ? action : '';
      }

      function sendRequest(data) {
        var url = endpoint();
        if (!url) {
          storeSubmission(data);
          return new Promise(function (resolve) {
            window.setTimeout(function () { resolve({ demo: true }); }, 700);
          });
        }
        return window.fetch(url, {
          method: (form.getAttribute('method') || 'post').toUpperCase(),
          body: new FormData(form),
          headers: { Accept: 'application/json' }
        }).then(function (response) {
          if (!response.ok) throw new Error('Request failed: ' + response.status);
          storeSubmission(data);
          return { demo: false };
        });
      }

      form.addEventListener('submit', function (event) {
        event.preventDefault();
        showError(false);
        clearInvalid();

        if (!form.checkValidity()) {
          fields.forEach(function (field) {
            if (field.willValidate && !field.checkValidity()) field.classList.add('is-invalid');
          });
          var firstInvalid = form.querySelector('.is-invalid');
          if (firstInvalid && firstInvalid.focus) firstInvalid.focus();
          form.classList.add('was-validated');
          return;
        }

        var data = {};
        new FormData(form).forEach(function (value, key) { data[key] = value; });
        data._page = window.location.pathname.split('/').pop() || 'index.html';
        data._submittedAt = new Date().toISOString();

        setSending(true);
        sendRequest(data).then(function (result) {
          setSending(false);
          form.reset();
          form.classList.remove('was-validated');
          form.hidden = true;
          if (successBox) {
            successBox.hidden = false;
            if (successTitle) successTitle.textContent = result.demo ? demoTitles : sentTitles;
            if (successText) successText.textContent = result.demo ? demoText : sentText;
            if (successTitle && successTitle.focus) successTitle.focus();
          }
        }).catch(function () {
          setSending(false);
          showError(true);
        });
      });

      fields.forEach(function (field) {
        field.addEventListener('input', function () { field.classList.remove('is-invalid'); });
        field.addEventListener('change', function () { field.classList.remove('is-invalid'); });
      });

      if (again) {
        again.addEventListener('click', function () {
          if (successBox) successBox.hidden = true;
          form.hidden = false;
          clearInvalid();
          var firstField = fields[0];
          if (firstField && firstField.focus) firstField.focus();
        });
      }
    });
  }

  /* ---------- Book a call: week/slot picker that feeds the request form ---------- */
  function initPricingTabs() {
    var root = document.querySelector('[data-pricing-tabs]');
    if (!root) return;

    var tabs = Array.prototype.slice.call(root.querySelectorAll('[data-pricing-tab]'));
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-pricing-panel]'));
    if (!tabs.length || !panels.length) return;

    var values = tabs.map(function (tab) { return tab.getAttribute('data-pricing-tab'); });
    var live = document.querySelector('[data-pricing-live]');
    var params = new URLSearchParams(window.location.search);
    var requested = params.get('service');

    function labelFor(value) {
      var match = tabs.filter(function (tab) { return tab.getAttribute('data-pricing-tab') === value; })[0];
      return match ? match.textContent.trim() : value;
    }

    function activate(value, updateUrl) {
      if (values.indexOf(value) === -1) value = values[0];

      tabs.forEach(function (tab) {
        var on = tab.getAttribute('data-pricing-tab') === value;
        tab.classList.toggle('is-active', on);
        tab.setAttribute('aria-selected', on ? 'true' : 'false');
        tab.setAttribute('tabindex', on ? '0' : '-1');
      });

      panels.forEach(function (panel) {
        panel.hidden = panel.getAttribute('data-pricing-panel') !== value;
      });

      root.setAttribute('data-active', value);
      if (live) live.textContent = 'Showing ' + labelFor(value) + ' pricing';

      if (updateUrl && window.history.replaceState) {
        var next = new URLSearchParams(window.location.search);
        if (value === values[0]) next.delete('service');
        else next.set('service', value);
        var qs = next.toString();
        window.history.replaceState(null, '', window.location.pathname + (qs ? '?' + qs : '') + window.location.hash);
      }
    }

    tabs.forEach(function (tab, index) {
      tab.addEventListener('click', function () {
        activate(tab.getAttribute('data-pricing-tab'), true);
      });

      tab.addEventListener('keydown', function (event) {
        var nextIndex = index;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (index + 1) % tabs.length;
        else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (index - 1 + tabs.length) % tabs.length;
        else if (event.key === 'Home') nextIndex = 0;
        else if (event.key === 'End') nextIndex = tabs.length - 1;
        else return;
        event.preventDefault();
        var target = tabs[nextIndex];
        activate(target.getAttribute('data-pricing-tab'), true);
        target.focus();
      });
    });

    window.addEventListener('popstate', function () {
      var next = new URLSearchParams(window.location.search);
      activate(next.get('service') || values[0], false);
    });

    activate(requested || values[0], false);
  }
  /* ---------- Seven-step project quote wizard ---------- */
  function initFilterSelects() {
    var selects = Array.prototype.slice.call(document.querySelectorAll('[data-filter-select]'));
    if (!selects.length) return;

    function chips(name) {
      return Array.prototype.slice.call(document.querySelectorAll('[data-' + name + ']'));
    }

    function activeValue(name) {
      var chip = chips(name).filter(function (item) {
        return item.classList.contains('is-active') || item.getAttribute('aria-pressed') === 'true' ||
          item.getAttribute('aria-selected') === 'true';
      })[0];
      return chip ? chip.getAttribute('data-' + name) : null;
    }

    function syncSelects() {
      selects.forEach(function (select) {
        var value = activeValue(select.getAttribute('data-filter-select'));
        if (value) select.value = value;
      });
    }

    selects.forEach(function (select) {
      select.addEventListener('change', function () {
        var name = select.getAttribute('data-filter-select');
        var chip = chips(name).filter(function (item) {
          return item.getAttribute('data-' + name) === select.value;
        })[0];
        if (chip) chip.click();
        syncSelects();
      });
    });

    Array.prototype.slice.call(document.querySelectorAll('[data-filter-reset-group]')).forEach(function (button) {
      button.addEventListener('click', function () {
        button.getAttribute('data-filter-reset-group').split(',').forEach(function (name) {
          name = name.trim();
          var all = chips(name).filter(function (item) { return item.getAttribute('data-' + name) === 'all'; })[0];
          if (all) all.click();
        });
        syncSelects();
      });
    });

    Array.prototype.slice.call(document.querySelectorAll('[data-filter-reset]')).forEach(function (button) {
      button.addEventListener('click', function () {
        var name = button.getAttribute('data-filter-reset');
        var all = chips(name).filter(function (item) { return item.getAttribute('data-' + name) === 'all'; })[0];
        if (all) all.click();
        syncSelects();
      });
    });

    // Keep the dropdowns honest when a chip is clicked directly or from a URL.
    document.addEventListener('click', function () { window.setTimeout(syncSelects, 0); });
    syncSelects();
  }

  /* ---------- Portfolio: discipline filters, chip counts, load more ---------- */
  function initIndustrySwitcher() {
    var root = document.querySelector('[data-industry-switcher]');
    if (!root) return;

    var tabs = Array.prototype.slice.call(root.querySelectorAll('[data-industry-tab]'));
    var panels = Array.prototype.slice.call(root.querySelectorAll('[data-industry-panel]'));
    if (!tabs.length || !panels.length) return;

    var values = tabs.map(function (tab) { return tab.getAttribute('data-industry-tab'); });
    var params = new URLSearchParams(window.location.search);
    var requested = params.get('industry');

    function activate(value, updateUrl) {
      if (values.indexOf(value) === -1) value = values[0];

      tabs.forEach(function (tab) {
        var active = tab.getAttribute('data-industry-tab') === value;
        tab.classList.toggle('is-active', active);
        tab.setAttribute('aria-selected', active ? 'true' : 'false');
        tab.tabIndex = active ? 0 : -1;
      });

      panels.forEach(function (panel) {
        var active = panel.getAttribute('data-industry-panel') === value;
        panel.classList.toggle('is-active', active);
        panel.hidden = !active;
      });

      if (!updateUrl || !window.history || !window.history.replaceState) return;
      var url = new URL(window.location.href);
      url.searchParams.set('industry', value);
      window.history.replaceState({}, '', url.pathname + url.search + url.hash);
    }

    tabs.forEach(function (tab, index) {
      tab.addEventListener('click', function () {
        activate(tab.getAttribute('data-industry-tab'), true);
      });

      tab.addEventListener('keydown', function (event) {
        var next = null;
        if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = index + 1;
        if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = index - 1;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = tabs.length - 1;
        if (next === null) return;
        event.preventDefault();
        var target = tabs[(next + tabs.length) % tabs.length];
        activate(target.getAttribute('data-industry-tab'), true);
        target.focus();
      });
    });

    // Cards in the industries grid jump to this block and select their industry.
    document.querySelectorAll('[data-industry-jump]').forEach(function (card) {
      card.addEventListener('click', function () {
        activate(card.getAttribute('data-industry-jump'), true);
      });
    });

    activate(requested || values[0], false);
  }

  /* ---------- Blog archive: category filter, search, pagination, shareable URL ---------- */
  function initNotFoundSearch() {
    var search = document.querySelector('[data-404-search]');
    if (!search) return;

    var links = document.querySelectorAll('[data-404-link]');
    var status = document.querySelector('[data-404-status]');
    var empty = document.querySelector('[data-404-empty]');
    var clear = document.querySelector('[data-404-clear]');
    var chips = document.querySelectorAll('[data-404-suggest]');

    function apply() {
      var term = search.value.trim();
      var lower = term.toLowerCase();
      var shown = 0;

      links.forEach(function (link) {
        var match = !lower || link.textContent.toLowerCase().indexOf(lower) !== -1;
        link.hidden = !match;
        if (match) shown += 1;
      });

      if (clear) clear.hidden = !term;
      if (status) {
        if (!term) status.textContent = '';
        else if (shown) status.textContent = shown + ' of ' + links.length + ' pages match “' + term + '”';
        else status.textContent = 'No pages match “' + term + '”';
      }
      if (empty) empty.hidden = !term || shown > 0;
    }

    search.addEventListener('input', apply);

    if (clear) {
      clear.addEventListener('click', function () {
        search.value = '';
        apply();
        search.focus();
      });
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        search.value = chip.getAttribute('data-404-suggest') || '';
        apply();
        search.focus();
      });
    });

    apply();
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

    var shown = false;

    function toggle() {
      var shouldShow = window.scrollY > 400;
      if (shouldShow === shown) return;
      shown = shouldShow;
      btn.classList.toggle('is-visible', shouldShow);
      btn.setAttribute('aria-hidden', shouldShow ? 'false' : 'true');
      // Keep the control out of the tab order while it is hidden.
      btn.tabIndex = shouldShow ? 0 : -1;
    }

    btn.setAttribute('aria-hidden', 'true');
    btn.tabIndex = -1;
    toggle();
    window.addEventListener('scroll', toggle, { passive: true });
    window.addEventListener('resize', toggle);

    btn.addEventListener('click', function () {
      if (typeof gsap !== 'undefined' && typeof ScrollToPlugin !== 'undefined') {
        gsap.to(window, { duration: 0.8, scrollTo: 0, ease: 'power3.out' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  /* ---------- Floating Scroll-to-Bottom ---------- */
  function initScrollToBottom() {
    var btn = document.getElementById('scrollToBottom');
    if (!btn) return;

    var shown = false;

    function toggle() {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var shouldShow = max > 600 && window.scrollY < 200;
      if (shouldShow === shown) return;
      shown = shouldShow;
      btn.classList.toggle('is-visible', shouldShow);
      btn.setAttribute('aria-hidden', shouldShow ? 'false' : 'true');
      btn.tabIndex = shouldShow ? 0 : -1;
    }

    btn.setAttribute('aria-hidden', 'true');
    btn.tabIndex = -1;
    toggle();
    window.addEventListener('scroll', toggle, { passive: true });
    window.addEventListener('resize', toggle);
    window.addEventListener('load', toggle);

    btn.addEventListener('click', function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      if (typeof gsap !== 'undefined' && typeof ScrollToPlugin !== 'undefined') {
        gsap.to(window, { duration: 1, scrollTo: max, ease: 'power3.inOut' });
      } else {
        window.scrollTo({ top: max, behavior: 'smooth' });
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

  /* ---------- Section reveals ----------
     Every top-level <section> fades its blocks in once, as it enters the
     viewport. Nothing is hidden in CSS, so if GSAP fails to load the page
     stays fully visible; transforms are cleared afterwards so sticky
     cards keep working. */
  function initSectionReveals() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (document.documentElement.hasAttribute('data-no-section-anim')) return;

    var STICKY_INSIDE = '.featured-project-card, .filter-shell__side, [data-sticky]';
    // Modules that already drive their own GSAP tweens — never animate these.
    var SELF_MANAGED = '[data-case-highlight], [data-testimonial-track], [data-service-slider], [data-gallery], [data-video-modal]';

    function animatable(el) {
      if (!el || el.hidden) return false;
      var cs = window.getComputedStyle(el);
      if (cs.display === 'none' || cs.position === 'fixed' || cs.position === 'sticky') return false;
      if (el.hasAttribute('data-no-anim')) return false;
      if (el.matches(SELF_MANAGED)) return false;
      if (el.querySelector(STICKY_INSIDE)) return false;
      return true;
    }

    // Card grids animate card by card; everything else moves as one block.
    function expand(el) {
      var display = window.getComputedStyle(el).display;
      if (display !== 'grid' && display.indexOf('flex') !== 0) return [el];
      var kids = Array.prototype.filter.call(el.children, animatable);
      return kids.length >= 3 && kids.length <= 9 ? kids : [el];
    }

    function targetsFor(section) {
      var root = section.querySelector(':scope > .container, :scope > .container-fluid') || section;
      var kids = Array.prototype.filter.call(root.children, animatable);

      // A single wrapper (row / grid / stack) is unwrapped so its columns
      // animate one by one instead of the whole block moving together.
      if (kids.length === 1 && kids[0].children.length > 1) {
        var inner = Array.prototype.filter.call(kids[0].children, animatable);
        if (inner.length > 1) kids = inner;
      }

      var out = [];
      kids.forEach(function (kid) { out = out.concat(expand(kid)); });
      return out.slice(0, 10);
    }

    function animateHero(section) {
      var items = section.querySelectorAll(
        '.hero-eyebrow, h1, .home-hero__description, .inner-hero__description, .home-hero__actions, .inner-hero__actions'
      );
      if (!items.length) return;
      gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.85 }, delay: 0.12 })
        .from(items, { y: 24, opacity: 0, stagger: 0.1, clearProps: 'transform,opacity' });
    }

    Array.prototype.forEach.call(
      document.querySelectorAll('main section, .site-footer section'),
      function (section) {
        if (section.closest('.site-drawer') || section.closest('[data-no-anim]')) return;
        if (section.parentElement && section.parentElement.closest('section')) return;   // nested sections: the outer one covers them
        if (section.matches('.home-hero, .inner-hero')) { animateHero(section); return; }

        var targets = targetsFor(section);
        if (!targets.length) return;

        try {
          gsap.timeline({
            scrollTrigger: { trigger: section, start: 'top 82%', once: true },
            defaults: { duration: 0.65, ease: 'power2.out' },
            onComplete: function () { gsap.set(targets, { clearProps: 'transform,opacity' }); }
          }).from(targets, { y: 26, opacity: 0, stagger: 0.07 });
        } catch (err) {
          gsap.set(targets, { clearProps: 'transform,opacity' });
        }
      }
    );

    // Lazy images and posters change the page height, so re-measure once
    // everything has settled.
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }

  /* ---------- Service quote slider (one review per view) ---------- */
  function initQuoteSliders() {
    var sliders = document.querySelectorAll('[data-quote-slider]');
    if (!sliders.length) return;

    Array.prototype.forEach.call(sliders, function (root) {
      var track = root.querySelector('[data-quote-track]');
      if (!track) return;

      var slides = track.children;
      var prev = root.querySelector('[data-quote-prev]');
      var next = root.querySelector('[data-quote-next]');
      var status = root.querySelector('[data-quote-status]');
      var total = slides.length;
      if (total < 2) {
        if (prev) prev.disabled = true;
        if (next) next.disabled = true;
        return;
      }

      function step() { return track.clientWidth || 1; }
      function current() {
        return Math.max(0, Math.min(total - 1, Math.round(track.scrollLeft / step())));
      }

      function update() {
        var i = current();
        if (status) status.textContent = 'Review ' + (i + 1) + ' of ' + total;
        if (prev) prev.disabled = i === 0;
        if (next) next.disabled = i === total - 1;
        Array.prototype.forEach.call(slides, function (slide, index) {
          slide.classList.toggle('is-active', index === i);
          if (index === i) slide.setAttribute('aria-current', 'true');
          else slide.removeAttribute('aria-current');
        });
      }

      function goTo(index) {
        var left = Math.max(0, Math.min(total - 1, index)) * step();
        if (typeof track.scrollTo === 'function') {
          track.scrollTo({ left: left, behavior: 'smooth' });
        } else {
          track.scrollLeft = left;
        }
        update();
      }

      if (prev) prev.addEventListener('click', function () { goTo(current() - 1); });
      if (next) next.addEventListener('click', function () { goTo(current() + 1); });

      track.addEventListener('scroll', function () {
        window.clearTimeout(track._quoteTimer);
        track._quoteTimer = window.setTimeout(update, 90);
      }, { passive: true });

      track.addEventListener('keydown', function (event) {
        if (event.key === 'ArrowRight') { event.preventDefault(); goTo(current() + 1); }
        if (event.key === 'ArrowLeft') { event.preventDefault(); goTo(current() - 1); }
      });

      update();
    });
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
    var forms = Array.prototype.slice.call(
      document.querySelectorAll('form.needs-validation:not([data-ajax-form])')
    );
    if (!forms.length) return;

    forms.forEach(function (form) {
      var submit = form.querySelector('[type="submit"]');
      var status = form.querySelector('[data-form-status]');
      var defaultStatus = status ? status.textContent : '';

      form.addEventListener('submit', function (event) {
        event.preventDefault();

        if (!form.checkValidity()) {
          form.classList.add('was-validated');
          var invalid = form.querySelector(':invalid');
          if (invalid && invalid.focus) invalid.focus();
          return;
        }

        var data = {};
        new FormData(form).forEach(function (value, key) { data[key] = value; });
        data._page = window.location.pathname.split('/').pop() || 'index.html';
        data._submittedAt = new Date().toISOString();
        storeSubmission(data);

        form.classList.add('was-validated');
        if (submit) {
          submit.disabled = true;
          window.setTimeout(function () { submit.disabled = false; }, 2400);
        }
        if (status) {
          status.textContent = 'You are on the list. This preview build keeps your address on this device only — email hello@alify.studio if you would rather not wait.';
          status.classList.add('is-visible');
        }
        form.reset();
        form.classList.remove('was-validated');
        window.setTimeout(function () {
          if (status) {
            status.classList.remove('is-visible');
            status.textContent = defaultStatus;
          }
        }, 9000);
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

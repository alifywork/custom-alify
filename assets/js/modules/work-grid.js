/* work-grid.js — page-specific module, loaded only where its hooks exist. */
(function () {
  'use strict';


  function initPortfolioFilters() {
    var grid = document.querySelector('[data-portfolio-grid]');
    if (!grid) return;
    var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-portfolio-item]'));
    if (!cards.length) return;

    var filters = Array.prototype.slice.call(document.querySelectorAll('[data-portfolio-filter]'));
    var moreBtn = document.querySelector('[data-portfolio-more]');
    var statusEl = document.querySelector('[data-portfolio-status]');
    var progressEl = document.querySelector('[data-portfolio-progress]');
    var emptyEl = document.querySelector('[data-portfolio-empty]');
    var perBatch = parseInt(grid.getAttribute('data-per-batch'), 10) || 6;
    var state = { filter: 'all', shown: perBatch };

    function has(card, key) {
      return (' ' + card.getAttribute('data-portfolio-item') + ' ').indexOf(' ' + key + ' ') > -1;
    }

    // Counts on the filter chips, derived from the cards themselves (once only).
    filters.forEach(function (chip) {
      if (chip.querySelector('.blog-filters__chip-count')) return;
      var key = chip.getAttribute('data-portfolio-filter');
      var total = key === 'all' ? cards.length : cards.filter(function (card) { return has(card, key); }).length;
      var badge = document.createElement('span');
      badge.className = 'blog-filters__chip-count';
      badge.textContent = String(total);
      chip.appendChild(badge);
    });

    function matches(card) {
      return state.filter === 'all' || has(card, state.filter);
    }

    function apply() {
      var matching = cards.filter(matches);
      var visible = 0;
      cards.forEach(function (card) {
        var index = matching.indexOf(card);
        var show = index > -1 && index < state.shown;
        card.hidden = !show;
        if (show) visible += 1;
      });

      filters.forEach(function (chip) {
        var active = chip.getAttribute('data-portfolio-filter') === state.filter;
        chip.classList.toggle('is-active', active);
        chip.setAttribute('aria-pressed', active ? 'true' : 'false');
      });

      var label = visible + ' of ' + matching.length + ' project' + (matching.length === 1 ? '' : 's');
      if (statusEl) statusEl.textContent = matching.length ? 'Showing ' + label : 'No projects in this category';
      if (progressEl) progressEl.textContent = matching.length ? 'Showing ' + label : 'No projects in this category';
      if (emptyEl) emptyEl.hidden = matching.length > 0;
      if (moreBtn) {
        var remaining = matching.length - state.shown;
        moreBtn.hidden = remaining <= 0;
        var textEl = moreBtn.querySelector('.arrow__btn-text');
        if (textEl && remaining > 0) textEl.textContent = 'Load ' + remaining + ' more project' + (remaining === 1 ? '' : 's');
      }
    }

    filters.forEach(function (chip) {
      chip.addEventListener('click', function () {
        state.filter = chip.getAttribute('data-portfolio-filter');
        state.shown = perBatch;
        apply();
      });
    });

    if (moreBtn) {
      moreBtn.addEventListener('click', function () {
        state.shown += perBatch;
        apply();
      });
    }

    apply();
  }

  /* ---------- Case studies: industry + service filters (URL-persisted) ---------- */


  function initCaseStudyFilters() {
    var root = document.querySelector('[data-case-filters]');
    var grid = document.querySelector('[data-case-grid]');
    if (!root || !grid) return;

    var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-case-card]'));
    var industryChips = Array.prototype.slice.call(root.querySelectorAll('[data-case-industry-filter]'));
    var serviceChips = Array.prototype.slice.call(root.querySelectorAll('[data-case-service-filter]'));
    if (!cards.length || !industryChips.length || !serviceChips.length) return;

    var statusEl = document.querySelector('[data-case-status]');
    var emptyEl = document.querySelector('[data-case-empty]');
    var resetBtn = root.querySelector('[data-case-reset]');

    function values(chips, attribute) {
      return chips.map(function (chip) { return chip.getAttribute(attribute); });
    }
    var industries = values(industryChips, 'data-case-industry-filter');
    var services = values(serviceChips, 'data-case-service-filter');

    var params = new URLSearchParams(window.location.search);
    var state = {
      industry: industries.indexOf(params.get('industry')) > -1 ? params.get('industry') : 'all',
      service: services.indexOf(params.get('service')) > -1 ? params.get('service') : 'all'
    };

    function count(attribute, value) {
      return cards.filter(function (card) { return card.getAttribute(attribute) === value; }).length;
    }

    function addCounts(chips, attribute) {
      chips.forEach(function (chip) {
        if (chip.querySelector('.blog-filters__chip-count')) return;
        var key = chip.getAttribute(attribute);
        if (key === 'all') return;
        var total = count(attribute.replace('-filter', ''), key);
        if (!total) return;
        var badge = document.createElement('span');
        badge.className = 'blog-filters__chip-count';
        badge.textContent = String(total);
        chip.appendChild(badge);
      });
    }
    addCounts(industryChips, 'data-case-industry-filter');
    addCounts(serviceChips, 'data-case-service-filter');

    function syncChips(chips, attribute, active) {
      chips.forEach(function (chip) {
        var on = chip.getAttribute(attribute) === active;
        chip.classList.toggle('is-active', on);
        chip.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
    }

    function persist() {
      if (!window.history || !window.history.replaceState) return;
      var url = new URL(window.location.href);
      if (state.industry === 'all') url.searchParams.delete('industry');
      else url.searchParams.set('industry', state.industry);
      if (state.service === 'all') url.searchParams.delete('service');
      else url.searchParams.set('service', state.service);
      window.history.replaceState({}, '', url.pathname + url.search + url.hash);
    }

    function apply(updateUrl) {
      var shown = 0;
      cards.forEach(function (card) {
        var okIndustry = state.industry === 'all' || card.getAttribute('data-case-industry') === state.industry;
        var okService = state.service === 'all' || card.getAttribute('data-case-service') === state.service;
        var show = okIndustry && okService;
        card.hidden = !show;
        if (show) shown += 1;
      });

      syncChips(industryChips, 'data-case-industry-filter', state.industry);
      syncChips(serviceChips, 'data-case-service-filter', state.service);

      if (statusEl) {
        statusEl.textContent = shown
          ? 'Showing ' + shown + ' of ' + cards.length + ' case studies'
          : 'No case studies match those filters';
      }
      if (emptyEl) emptyEl.hidden = shown > 0;
      if (resetBtn) resetBtn.disabled = state.industry === 'all' && state.service === 'all';
      if (updateUrl) persist();
    }

    industryChips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        state.industry = chip.getAttribute('data-case-industry-filter');
        apply(true);
      });
    });

    serviceChips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        state.service = chip.getAttribute('data-case-service-filter');
        apply(true);
      });
    });

    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        state.industry = 'all';
        state.service = 'all';
        apply(true);
      });
    }

    apply(false);
  }

  /* ---------- Industries: challenge switcher (URL-persisted) ---------- */


  function initGalleryLightbox() {
    var modal = document.querySelector('[data-gallery-modal]');
    if (!modal) return;
    var openers = Array.prototype.slice.call(document.querySelectorAll('[data-gallery-open]'));
    var image = modal.querySelector('[data-gallery-image]');
    var caption = modal.querySelector('[data-gallery-caption]');
    var counter = modal.querySelector('[data-gallery-count]');
    var prevBtn = modal.querySelector('[data-gallery-prev]');
    var nextBtn = modal.querySelector('[data-gallery-next]');
    if (!openers.length || !image) return;

    var index = 0;
    var lastTrigger = null;

    function show(i) {
      index = (i + openers.length) % openers.length;
      var trigger = openers[index];
      var thumb = trigger.querySelector('img');
      image.src = trigger.getAttribute('data-gallery-src') || '';
      image.alt = thumb ? thumb.alt : '';
      if (caption) caption.textContent = trigger.getAttribute('data-gallery-caption') || '';
      if (counter) counter.textContent = (index + 1) + ' / ' + openers.length;
    }

    function open(i, trigger) {
      lastTrigger = trigger || openers[i];
      show(i);
      modal.hidden = false;
      document.body.classList.add('has-open-modal');
      var closeBtn = modal.querySelector('.video-modal__close');
      if (closeBtn) closeBtn.focus();
    }

    function close() {
      modal.hidden = true;
      document.body.classList.remove('has-open-modal');
      if (lastTrigger) lastTrigger.focus();
    }

    openers.forEach(function (trigger, i) {
      trigger.addEventListener('click', function () { open(i, trigger); });
    });

    if (prevBtn) prevBtn.addEventListener('click', function () { show(index - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { show(index + 1); });

    modal.querySelectorAll('[data-gallery-close]').forEach(function (el) {
      el.addEventListener('click', close);
    });

    document.addEventListener('keydown', function (event) {
      if (modal.hidden) return;
      if (event.key === 'Escape') close();
      if (event.key === 'ArrowLeft') show(index - 1);
      if (event.key === 'ArrowRight') show(index + 1);
    });
  }

  /* ---------- FAQ directory: search + topic tabs (URL-persisted) ---------- */


  function initVideoModal() {
    var modal = document.querySelector('[data-video-modal]');
    var player = modal ? modal.querySelector('[data-video-player]') : null;
    var caption = modal ? modal.querySelector('[data-video-caption]') : null;
    var openers = document.querySelectorAll('[data-video-open]');
    if (!modal || !player || !openers.length) return;

    var lastTrigger = null;

    function open(button) {
      lastTrigger = button;
      var src = button.getAttribute('data-video-src');
      if (src) player.src = src;
      if (caption) caption.textContent = button.getAttribute('data-video-title') || '';
      modal.hidden = false;
      document.body.classList.add('has-open-modal');
      var closeBtn = modal.querySelector('.video-modal__close');
      if (closeBtn) closeBtn.focus();
      var playing = player.play();
      if (playing && playing.catch) playing.catch(function () {});
    }

    function close() {
      player.pause();
      player.removeAttribute('src');
      player.load();
      modal.hidden = true;
      document.body.classList.remove('has-open-modal');
      if (lastTrigger) lastTrigger.focus();
    }

    openers.forEach(function (button) {
      button.addEventListener('click', function () { open(button); });
    });

    modal.querySelectorAll('[data-video-close]').forEach(function (el) {
      el.addEventListener('click', close);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !modal.hidden) close();
    });
  }

  /* ---------- Project gallery lightbox ---------- */

  document.addEventListener('DOMContentLoaded', function () {
    initPortfolioFilters();
    initCaseStudyFilters();
    initGalleryLightbox();
    initVideoModal();
  });
})();

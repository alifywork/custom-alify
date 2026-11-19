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
    initHeader();
    initCurrentPage();
    initDrawers();
    initPricingTabs();
    initFaqFilters();
    initReviewFilters();
    initQuoteWizard();
    initNotFoundSearch();
    initPortfolioFilters();
    initBlogArchive();
    initServiceSlider();
    initFeaturedProjectEffects();
    initCaseHighlightSlider();
    initTestimonials();
    initSingleServiceDetail();
    initSmoothScroll();
    initBackToTop();
    initActiveNav();
    initRevealAnimations();
    initCounters();
    initForms();
    initTooltips();
    initYear();
  });

  /* ---------- Local Hero Background Videos ---------- */
  function initBackgroundVideos() {
    var videoSections = [
      { selector: '.home-hero', source: 'assets/images/background-videos/home-hero.mp4', type: 'video/mp4' },
      { selector: '.inner-hero', source: 'assets/images/background-videos/inner-hero.mp4', type: 'video/mp4' }
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
        video.preload = 'metadata';
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

  /* ---------- Pricing service tabs ---------- */
  function initPricingTabs() {
    var tabs = document.querySelectorAll('[data-pricing-tab]');
    if (!tabs.length) return;
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var selected = tab.getAttribute('data-pricing-tab');
        tabs.forEach(function (item) { item.setAttribute('aria-selected', item === tab ? 'true' : 'false'); });
        document.querySelectorAll('[data-pricing-panel]').forEach(function (panel) {
          panel.hidden = panel.getAttribute('data-pricing-panel') !== selected;
        });
      });
    });
  }

  /* ---------- Searchable/category-filtered FAQ ---------- */
  function initFaqFilters() {
    var faqRoot = document.querySelector('[data-faq-root]');
    if (!faqRoot) return;
    var activeCategory = 'all';
    var search = faqRoot.querySelector('[data-faq-search]');
    var items = faqRoot.querySelectorAll('[data-faq-item]');
    var tabs = faqRoot.querySelectorAll('[data-faq-filter]');
    var empty = faqRoot.querySelector('[data-faq-empty]');

    function update() {
      var query = search ? search.value.trim().toLowerCase() : '';
      var visibleCount = 0;
      items.forEach(function (item) {
        var matchesCategory = activeCategory === 'all' || item.getAttribute('data-category') === activeCategory;
        var matchesText = !query || item.textContent.toLowerCase().indexOf(query) !== -1;
        item.hidden = !(matchesCategory && matchesText);
        if (!item.hidden) visibleCount += 1;
      });
      if (empty) empty.hidden = visibleCount !== 0;
    }
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        activeCategory = tab.getAttribute('data-faq-filter');
        tabs.forEach(function (item) { item.setAttribute('aria-pressed', item === tab ? 'true' : 'false'); });
        update();
      });
    });
    if (search) search.addEventListener('input', update);
    update();
  }

  /* ---------- Testimonial service filters ---------- */
  function initReviewFilters() {
    var root = document.querySelector('[data-reviews-root]');
    if (!root) return;
    var filters = root.querySelectorAll('[data-review-filter]');
    var cards = root.querySelectorAll('[data-review-card]');
    filters.forEach(function (filter) {
      filter.addEventListener('click', function () {
        var category = filter.getAttribute('data-review-filter');
        filters.forEach(function (item) { item.setAttribute('aria-pressed', item === filter ? 'true' : 'false'); });
        cards.forEach(function (card) {
          card.hidden = category !== 'all' && card.getAttribute('data-service') !== category;
        });
      });
    });
  }

  /* ---------- Seven-step project quote wizard ---------- */
  function initQuoteWizard() {
    var form = document.querySelector('[data-quote-wizard]');
    if (!form) return;
    var steps = Array.prototype.slice.call(form.querySelectorAll('[data-quote-step]'));
    var progress = Array.prototype.slice.call(form.querySelectorAll('[data-quote-progress]'));
    var currentIndex = 0;
    var serviceOptions = {
      'WordPress': ['Custom WordPress website', 'WooCommerce store', 'WordPress redesign', 'WordPress migration', 'Maintenance & care'],
      'Shopify': ['New Shopify store', 'Theme customization', 'Shopify migration', 'Conversion improvements', 'Store maintenance'],
      'UI/UX': ['UX research', 'Website UI/UX design', 'Product design', 'Usability audit', 'Design system'],
      'SEO': ['Technical SEO', 'On-page SEO', 'SEO audit', 'Migration SEO', 'Content strategy']
    };
    var subserviceField = form.querySelector('[name="subservice"]');
    form.querySelectorAll('input[name="service"]').forEach(function (radio) {
      radio.addEventListener('change', function () {
        if (!subserviceField) return;
        subserviceField.innerHTML = '<option value="" selected disabled>Select a sub-service</option>';
        (serviceOptions[radio.value] || []).forEach(function (label) {
          var option = document.createElement('option');
          option.value = label;
          option.textContent = label;
          subserviceField.appendChild(option);
        });
      });
    });

    function showStep(index) {
      currentIndex = Math.max(0, Math.min(index, steps.length - 1));
      steps.forEach(function (step, i) {
        step.hidden = i !== currentIndex;
        step.setAttribute('aria-hidden', i === currentIndex ? 'false' : 'true');
      });
      progress.forEach(function (item, i) {
        item.classList.toggle('is-current', i === currentIndex);
        item.classList.toggle('is-done', i < currentIndex);
      });
      var heading = steps[currentIndex].querySelector('h2');
      if (heading) heading.setAttribute('tabindex', '-1'), heading.focus();
      if (currentIndex === steps.length - 1) updateQuoteSummary(form);
    }

    function validateStep(step) {
      var fields = step.querySelectorAll('input[required], select[required], textarea[required]');
      var valid = true;
      var missingChoice = false;
      var radiosChecked = {};
      fields.forEach(function (field) {
        if (field.type === 'radio') {
          if (!radiosChecked[field.name]) {
            radiosChecked[field.name] = true;
            var group = step.querySelectorAll('input[type="radio"][name="' + field.name + '"]');
            var checked = Array.prototype.some.call(group, function (radio) { return radio.checked; });
            if (!checked) {
              valid = false;
              missingChoice = true;
              var label = field.closest('label');
              if (label) label.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }
        } else if (!field.checkValidity()) {
          field.classList.add('is-invalid');
          field.reportValidity();
          valid = false;
        } else {
          field.classList.remove('is-invalid');
        }
      });
      var stepError = step.querySelector('[data-step-error]');
      if (stepError) {
        stepError.textContent = missingChoice ? 'Please select an option to continue.' : 'Please complete the required fields to continue.';
        stepError.hidden = valid;
      }
      return valid;
    }

    function updateQuoteSummary(currentForm) {
      currentForm.querySelectorAll('[data-summary-for]').forEach(function (node) {
        var field = currentForm.elements[node.getAttribute('data-summary-for')];
        if (!field) return;
        var value = '';
        if (field.length && field[0] && field[0].type === 'radio') {
          var selected = currentForm.querySelector('input[name="' + field[0].name + '"]:checked');
          value = selected ? selected.value : '';
        } else {
          value = field.value || '';
        }
        node.textContent = value || 'Not provided';
      });
    }

    form.querySelectorAll('[data-quote-next]').forEach(function (button) {
      button.addEventListener('click', function () {
        if (validateStep(steps[currentIndex])) showStep(currentIndex + 1);
      });
    });
    form.querySelectorAll('[data-quote-prev]').forEach(function (button) {
      button.addEventListener('click', function () { showStep(currentIndex - 1); });
    });
    showStep(0);
  }

  /* ---------- Portfolio category filters ---------- */
  function initPortfolioFilters() {
    var grid = document.querySelector('[data-portfolio-grid]');
    if (!grid) return;
    var filters = document.querySelectorAll('[data-portfolio-filter]');
    var cards = grid.querySelectorAll('[data-portfolio-item]');
    filters.forEach(function (filter) {
      filter.addEventListener('click', function () {
        var category = filter.getAttribute('data-portfolio-filter');
        filters.forEach(function (item) {
          item.setAttribute('aria-pressed', item === filter ? 'true' : 'false');
        });
        cards.forEach(function (card) {
          card.hidden = category !== 'all' && card.getAttribute('data-portfolio-item') !== category;
        });
      });
    });
  }

  /* ---------- Blog archive: category filter, search, pagination, shareable URL ---------- */
  function initBlogArchive() {
    var root = document.querySelector('[data-blog-archive]');
    if (!root) return;

    var grid = root.querySelector('[data-blog-grid]');
    var posts = grid ? Array.prototype.slice.call(grid.querySelectorAll('[data-blog-post]')) : [];
    if (!grid || !posts.length) return;

    var chips = Array.prototype.slice.call(root.querySelectorAll('[data-blog-category]'));
    var searchInput = root.querySelector('[data-blog-search]');
    var resetBtn = root.querySelector('[data-blog-reset]');
    var countEl = root.querySelector('[data-blog-count]');
    var emptyEl = root.querySelector('[data-blog-empty]');
    var pager = root.querySelector('[data-blog-pagination]');
    var perPage = parseInt(root.getAttribute('data-per-page'), 10) || 6;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    var categories = chips.map(function (chip) { return chip.getAttribute('data-blog-category'); });
    var params = new URLSearchParams(window.location.search);
    var requestedCategory = params.get('category') || 'all';
    var state = {
      category: categories.indexOf(requestedCategory) > -1 ? requestedCategory : 'all',
      query: (params.get('q') || '').trim(),
      page: Math.max(1, parseInt(params.get('page'), 10) || 1)
    };

    if (searchInput) searchInput.value = state.query;

    // Topic counts on the filter chips, derived from the posts themselves.
    chips.forEach(function (chip) {
      var cat = chip.getAttribute('data-blog-category');
      var total = cat === 'all' ? posts.length : posts.filter(function (post) {
        return post.getAttribute('data-category') === cat;
      }).length;
      if (!total) return;
      var badge = document.createElement('span');
      badge.className = 'blog-filters__chip-count';
      badge.textContent = String(total);
      chip.appendChild(badge);
    });

    function matches(post) {
      if (state.category !== 'all' && post.getAttribute('data-category') !== state.category) return false;
      if (!state.query) return true;
      var haystack = (post.getAttribute('data-search') || post.textContent || '').toLowerCase();
      return haystack.indexOf(state.query.toLowerCase()) !== -1;
    }

    function syncUrl(push) {
      var next = new URLSearchParams();
      if (state.category !== 'all') next.set('category', state.category);
      if (state.query) next.set('q', state.query);
      if (state.page > 1) next.set('page', String(state.page));
      var qs = next.toString();
      var url = window.location.pathname + (qs ? '?' + qs : '') + window.location.hash;
      if (push && window.history.pushState) window.history.pushState(null, '', url);
      else if (window.history.replaceState) window.history.replaceState(null, '', url);
    }

    function renderPager(totalPages) {
      if (!pager) return;
      pager.innerHTML = '';
      if (totalPages < 2) return;

      function makeButton(label, page, options) {
        options = options || {};
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'blog-pagination__btn';
        btn.textContent = label;
        if (options.current) btn.setAttribute('aria-current', 'page');
        if (options.disabled) btn.disabled = true;
        if (options.aria) btn.setAttribute('aria-label', options.aria);
        if (!options.disabled && !options.current) {
          btn.addEventListener('click', function () {
            state.page = page;
            render(true, true);
          });
        }
        return btn;
      }

      pager.appendChild(makeButton('Prev', state.page - 1, {
        disabled: state.page === 1,
        aria: 'Previous page'
      }));

      for (var i = 1; i <= totalPages; i += 1) {
        pager.appendChild(makeButton(String(i), i, {
          current: i === state.page,
          aria: 'Page ' + i
        }));
      }

      pager.appendChild(makeButton('Next', state.page + 1, {
        disabled: state.page === totalPages,
        aria: 'Next page'
      }));
    }

    function render(fromUser, scrollToArchive) {
      var visible = posts.filter(matches);
      var totalPages = Math.max(1, Math.ceil(visible.length / perPage));
      if (state.page > totalPages) state.page = totalPages;

      var start = (state.page - 1) * perPage;
      var pagePosts = visible.slice(start, start + perPage);

      posts.forEach(function (post) {
        post.hidden = pagePosts.indexOf(post) === -1;
      });

      chips.forEach(function (chip) {
        var active = chip.getAttribute('data-blog-category') === state.category;
        chip.classList.toggle('is-active', active);
        chip.setAttribute('aria-pressed', active ? 'true' : 'false');
      });

      if (countEl) {
        var total = posts.length;
        if (visible.length === total) {
          countEl.textContent = total + ' articles';
        } else if (!visible.length) {
          countEl.textContent = 'No articles match';
        } else {
          countEl.textContent = 'Showing ' + visible.length + ' of ' + total + ' articles';
        }
      }

      if (emptyEl) emptyEl.hidden = visible.length > 0;

      renderPager(totalPages);
      syncUrl(false);

      if (fromUser && scrollToArchive && !reduceMotion.matches) {
        var top = root.getBoundingClientRect().top + window.scrollY - 90;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        state.category = chip.getAttribute('data-blog-category');
        state.page = 1;
        render(true);
      });
    });

    if (searchInput) {
      var timer = null;
      searchInput.addEventListener('input', function () {
        window.clearTimeout(timer);
        timer = window.setTimeout(function () {
          state.query = searchInput.value.trim();
          state.page = 1;
          render(true);
        }, 180);
      });
      searchInput.addEventListener('search', function () {
        state.query = searchInput.value.trim();
        state.page = 1;
        render(true);
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        state.category = 'all';
        state.query = '';
        state.page = 1;
        if (searchInput) searchInput.value = '';
        render(true);
      });
    }

    window.addEventListener('popstate', function () {
      var next = new URLSearchParams(window.location.search);
      var cat = next.get('category') || 'all';
      state.category = categories.indexOf(cat) > -1 ? cat : 'all';
      state.query = (next.get('q') || '').trim();
      state.page = Math.max(1, parseInt(next.get('page'), 10) || 1);
      if (searchInput) searchInput.value = state.query;
      render(false);
    });

    render(false);
  }

  /* ---------- Homepage service carousel controls ---------- */
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
    // Start on the first review even if the browser restores a scroll position.
    requestAnimationFrame(function () {
      if (track.scrollLeft > 0) track.scrollLeft = centreFor(cards[0]);
      schedule();
    });
  }

  /* ---------- Service detail personalization from carousel links ---------- */
  function initSingleServiceDetail() {
    if (!document.querySelector('.article-layout') || !/single-service\.html$/.test(window.location.pathname)) return;
    var serviceNames = {
      'web-development': ['Web Development', 'Fast, accessible websites designed to turn your goals into intuitive online experiences.'],
      'wordpress': ['WordPress Web Development', 'Flexible WordPress websites and custom experiences your team can confidently manage.'],
      'shopify': ['Shopify Web Development', 'Conversion-minded Shopify stores that make product discovery and checkout feel simple.'],
      'ui-ux': ['UI / UX', 'Research-led user journeys and interfaces that help people get where they need to go.'],
      'seo': ['Search Engine Optimization', 'Technical and on-page SEO to improve discoverability and earn the right organic traffic.'],
      'digital-marketing': ['Digital Marketing', 'Connected digital campaigns that build awareness, engagement and measurable momentum.'],
      'content-writing': ['Content Writing', 'Clear, useful content shaped around your voice, audience and business objectives.'],
      'logo-designing': ['Logo Designing', 'Distinctive logo concepts and visual foundations that make your brand memorable.'],
      'ai-automation': ['AI Automation', 'Practical AI-powered workflows to reduce repetitive work and create more room for impact.']
    };
    var params = new URLSearchParams(window.location.search);
    var selected = serviceNames[params.get('service')];
    if (!selected) return;
    var title = document.querySelector('#pageHeroTitle');
    var heroDescription = document.querySelector('.inner-hero__description');
    var docTitle = document.querySelector('title');
    if (title) title.textContent = selected[0];
    if (heroDescription) heroDescription.textContent = selected[1];
    if (docTitle) docTitle.textContent = selected[0] + ' | Alify';
  }

  /* ---------- Lightweight 404 quick-link search ---------- */
  function initNotFoundSearch() {
    var search = document.querySelector('[data-404-search]');
    if (!search) return;
    var links = document.querySelectorAll('[data-404-link]');
    search.addEventListener('input', function () {
      var term = search.value.trim().toLowerCase();
      links.forEach(function (link) { link.hidden = !!term && link.textContent.toLowerCase().indexOf(term) === -1; });
    });
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
        } else if (form.hasAttribute('data-demo-form')) {
          event.preventDefault();
          var status = form.querySelector('[data-form-status]');
          if (status) {
            status.textContent = 'This form is ready for the site’s email or CRM connection; no message is sent yet.';
            status.classList.add('is-visible');
          }
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

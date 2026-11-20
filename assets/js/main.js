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
    initIndustrySwitcher();
    initBlogArchive();
    initReadingProgress();
    initArticleToc();
    initShareButtons();
    initTestimonialFilters();
    initFaqDirectory();
    initVideoModal();
    initGalleryLightbox();
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
    initContactForm();
    initCallCalendar();
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

  /* ---------- Contact form: inline validation + AJAX submit ---------- */
  function initContactForm() {
    var form = document.querySelector('[data-ajax-form]');
    if (!form) return;

    var submit = form.querySelector('[type="submit"]');
    var submitLabel = submit ? submit.querySelector('.arrow__btn-text') : null;
    var idleLabel = submitLabel ? submitLabel.textContent : 'Send';
    var errorBox = document.querySelector('[data-form-error]');
    var successBox = document.querySelector('[data-form-success]');
    var successTitle = document.querySelector('[data-form-success-title]');
    var successText = document.querySelector('[data-form-success-text]');
    var again = document.querySelector('[data-form-again]');
    var demoTitles = form.getAttribute('data-form-title-demo') || 'Message ready — not sent yet.';
    var sentTitles = form.getAttribute('data-form-title-sent') || 'Message sent.';
    var fields = Array.prototype.slice.call(form.querySelectorAll('input, select, textarea'));

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

    function sendRequest() {
      var action = (form.getAttribute('action') || '').trim();
      var hasEndpoint = action && action !== '#' && !/^(javascript:|mailto:|tel:)/i.test(action);

      if (!hasEndpoint) {
        // No backend wired up yet: keep the AJAX flow but never claim a delivery.
        return new Promise(function (resolve) {
          window.setTimeout(function () { resolve({ demo: true }); }, 850);
        });
      }

      return window.fetch(action, {
        method: (form.getAttribute('method') || 'post').toUpperCase(),
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      }).then(function (response) {
        if (!response.ok) throw new Error('Request failed: ' + response.status);
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

      setSending(true);
      sendRequest().then(function (result) {
        setSending(false);
        form.reset();
        form.classList.remove('was-validated');
        form.hidden = true;
        if (successBox) {
          successBox.hidden = false;
          if (successTitle) successTitle.textContent = result.demo ? demoTitles : sentTitles;
          if (successText) {
            successText.textContent = result.demo
              ? 'This preview has no mail server connected, so nothing was delivered. Email hello@alify.studio directly and we will pick it up from there.'
              : 'Thanks — your message is with us. Expect a reply within one working day.';
          }
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
  }

  /* ---------- Book a call: week/slot picker that feeds the request form ---------- */
  function initCallCalendar() {
    var root = document.querySelector('[data-call-calendar]');
    if (!root) return;

    var daysWrap = root.querySelector('[data-call-days]');
    var slotsWrap = root.querySelector('[data-call-slots]');
    var monthNode = root.querySelector('[data-call-month]');
    var prevButton = root.querySelector('[data-call-prev]');
    var nextButton = root.querySelector('[data-call-next]');
    var live = root.querySelector('[data-call-live]');
    var slotNodes = document.querySelectorAll('[data-call-slot]');
    var slotInputs = document.querySelectorAll('[data-call-slot-input]');
    if (!daysWrap || !slotsWrap) return;

    var TIMES = ['10:00', '11:30', '13:00', '14:30', '16:00', '17:30'];
    var DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var MAX_WEEKS = 4;
    var weekOffset = 0;
    var selectedDay = 0;
    var selectedTime = '';

    function collectDays(offset) {
      var days = [];
      var cursor = new Date();
      cursor.setHours(0, 0, 0, 0);
      cursor.setDate(cursor.getDate() + offset * 7);
      while (days.length < 5) {
        if (cursor.getDay() !== 0 && cursor.getDay() !== 6) days.push(new Date(cursor));
        cursor.setDate(cursor.getDate() + 1);
      }
      return days;
    }

    function monthLabel(days) {
      var first = days[0];
      var last = days[days.length - 1];
      if (first.getMonth() === last.getMonth()) return MONTHS[first.getMonth()] + ' ' + first.getFullYear();
      return MONTHS[first.getMonth()] + ' – ' + MONTHS[last.getMonth()] + ' ' + last.getFullYear();
    }

    function selectionLabel() {
      if (!selectedTime) return '';
      var days = collectDays(weekOffset);
      var date = days[selectedDay];
      if (!date) return '';
      return DAY_NAMES[date.getDay()] + ' ' + date.getDate() + ' ' + MONTHS[date.getMonth()] + ' · ' + selectedTime + ' PKT';
    }

    function syncSelection() {
      var label = selectionLabel();
      slotNodes.forEach(function (node) { node.textContent = label || 'Pick a time above'; });
      slotInputs.forEach(function (input) { input.value = label; });
      if (live && label) live.textContent = 'Selected ' + label;
    }

    function renderSlots() {
      slotsWrap.innerHTML = '';
      TIMES.forEach(function (time) {
        var button = document.createElement('button');
        var active = time === selectedTime;
        button.type = 'button';
        button.className = 'call-calendar__slot';
        button.setAttribute('aria-pressed', active ? 'true' : 'false');
        button.textContent = time;
        button.addEventListener('click', function () {
          selectedTime = time;
          renderSlots();
          syncSelection();
        });
        slotsWrap.appendChild(button);
      });
    }

    function render() {
      var days = collectDays(weekOffset);
      if (selectedDay >= days.length) selectedDay = 0;

      if (monthNode) monthNode.textContent = monthLabel(days);
      if (prevButton) prevButton.disabled = weekOffset === 0;
      if (nextButton) nextButton.disabled = weekOffset >= MAX_WEEKS;

      daysWrap.innerHTML = '';
      days.forEach(function (date, index) {
        var button = document.createElement('button');
        var active = index === selectedDay;
        button.type = 'button';
        button.className = 'call-calendar__day';
        button.setAttribute('aria-pressed', active ? 'true' : 'false');
        button.setAttribute('data-call-day', String(index));
        var name = document.createElement('span');
        name.textContent = DAY_NAMES[date.getDay()];
        var number = document.createElement('strong');
        number.textContent = String(date.getDate());
        button.appendChild(name);
        button.appendChild(number);
        button.addEventListener('click', function () {
          selectedDay = index;
          selectedTime = '';
          render();
        });
        daysWrap.appendChild(button);
      });

      renderSlots();
      syncSelection();
    }

    if (prevButton) {
      prevButton.addEventListener('click', function () {
        if (weekOffset === 0) return;
        weekOffset -= 1;
        selectedTime = '';
        render();
      });
    }

    if (nextButton) {
      nextButton.addEventListener('click', function () {
        if (weekOffset >= MAX_WEEKS) return;
        weekOffset += 1;
        selectedTime = '';
        render();
      });
    }

    render();
  }

  /* ---------- Pricing page: service tabs drive plans and the comparison table ---------- */
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
      'Website design & build': ['Marketing website', 'Custom WordPress build', 'Webflow build', 'Redesign of an existing site', 'Platform migration', 'Ongoing care'],
      'Brand identity': ['New brand identity', 'Brand refresh', 'Brand guidelines', 'Logo suite only', 'Design system', 'Pitch or deck design'],
      'Ecommerce': ['New Shopify store', 'WooCommerce store', 'Theme customization', 'Store migration', 'Conversion improvements', 'Store maintenance'],
      'Growth & SEO': ['Technical SEO', 'On-page SEO', 'SEO audit', 'Content strategy', 'Paid + CRO', 'Analytics setup'],
      'WordPress': ['Custom WordPress website', 'WooCommerce store', 'WordPress redesign', 'WordPress migration', 'Maintenance & care'],
      'Shopify': ['New Shopify store', 'Theme customization', 'Shopify migration', 'Conversion improvements', 'Store maintenance'],
      'UI/UX': ['UX research', 'Website UI/UX design', 'Product design', 'Usability audit', 'Design system'],
      'SEO': ['Technical SEO', 'On-page SEO', 'SEO audit', 'Migration SEO', 'Content strategy']
    };
    var servicePrices = {
      'Website design & build': 'from $2,400',
      'Brand identity': 'from $1,600',
      'Ecommerce': 'from $3,200',
      'Growth & SEO': 'from $1,800'
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
      var stepLabel = steps[currentIndex].getAttribute('data-quote-label') || '';
      var chrome = form.closest('[data-quote-wizard-wrap]') || form;
      var counter = chrome.querySelector('[data-quote-step-count]');
      var labelNode = chrome.querySelector('[data-quote-step-label]');
      var live = chrome.querySelector('[data-quote-live]');
      var prevButton = form.querySelector('[data-quote-prev]');
      var nextButton = form.querySelector('[data-quote-next]');
      var submitButton = form.querySelector('[type="submit"]');

      if (counter) counter.textContent = String(currentIndex + 1);
      if (labelNode) labelNode.textContent = stepLabel;
      if (live) live.textContent = 'Step ' + (currentIndex + 1) + ' of ' + steps.length + (stepLabel ? ': ' + stepLabel : '');
      if (prevButton) prevButton.hidden = currentIndex === 0;
      if (nextButton) nextButton.hidden = currentIndex === steps.length - 1;
      if (submitButton) submitButton.hidden = currentIndex !== steps.length - 1;

      var heading = steps[currentIndex].querySelector('h2');
      if (heading) {
        heading.setAttribute('tabindex', '-1');
        heading.focus({ preventScroll: true });
      }

      updateQuoteSummary(form);
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
              if (label && label.scrollIntoView) label.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
      // The summary can sit outside the form, so look it up on the page.
      document.querySelectorAll('[data-summary-for]').forEach(function (node) {
        var name = node.getAttribute('data-summary-for');
        var fields = currentForm.querySelectorAll('[name="' + name + '"]');
        if (!fields.length) return;
        var value = '';
        if (fields[0].type === 'radio') {
          var checked = Array.prototype.filter.call(fields, function (field) { return field.checked; })[0];
          value = checked ? checked.value : '';
        } else {
          value = fields[0].value || '';
        }
        node.textContent = value || 'Not provided';
      });

      var priceNode = document.querySelector('[data-quote-price]');
      if (priceNode) {
        var service = currentForm.querySelector('input[name="service"]:checked');
        priceNode.textContent = service ? (servicePrices[service.value] || 'Confirmed on the call') : 'Pick a service';
      }
    }

    form.querySelectorAll('[data-quote-next]').forEach(function (button) {
      button.addEventListener('click', function () {
        if (validateStep(steps[currentIndex])) showStep(currentIndex + 1);
      });
    });
    form.querySelectorAll('[data-quote-prev]').forEach(function (button) {
      button.addEventListener('click', function () { showStep(currentIndex - 1); });
    });

    // A submit can only happen on the last step, but earlier answers may have
    // been edited since; check every step and jump back to the first problem.
    form.addEventListener('submit', function (event) {
      updateQuoteSummary(form);
      var firstInvalid = -1;
      steps.forEach(function (step, index) {
        if (!validateStep(step) && firstInvalid === -1) firstInvalid = index;
      });
      if (firstInvalid !== -1) {
        event.preventDefault();
        event.stopImmediatePropagation();
        showStep(firstInvalid);
      }
    });

    form.addEventListener('input', function () { updateQuoteSummary(form); });

    showStep(0);
  }

  /* ---------- Portfolio category filters ---------- */
  /* ---------- Portfolio: discipline filters, chip counts, load more ---------- */
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

  /* ---------- Industries: challenge switcher (URL-persisted) ---------- */
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

  /* ---------- Article reading progress ---------- */
  function initReadingProgress() {
    var bar = document.querySelector('[data-reading-bar]');
    var body = document.querySelector('[data-article-body]');
    if (!bar || !body) return;

    var ticking = false;

    function update() {
      ticking = false;
      var rect = body.getBoundingClientRect();
      var start = rect.top + window.scrollY;
      var travel = Math.max(rect.height - window.innerHeight * 0.55, 1);
      var pct = (window.scrollY - start + window.innerHeight * 0.2) / travel;
      pct = Math.max(0, Math.min(1, pct));
      bar.style.width = (pct * 100).toFixed(2) + '%';
    }

    function request() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }

    update();
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);
  }

  /* ---------- Table of contents built from the article ---------- */
  function initArticleToc() {
    var body = document.querySelector('[data-article-body]');
    var list = document.querySelector('[data-article-toc-list]');
    if (!body || !list) return;

    var toc = document.querySelector('[data-article-toc]');
    var heads = Array.prototype.slice.call(body.querySelectorAll('h2'));
    if (!heads.length) {
      if (toc) toc.hidden = true;
      return;
    }

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    var links = [];

    function setActive(id) {
      links.forEach(function (item) {
        var active = item.heading.id === id;
        item.link.classList.toggle('is-active', active);
        if (active) item.link.setAttribute('aria-current', 'true');
        else item.link.removeAttribute('aria-current');
      });
    }

    heads.forEach(function (heading, index) {
      if (!heading.id) heading.id = 'section-' + (index + 1);

      var item = document.createElement('li');
      item.className = 'article-toc__item';

      var link = document.createElement('a');
      link.className = 'article-toc__link';
      link.href = '#' + heading.id;

      var num = document.createElement('span');
      num.className = 'article-toc__num';
      num.setAttribute('aria-hidden', 'true');
      num.textContent = ('0' + (index + 1)).slice(-2);

      var text = document.createElement('span');
      text.textContent = heading.textContent.trim();

      link.appendChild(num);
      link.appendChild(text);
      link.addEventListener('click', function (event) {
        event.preventDefault();
        if (heading.scrollIntoView) {
          heading.scrollIntoView({
            behavior: reduceMotion.matches ? 'auto' : 'smooth',
            block: 'start'
          });
        } else {
          window.scrollTo(0, heading.getBoundingClientRect().top + window.scrollY - 100);
        }
        setActive(heading.id);
        if (window.history.replaceState) window.history.replaceState(null, '', '#' + heading.id);
      });

      item.appendChild(link);
      list.appendChild(item);
      links.push({ heading: heading, link: link });
    });

    if ('IntersectionObserver' in window) {
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      }, { rootMargin: '-100px 0px -68% 0px', threshold: 0 });
      heads.forEach(function (heading) { spy.observe(heading); });
    }

    if (window.location.hash) {
      var hash = window.location.hash.slice(1);
      if (heads.some(function (h) { return h.id === hash; })) setActive(hash);
    }
  }

  /* ---------- Share buttons (network share, native share, copy link) ---------- */
  function initShareButtons() {
    var buttons = document.querySelectorAll('[data-share]');
    if (!buttons.length) return;

    function announce(btn, message) {
      var block = btn.closest('.article-share');
      var status = block ? block.querySelector('[data-share-status]') : null;
      if (!status) return;
      status.textContent = message;
      status.classList.add('is-visible');
      window.clearTimeout(status._timer);
      status._timer = window.setTimeout(function () {
        status.classList.remove('is-visible');
      }, 4000);
    }

    function legacyCopy(text) {
      var field = document.createElement('textarea');
      field.value = text;
      field.setAttribute('readonly', '');
      field.style.position = 'fixed';
      field.style.opacity = '0';
      document.body.appendChild(field);
      field.select();
      var copied = false;
      try {
        copied = document.execCommand('copy');
      } catch (error) {
        copied = false;
      }
      document.body.removeChild(field);
      return copied;
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        var kind = button.getAttribute('data-share');
        var url = window.location.href;
        var title = document.title;

        if (kind === 'copy') {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url).then(function () {
              announce(button, 'Link copied to your clipboard.');
            }).catch(function () {
              announce(button, legacyCopy(url) ? 'Link copied to your clipboard.' : 'Copy failed — copy the address bar instead.');
            });
          } else {
            announce(button, legacyCopy(url) ? 'Link copied to your clipboard.' : 'Copy failed — copy the address bar instead.');
          }
          return;
        }

        var targets = {
          linkedin: 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(url),
          x: 'https://twitter.com/intent/tweet?url=' + encodeURIComponent(url) + '&text=' + encodeURIComponent(title),
          facebook: 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url),
          mail: 'mailto:?subject=' + encodeURIComponent(title) + '&body=' + encodeURIComponent(url)
        };

        if (kind === 'native' && navigator.share) {
          navigator.share({ title: title, url: url }).catch(function () {});
          return;
        }

        if (targets[kind]) {
          window.open(targets[kind], '_blank', 'noopener,noreferrer,width=640,height=560');
        }
      });
    });
  }

  /* ---------- Testimonials: topic filters (URL-persisted) ---------- */
  function initTestimonialFilters() {
    var root = document.querySelector('[data-review-archive]');
    if (!root) return;

    var items = Array.prototype.slice.call(root.querySelectorAll('[data-review-item]'));
    var chips = Array.prototype.slice.call(root.querySelectorAll('[data-review-filter]'));
    if (!items.length || !chips.length) return;

    var countEl = root.querySelector('[data-review-count]');
    var emptyEl = root.querySelector('[data-review-empty]');
    var resetBtn = root.querySelector('[data-review-reset]');
    var values = chips.map(function (chip) { return chip.getAttribute('data-review-filter'); });
    var params = new URLSearchParams(window.location.search);
    var requested = params.get('topic') || 'all';
    var state = { filter: values.indexOf(requested) > -1 ? requested : 'all' };

    // Topic counts on the chips, measured from the cards themselves.
    chips.forEach(function (chip) {
      var value = chip.getAttribute('data-review-filter');
      var total = value === 'all' ? items.length : items.filter(function (item) {
        return item.getAttribute('data-review-category') === value;
      }).length;
      if (!total) return;
      var badge = document.createElement('span');
      badge.className = 'blog-filters__chip-count';
      badge.textContent = String(total);
      chip.appendChild(badge);
    });

    function syncUrl() {
      if (!window.history.replaceState) return;
      var qs = state.filter === 'all' ? '' : '?topic=' + encodeURIComponent(state.filter);
      window.history.replaceState(null, '', window.location.pathname + qs + window.location.hash);
    }

    function render() {
      var shown = items.filter(function (item) {
        return state.filter === 'all' || item.getAttribute('data-review-category') === state.filter;
      });

      items.forEach(function (item) { item.hidden = shown.indexOf(item) === -1; });

      chips.forEach(function (chip) {
        var active = chip.getAttribute('data-review-filter') === state.filter;
        chip.classList.toggle('is-active', active);
        chip.setAttribute('aria-pressed', active ? 'true' : 'false');
      });

      if (countEl) {
        if (shown.length === items.length) countEl.textContent = items.length + ' reviews';
        else if (!shown.length) countEl.textContent = 'No reviews in this topic';
        else countEl.textContent = 'Showing ' + shown.length + ' of ' + items.length + ' reviews';
      }

      if (emptyEl) emptyEl.hidden = shown.length > 0;
      syncUrl();
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        state.filter = chip.getAttribute('data-review-filter');
        render();
      });
    });

    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        state.filter = 'all';
        render();
      });
    }

    window.addEventListener('popstate', function () {
      var next = (new URLSearchParams(window.location.search).get('topic')) || 'all';
      state.filter = values.indexOf(next) > -1 ? next : 'all';
      render();
    });

    render();
  }

  /* ---------- Video testimonial lightbox ---------- */
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
  function initFaqDirectory() {
    var root = document.querySelector('[data-faq-directory]');
    if (!root) return;

    var items = Array.prototype.slice.call(root.querySelectorAll('[data-faq-item]'));
    var tabs = Array.prototype.slice.call(root.querySelectorAll('[data-faq-tab]'));
    if (!items.length || !tabs.length) return;

    var search = root.querySelector('[data-faq-search]');
    var reset = root.querySelector('[data-faq-reset]');
    var countEl = root.querySelector('[data-faq-count]');
    var emptyEl = root.querySelector('[data-faq-empty]');
    var values = tabs.map(function (tab) { return tab.getAttribute('data-faq-tab'); });
    var params = new URLSearchParams(window.location.search);
    var requested = params.get('topic') || 'all';

    var state = {
      topic: values.indexOf(requested) > -1 ? requested : 'all',
      query: (params.get('q') || '').trim()
    };

    if (search) search.value = state.query;

    // Topic counts on the tabs.
    tabs.forEach(function (tab) {
      var value = tab.getAttribute('data-faq-tab');
      var total = value === 'all' ? items.length : items.filter(function (item) {
        return item.getAttribute('data-faq-category') === value;
      }).length;
      if (!total) return;
      var badge = document.createElement('span');
      badge.className = 'blog-filters__chip-count';
      badge.textContent = String(total);
      tab.appendChild(badge);
    });

    function syncUrl() {
      if (!window.history.replaceState) return;
      var next = new URLSearchParams();
      if (state.topic !== 'all') next.set('topic', state.topic);
      if (state.query) next.set('q', state.query);
      var qs = next.toString();
      window.history.replaceState(null, '', window.location.pathname + (qs ? '?' + qs : '') + window.location.hash);
    }

    function render() {
      var query = state.query.toLowerCase();
      var shown = items.filter(function (item) {
        var topicOk = state.topic === 'all' || item.getAttribute('data-faq-category') === state.topic;
        var haystack = (item.getAttribute('data-faq-search') || item.textContent || '').toLowerCase();
        return topicOk && (!query || haystack.indexOf(query) !== -1);
      });

      items.forEach(function (item) { item.hidden = shown.indexOf(item) === -1; });

      // Keep the visible numbering tidy after filtering.
      shown.forEach(function (item, index) {
        var num = item.querySelector('.home-faq__index');
        if (num) num.textContent = ('0' + (index + 1)).slice(-2);
      });

      tabs.forEach(function (tab) {
        var active = tab.getAttribute('data-faq-tab') === state.topic;
        tab.classList.toggle('is-active', active);
        tab.setAttribute('aria-pressed', active ? 'true' : 'false');
      });

      if (countEl) {
        if (shown.length === items.length) countEl.textContent = items.length + ' questions';
        else if (!shown.length) countEl.textContent = 'No questions match';
        else countEl.textContent = 'Showing ' + shown.length + ' of ' + items.length + ' questions';
      }

      if (emptyEl) emptyEl.hidden = shown.length > 0;
      syncUrl();
    }

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        state.topic = tab.getAttribute('data-faq-tab');
        render();
      });
    });

    if (search) {
      var timer = null;
      search.addEventListener('input', function () {
        window.clearTimeout(timer);
        timer = window.setTimeout(function () {
          state.query = search.value.trim();
          render();
        }, 180);
      });
      search.addEventListener('search', function () {
        state.query = search.value.trim();
        render();
      });
    }

    if (reset) {
      reset.addEventListener('click', function () {
        state.topic = 'all';
        state.query = '';
        if (search) search.value = '';
        render();
      });
    }

    window.addEventListener('popstate', function () {
      var next = new URLSearchParams(window.location.search);
      var topic = next.get('topic') || 'all';
      state.topic = values.indexOf(topic) > -1 ? topic : 'all';
      state.query = (next.get('q') || '').trim();
      if (search) search.value = state.query;
      render();
    });

    render();
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

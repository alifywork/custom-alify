/* forms-flow.js — page-specific module, loaded only where its hooks exist. */
(function () {
  'use strict';


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
  /* ---------- Filter sidebars: native selects drive the existing chip filters ---------- */


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

  document.addEventListener('DOMContentLoaded', function () {
    initQuoteWizard();
    initCallCalendar();
  });
})();

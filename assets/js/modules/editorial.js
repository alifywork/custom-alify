/* editorial.js — page-specific module, loaded only where its hooks exist. */
(function () {
  'use strict';


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

  document.addEventListener('DOMContentLoaded', function () {
    initBlogArchive();
    initReadingProgress();
    initArticleToc();
    initShareButtons();
    initFaqDirectory();
    initTestimonialFilters();
  });
})();

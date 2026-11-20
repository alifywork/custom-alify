/* service-detail.js — page-specific module, loaded only where its hooks exist. */
(function () {
  'use strict';


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

  document.addEventListener('DOMContentLoaded', function () {
    initSingleServiceDetail();
  });
})();

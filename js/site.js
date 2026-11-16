/* Progressive enhancement only: content and navigation work without JavaScript. */
(() => {
  'use strict';
  const header = document.querySelector('.site-header');
  const syncHeaderHeight = () => {
    if (header) document.documentElement.style.setProperty('--header-height', `${Math.ceil(header.getBoundingClientRect().height)}px`);
  };
  if (header) {
    syncHeaderHeight();
    window.addEventListener('resize', syncHeaderHeight, {passive: true});
    if (window.ResizeObserver) new window.ResizeObserver(syncHeaderHeight).observe(header);
  }
  const menuButton = document.querySelector('.menu-toggle');
  const menu = document.querySelector('#site-nav');
  if (menuButton && menu) {
    const closeMenu = () => { menu.classList.remove('is-open'); menuButton.setAttribute('aria-expanded', 'false'); syncHeaderHeight(); };
    menuButton.addEventListener('click', () => {
      const open = menuButton.getAttribute('aria-expanded') !== 'true';
      menuButton.setAttribute('aria-expanded', String(open)); menu.classList.toggle('is-open', open);
      syncHeaderHeight();
    });
    menu.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
  }

  // Course navigation becomes a labeled, collapsible list on smaller screens.
  const sidebar = document.querySelector('.course-sidebar');
  if (sidebar) {
    const toggle = document.createElement('button');
    toggle.className = 'small-button course-sidebar-toggle';
    toggle.type = 'button';
    toggle.textContent = 'Browse lectures ↓';
    toggle.setAttribute('aria-expanded', 'false');
    const navigation = sidebar.querySelector('nav');
    navigation.id = 'course-lecture-navigation';
    toggle.setAttribute('aria-controls', navigation.id);
    sidebar.insertBefore(toggle, navigation);
    toggle.addEventListener('click', () => {
      const open = sidebar.classList.toggle('is-expanded');
      toggle.setAttribute('aria-expanded', String(open)); toggle.textContent = open ? 'Hide lectures ↑' : 'Browse lectures ↓';
    });
  }

  const rows = [...document.querySelectorAll('[data-publication-list] [data-paper]')];
  const search = document.querySelector('#paper-search');
  const year = document.querySelector('#paper-year');
  const status = document.querySelector('#paper-status');
  if (rows.length && search && year && status) {
    const params = new URLSearchParams(location.search);
    search.value = params.get('q') || '';
    year.value = params.get('year') || '';
    status.value = params.get('status') || '';
    const clear = document.querySelector('#clear-filters');
    const normalize = text => text.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const filter = () => {
      const terms = normalize(search.value.trim()).split(/\s+/).filter(Boolean);
      let count = 0;
      rows.forEach(row => {
        const show = terms.every(term => normalize(row.dataset.search).includes(term)) && (!year.value || row.dataset.year === year.value) && (!status.value || row.dataset.status === status.value);
        row.hidden = !show; if (show) count++;
      });
      document.querySelector('#paper-count').textContent = String(count);
      document.querySelector('#no-results').hidden = count !== 0;
      clear.hidden = !search.value && !year.value && !status.value;
      const next = new URLSearchParams();
      if (search.value.trim()) next.set('q', search.value.trim());
      if (year.value) next.set('year', year.value);
      if (status.value) next.set('status', status.value);
      const query = next.toString();
      history.replaceState(null, '', location.pathname + (query ? '?' + query : '') + location.hash);
    };
    const reset = () => { search.value = ''; year.value = ''; status.value = ''; filter(); search.focus(); };
    search.addEventListener('input', filter); year.addEventListener('change', filter); status.addEventListener('change', filter);
    clear.addEventListener('click', reset);
    document.querySelectorAll('[data-reset-filters]').forEach(button => button.addEventListener('click', reset));
    filter();
  }

  const animated = [...document.querySelectorAll('img[data-animated][data-still]')];
  const animationButtons = [...document.querySelectorAll('[data-animation-toggle]')];
  if (animated.length) {
    const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
    let paused = motionQuery.matches;
    try { paused = localStorage.getItem('academic-pause-animations') === 'true' || paused; } catch (_) { /* Storage is optional. */ }
    const apply = () => {
      animated.forEach(img => {
        img.src = paused ? img.dataset.still : img.dataset.animated;
        const source = img.closest('picture').querySelector('source');
        if (source) source.srcset = paused ? img.dataset.still : img.dataset.animated;
      });
      animationButtons.forEach(button => { button.hidden = false; button.setAttribute('aria-pressed', String(paused)); button.textContent = paused ? 'Play animations' : 'Pause animations'; });
    };
    animationButtons.forEach(button => button.addEventListener('click', () => { paused = !paused; try { localStorage.setItem('academic-pause-animations', String(paused)); } catch (_) {} apply(); }));
    motionQuery.addEventListener('change', event => { paused = event.matches; apply(); });
    apply();
  }

  document.querySelectorAll('[data-copy-target]').forEach(button => {
    button.addEventListener('click', async () => {
      const target = document.getElementById(button.dataset.copyTarget);
      if (!target) return;
      try { await navigator.clipboard.writeText(target.textContent); button.textContent = 'Copied'; }
      catch (_) { button.textContent = 'Select and copy the citation above'; }
    });
  });

  const renderMath = () => {
    if (!window.renderMathInElement) return;
    window.renderMathInElement(document.querySelector('main'), {
      delimiters: [{left:'$$',right:'$$',display:true},{left:'\\[',right:'\\]',display:true},{left:'\\(',right:'\\)',display:false},{left:'$',right:'$',display:false}],
      throwOnError: false, strict: 'ignore', trust: false,
      ignoredTags: ['script','noscript','style','textarea','pre','code','option'],
      macros: {'\\R':'\\mathbb{R}','\\C':'\\mathbb{C}','\\N':'\\mathbb{N}','\\Z':'\\mathbb{Z}'}
    });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', renderMath); else renderMath();
})();

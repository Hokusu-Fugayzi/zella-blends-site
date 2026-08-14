/* ==========================================================================
   ZELLA BLENDS — shop filtering
   The grid ships fully rendered in the HTML; this only hides/shows cards and
   re-runs the stagger. If this file fails to load, every product is still
   visible and clickable.
   ========================================================================== */

(function () {
  const grid = document.getElementById('shop-grid');
  if (!grid) return;

  const cards = Array.from(grid.querySelectorAll('.product-card'));
  const buttons = Array.from(document.querySelectorAll('.filter-btn'));
  const countEl = document.getElementById('filter-count');
  const emptyEl = document.getElementById('shop-empty');
  const total = cards.length;

  const labelFor = key => {
    const btn = buttons.find(b => b.dataset.filter === key);
    if (!btn) return key;
    return btn.textContent.replace(/\d+$/, '').trim();
  };

  function apply(key, { animate = true } = {}) {
    let shown = 0;

    cards.forEach(card => {
      const match = key === 'all' || card.dataset.series === key;
      card.classList.toggle('is-hidden', !match);
      if (match) {
        // Re-index so the stagger cascades across the *visible* set rather
        // than leaving gaps where filtered-out cards used to be.
        card.style.setProperty('--i', shown);
        shown++;
      }
    });

    buttons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.filter === key)));

    if (countEl) {
      countEl.textContent = key === 'all'
        ? `Showing all ${total}`
        : `${shown} of ${total} — ${labelFor(key)}`;
    }
    if (emptyEl) emptyEl.hidden = shown > 0;

    if (animate) {
      // Restart the CSS animation on the newly visible set.
      grid.classList.remove('refiltering');
      void grid.offsetWidth;
      grid.classList.add('refiltering');
    }

    const url = new URL(window.location.href);
    if (key === 'all') url.searchParams.delete('series');
    else url.searchParams.set('series', key);
    history.replaceState(null, '', url);
  }

  buttons.forEach(btn => {
    btn.addEventListener('click', () => apply(btn.dataset.filter));
  });

  // Deep link: /products.html?series=seasonal
  const initial = new URLSearchParams(window.location.search).get('series');
  if (initial && buttons.some(b => b.dataset.filter === initial)) {
    apply(initial, { animate: false });
  }
})();

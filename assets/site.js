/* ==========================================================================
   ZELLA BLENDS — shared site behaviour (cart, modal, nav)
   Visual rebuild: logic preserved from the original single-page build,
   cart now persists across pages via localStorage.
   ========================================================================== */

const PRODUCTS = {
  earth: {
    name: 'Earth Blend', series: 'Elemental Series', img: 'images/earth-blend.webp',
    blend: 'Grounding Blend',
    desc: 'Root into stillness. A grounding alchemy of vetiver, cedarwood, and moss agate for deep earthen stability. This blend anchors scattered energy and reconnects you to the steady pulse of the earth beneath your feet.',
    sizes: [{ label: '5ml Roller', price: 39 }, { label: '10ml Roller', price: 49 }]
  },
  water: {
    name: 'Water Blend', series: 'Elemental Series', img: 'images/water-blend.webp',
    blend: 'Flowing Blend',
    desc: 'Surrender to flow. An intuitive blend of ylang ylang, blue lace agate, and moonstone for emotional clarity. Water washes away what no longer serves, opening channels for deeper feeling and authentic expression.',
    sizes: [{ label: '5ml Roller', price: 39 }, { label: '10ml Roller', price: 49 }]
  },
  fire: {
    name: 'Fire Blend', series: 'Elemental Series', img: 'images/fire-blend.webp',
    blend: 'Igniting Blend',
    desc: "Awaken your flame. A bold fusion of cinnamon, carnelian, and tiger's eye to stoke inner power and passion. Fire ignites your creative force and burns through the barriers that keep you small.",
    sizes: [{ label: '5ml Roller', price: 39 }, { label: '10ml Roller', price: 49 }]
  },
  air: {
    name: 'Air Blend', series: 'Elemental Series', img: 'images/air-blend.webp',
    blend: 'Liberating Blend',
    desc: 'Breathe into expansion. An airy composition of eucalyptus, clear quartz, and angelite for mental clarity. Air lifts the fog of overthinking and opens the mind to new perspectives and possibility.',
    sizes: [{ label: '5ml Roller', price: 39 }, { label: '10ml Roller', price: 49 }]
  },
  'elemental-bundle': {
    name: 'Elemental Series Bundle', series: 'Elemental Series', img: 'images/elemental-bundle.webp',
    blend: 'The Complete Set',
    desc: "All four elements united in one sacred collection. Earth, Water, Fire, and Air — the complete set for those who seek balance across every dimension. Save when you embrace the full spectrum of nature's forces.",
    sizes: [{ label: '5ml Set (4)', price: 119 }, { label: '10ml Set (4)', price: 149 }]
  },
  signature: {
    name: 'Zella Blend', series: 'Signature Series', img: 'images/signature-blend.webp',
    blend: 'The Original Formula',
    desc: 'The original alchemical formula. A harmonious marriage of 7+ carefully selected crystals and 12+ essential oils, designed to elevate your daily ritual into a sacred practice. This is where the Zella journey began.',
    sizes: [{ label: '5ml Roller', price: 39 }, { label: '10ml Roller', price: 49 }]
  },
  'signature-bundle': {
    name: 'Zella Blend Bundle', series: 'Signature Series', img: 'images/signature-bundle.webp',
    blend: 'Four Bottles',
    desc: "Four bottles of the original Zella Blend — for those who've made it part of their daily practice and never want to be without. Share the magic with someone you love, or keep your ritual uninterrupted.",
    sizes: [{ label: '5ml Set (4)', price: 119 }, { label: '10ml Set (4)', price: 149 }]
  },
  'body-oil': {
    name: 'Body + Massage Oil', series: 'Body Oils', img: 'images/body-oil.webp',
    blend: 'Nourish the Temple',
    desc: "A luxurious, deeply nourishing body oil crafted to honor the vessel that carries you through this life. Blended with intention, infused with botanical oils that soften, restore, and awaken the skin's natural radiance. 2oz glass bottle.",
    sizes: [{ label: '2oz Bottle', price: 29 }]
  },
  bespoke: {
    name: 'Bespoke Blend made specifically for you', series: 'Bespoke', img: 'images/signature-blend.webp',
    blend: 'One of One',
    desc: 'A one-of-one alchemical blend hand-composed for your intention. Ingredients chosen during your divination ritual.',
    sizes: [{ label: '10ml Roller', price: 89 }]
  }
};
const BESPOKE_PRICE = 89;
const CART_KEY = 'zella_cart_v1';

let cart = [];
try { cart = JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { cart = []; }
function persistCart() { try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch {} }

let currentProduct = null, selectedSize = 0, qty = 1;

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

/* ---- Product modal ----------------------------------------------------- */
function openProduct(id) {
  const p = PRODUCTS[id];
  if (!p) return;
  currentProduct = id; selectedSize = 0; qty = 1;
  document.getElementById('modal-img').src = p.img;
  document.getElementById('modal-img').alt = p.name;
  document.getElementById('modal-series').textContent = p.series;
  document.getElementById('modal-name').textContent = p.name;
  document.getElementById('modal-desc').textContent = p.desc;
  document.getElementById('modal-qty').textContent = '1';
  renderSizes(p);
  updateModalPrice();
  document.getElementById('product-modal').classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  const m = document.getElementById('product-modal');
  if (m) m.classList.remove('active');
  document.body.style.overflow = '';
}
function renderSizes(p) {
  const c = document.getElementById('size-options');
  c.innerHTML = '';
  p.sizes.forEach((s, i) => {
    const b = document.createElement('button');
    b.className = 'size-option' + (i === 0 ? ' selected' : '');
    b.textContent = s.label;
    b.onclick = () => {
      selectedSize = i;
      c.querySelectorAll('.size-option').forEach(x => x.classList.remove('selected'));
      b.classList.add('selected');
      updateModalPrice();
    };
    c.appendChild(b);
  });
  document.getElementById('modal-sizes').style.display = p.sizes.length > 1 ? 'block' : 'none';
}
function updateModalPrice() {
  const p = PRODUCTS[currentProduct];
  document.getElementById('modal-price').textContent = '$' + p.sizes[selectedSize].price.toFixed(2);
}
function changeQty(d) {
  qty = Math.max(1, qty + d);
  document.getElementById('modal-qty').textContent = qty;
}

/* ---- Cart -------------------------------------------------------------- */
function addToCart() {
  const p = PRODUCTS[currentProduct];
  const size = p.sizes[selectedSize];
  const existing = cart.find(i => i.id === currentProduct && i.sizeIdx === selectedSize);
  if (existing) existing.qty += qty;
  else cart.push({ id: currentProduct, name: p.name, series: p.series, img: p.img, size: size.label, price: size.price, sizeIdx: selectedSize, qty });
  persistCart();
  closeModal();
  updateCartBadge();
  renderCart();
  showToast(p.name + ' added to your ritual');
}
function addProductToCart(id) {
  const p = PRODUCTS[id];
  if (!p) return;
  const existing = cart.find(i => i.id === id && i.sizeIdx === 0);
  if (existing) existing.qty += 1;
  else cart.push({ id, name: p.name, series: p.series, img: p.img, size: p.sizes[0].label, price: p.sizes[0].price, sizeIdx: 0, qty: 1 });
  persistCart();
  updateCartBadge();
  renderCart();
  showToast(p.name + ' added to your ritual');
}
function removeFromCart(i) { cart.splice(i, 1); persistCart(); updateCartBadge(); renderCart(); }
function updateCartBadge() {
  const total = cart.reduce((s, i) => s + i.qty, 0);
  document.querySelectorAll('[data-cart-count]').forEach(el => { el.textContent = '(' + total + ')'; });
}
function getCartTotal() { return cart.reduce((s, i) => s + i.price * i.qty, 0); }
function renderCart() {
  const c = document.getElementById('cart-items');
  if (!c) return;
  if (cart.length === 0) {
    c.innerHTML = '<div class="cart-empty">Your ritual awaits<br><br>Add sacred blends to begin</div>';
  } else {
    c.innerHTML = cart.map((item, i) => {
      const recipe = item.recipe ? `<div class="cart-recipe">For ${escapeHtml(item.recipe.recipientName || 'you')} · "${escapeHtml(item.recipe.blendName || '')}"<br>Stones: ${item.recipe.stones.map(s => escapeHtml(s.name)).join(', ')}<br>Oils: ${item.recipe.oils.map(o => escapeHtml(o.name)).join(', ')}</div>` : '';
      return `<div class="cart-item">
        <img class="cart-item-img" src="${escapeHtml(item.img)}" alt="${escapeHtml(item.name)}">
        <div class="cart-item-info">
          <div class="cart-item-name">${escapeHtml(item.name)}</div>
          <div class="cart-item-meta">${escapeHtml(item.size)} · Qty ${item.qty}</div>
          <div class="cart-item-price">$${(item.price * item.qty).toFixed(2)}</div>
          ${recipe}
        </div>
        <button class="cart-item-remove" onclick="removeFromCart(${i})">Remove</button>
      </div>`;
    }).join('');
  }
  const t = document.getElementById('cart-total');
  if (t) t.textContent = '$' + getCartTotal().toFixed(2);
}
function openCart() {
  renderCart();
  document.getElementById('cart-overlay').classList.add('active');
  document.getElementById('cart-drawer').classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeCart() {
  document.getElementById('cart-overlay').classList.remove('active');
  document.getElementById('cart-drawer').classList.remove('active');
  document.body.style.overflow = '';
}
function demoCheckout() {
  if (cart.length === 0) { showToast('Your cart is empty'); return; }
  const total = getCartTotal().toFixed(2);
  cart = []; persistCart();
  updateCartBadge(); renderCart(); closeCart();
  showToast('Order placed · $' + total + ' (Demo)');
}

/* ---- Toast ------------------------------------------------------------- */
let toastTimer = null;
function showToast(msg) {
  let t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}

/* ---- Nav / reveal ------------------------------------------------------ */
function toggleMobileNav(open) {
  const m = document.querySelector('.mobile-nav');
  if (m) m.classList.toggle('open', open);
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeModal(); closeCart(); toggleMobileNav(false); }
});

document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  renderCart();
  const reveals = document.querySelectorAll('.reveal');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || typeof IntersectionObserver !== 'function') {
    reveals.forEach(el => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0, rootMargin: '0px 0px -10% 0px' });
    reveals.forEach(el => io.observe(el));
    // Failsafe: never let content stay hidden if the observer misbehaves.
    setTimeout(() => reveals.forEach(el => el.classList.add('in')), 2500);
  }
});

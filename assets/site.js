/* ==========================================================================
   ZELLA BLENDS — shared site behaviour (cart, modal, nav)
   Visual rebuild: logic preserved from the original single-page build,
   cart now persists across pages via localStorage.
   ========================================================================== */

/* Product copy is taken VERBATIM from the live Square catalog behind
   zellablends.com. If a description changes there, change it here too —
   do not paraphrase. */
const PRODUCTS = {
  earth: {
    name: "Earth Blend", series: "Elemental Series", img: "images/earth-blend.webp",
    blend: "Grounding Blend",
    desc: "A grounding fusion of nature's finest essences. Immerse yourself in the rich, earthly scents of sandalwood, patchouli, cedarwood, and vanilla essential oils with the warm, clean base of amber carrier oil. This proprietary blend is meticulously crafted to evoke the stability and strength of the earth element, offering a serene and balanced aromatic experience. Perfect for those seeking grounding energy, meditation, or simply a moment of tranquility in the midst of life's whirlwind. Embrace the grounding power of nature with the Earth Blend.",
    sizes: [{ label: "8ml Roller", price: 39 }, { label: "10ml Roller", price: 49 }]
  },
  water: {
    name: "Water Blend", series: "Elemental Series", img: "images/water-blend.webp",
    blend: "Flowing Blend",
    desc: "Dive into tranquility with Zella's Water Blend \u2013 a captivating fusion of soothing scents inspired by the fluidity of the water element. Immerse yourself in the gentle embrace of lotus, violet, sea salt, orange, bergamot, sandalwood, and coconut essential oils with the warm, clean base of amber carrier oil. This carefully curated blend is designed to evoke a sense of enlightenment, introspection, and emotional balance. Experience the serene and renewing essence of water. Transform your space into a peaceful aromatic oasis and let the waves of peace wash over you.",
    sizes: [{ label: "8ml Roller", price: 39 }, { label: "10ml Roller", price: 49 }]
  },
  fire: {
    name: "Fire Blend", series: "Elemental Series", img: "images/fire-blend.webp",
    blend: "Igniting Blend",
    desc: "A spicy fusion of energizing scents that embody the passionate, joyful spirit of fire. Wrap yourself in the cozy aroma of cinnamon, bergamot, peppermint, all spice, and vibrant citrus essential oils with a warm, clean base of amber carrier oil. Ignite your senses and embrace your elemental power with this carefully crafted blend, designed to kindle passion and vitality.",
    sizes: [{ label: "8ml Roller", price: 39 }, { label: "10ml Roller", price: 49 }]
  },
  air: {
    name: "Air Blend", series: "Elemental Series", img: "images/air-blend.webp",
    blend: "Liberating Blend",
    desc: "A breath of fresh air in every drop. Elevate your senses with this carefully crafted fusion of eucalyptus, lavender, violet, lemon, neroli, ylang ylang, and spearmint essential oils with a warm, clean base of amber carrier oil. Zella's proprietary blend captures the essence of the air element, creating an atmosphere of clarity, inspiration, and lightness. Perfect for moments of meditation, creative endeavors, or whenever you crave a revitalizing burst of freshness. Immerse yourself in the airy symphony of the Air Blend, and let the winds of positive energy carry you to new heights.",
    sizes: [{ label: "8ml Roller", price: 39 }, { label: "10ml Roller", price: 49 }]
  },
  "elemental-bundle": {
    name: "Elemental Series Bundle", series: "Elemental Series", img: "images/elemental-bundle.webp",
    blend: "The Complete Set",
    desc: "Indulge in the complete Elemental Series Bundle \u2013 a versatile collection perfect for any occasion.",
    sizes: [{ label: "8ml Set (4)", price: 119 }, { label: "10ml Set (4)", price: 149 }]
  },
  signature: {
    name: "Zella Blend", series: "Signature Series", img: "images/signature-blend.webp",
    blend: "The Original Formula",
    desc: "Introducing Zella's Signature Blend - a custom blend developed by and named after our founder herself! A harmonious oil blend crafted for the adventurous souls born under the sign of the Archer. Immerse yourself in the energetic fusion of uplifting citrus, peppermint, lavender, patchouli, basil essential oils with a warm, clean base of amber oil encapsulating the dynamic and optimistic nature of Sagittarius. The Zella Blend is designed to amplify the free-spirited essence of our beloved Sagittarians, promoting positivity, curiosity, and a sense of exploration. We invite you to embrace your divine energy and shoot for the stars with boundless enthusiasm. Adventure awaits with every drop.",
    sizes: [{ label: "8ml Roller", price: 39 }, { label: "10ml Roller", price: 49 }]
  },
  "signature-bundle": {
    name: "Zella Blend Bundle", series: "Signature Series", img: "images/signature-bundle.webp",
    blend: "Four Bottles",
    desc: "Four bottles of the original Zella Blend \u2014 the Signature Series in a set.",
    sizes: [{ label: "8ml Set (4)", price: 119 }, { label: "10ml Set (4)", price: 149 }]
  },
  "body-oil": {
    name: "Body + Massage Oil", series: "Body & Home", img: "images/body-oil.webp",
    blend: "Nourish the Temple",
    desc: "Nourish, hydrate, and protect your skin barrier with Zella's BODY + MASSAGE OIL. This luxurious blend of natural oils is hand-crafted with the finest ingredients, including jojoba oil, Vitamin E, coconut oil, olive oil, and argan oil.",
    sizes: [{ label: "2oz Bottle", price: 29 }]
  },
  spray: {
    name: "Zella Spray", series: "Body & Home", img: "",
    blend: "Room \u00b7 Body \u00b7 Linen",
    desc: "Experience a touch of luxury with Zella's refreshing Spray. Perfect as a refreshing room spray, body spray, or linen spray to accent your space.",
    sizes: [{ label: "2oz Spray", price: 18 }]
  },
  diffuser: {
    name: "Custom Diffuser Oil", series: "Body & Home", img: "",
    blend: "Made to Order",
    desc: "A custom diffuser oil, made to order in two sizes.",
    sizes: [{ label: "Small", price: 29 }, { label: "Large", price: 39 }]
  },
  halloween: {
    name: "Halloween Potion", series: "Seasonal", img: "images/halloween-potion.jpg",
    blend: "Enchanted Potion",
    desc: "This enchanted potion is a blend of woodsy and spicy oils to get you in the spooky Halloween spirit! Infused with patchouli, vanilla, agarwood, sandalwood, hinoki, clove, and cinnamon.",
    sizes: [{ label: "8ml Roller", price: 18 }, { label: "10ml Roller", price: 23 }, { label: "2oz Spray", price: 18 }]
  },
  yuletide: {
    name: "Yuletide Spice Spray", series: "Seasonal", img: "images/yuletide-spray.jpg",
    blend: "Warm Spice",
    desc: "Yuletide Spice Spray \u2014 a 2 oz room, body, and linen spray for the season.",
    sizes: [{ label: "2oz Spray", price: 18 }]
  },
  "spiced-fir": {
    name: "Spiced Fir Spray", series: "Seasonal", img: "images/spiced-fir-spray.jpg",
    blend: "Evergreen & Spice",
    desc: "Spiced Fir Spray \u2014 2 oz.",
    sizes: [{ label: "2oz Spray", price: 18 }]
  },
  experience: {
    name: "The Zella Experience", series: "Create", img: "images/zella-experience.jpg",
    blend: "In Person, By Appointment",
    desc: "Reserve your time with Zella herself. She will guide you through a casual conversation and curate a custom 10 ml blend unique to Y O U in this time and space.",
    sizes: [{ label: "The Experience", price: 100 }, { label: "Extended", price: 150 }]
  },
  circle: {
    name: "The Circle", series: "Subscription", img: "",
    blend: "Monthly Gathering",
    desc: "A bundle of blends and sprays at your door each month, chosen for the season by the apothecary. Shipping included. Cancel anytime.",
    recurring: true,
    sizes: [{ label: "Monthly", price: 49.99 }]
  },
  bespoke: {
    name: "Custom Blend made specifically for you", series: "Create", img: "images/signature-blend.webp",
    blend: "One of One",
    desc: "A one-of-one blend hand-composed for your intention. Stones and oils chosen from the answers you gave.",
    sizes: [{ label: "10ml Roller", price: 89 }]
  }
};
const BESPOKE_PRICE = 89;
/* Subscribe-and-save on individual blends. One number, one place —
   change this to change every "every month" price on the site. */
const SUBSCRIBE_DISCOUNT = 0.10;
function subscribePrice(price) {
  return Math.round(price * (1 - SUBSCRIBE_DISCOUNT) * 100) / 100;
}
/* Monthly purchases (The Circle, subscribe-and-save) need Square subscription
   plans and their own checkout. Until those exist this stays false: the
   "Every month" option is hidden and nothing recurring can reach the bag. */
const SUBSCRIPTIONS_ENABLED = false;
const CART_KEY = 'zella_cart_v1';

let cart = [];
try { cart = JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { cart = []; }
if (!SUBSCRIPTIONS_ENABLED) cart = cart.filter(i => !i.recurring && i.id !== 'circle');
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
  openAdded(p.name, size.label + ' · Qty ' + qty);
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
  openAdded(p.name, p.sizes[0].label + ' · Qty 1');
}
function removeFromCart(i) { cart.splice(i, 1); persistCart(); updateCartBadge(); renderCart(); }
function changeCartQty(i, d) {
  const item = cart[i];
  if (!item) return;
  item.qty += d;
  if (item.qty < 1) cart.splice(i, 1);
  persistCart(); updateCartBadge(); renderCart();
}
function updateCartBadge() {
  const total = cart.reduce((s, i) => s + i.qty, 0);
  document.querySelectorAll('[data-cart-count]').forEach(el => { el.textContent = '(' + total + ')'; });
}
function getCartTotal() { return cart.reduce((s, i) => s + i.price * i.qty, 0); }
function renderCart() {
  const c = document.getElementById('cart-items');
  if (!c) return;
  if (cart.length === 0) {
    c.innerHTML = '<div class="cart-empty">Your ritual awaits<br><br>Add a blend to begin</div>';
  } else {
    c.innerHTML = cart.map((item, i) => {
      const recipe = item.recipe ? `<div class="cart-recipe">For ${escapeHtml(item.recipe.recipientName || 'you')} · "${escapeHtml(item.recipe.blendName || '')}"<br>Stones: ${item.recipe.stones.map(s => escapeHtml(s.name)).join(', ')}<br>Oils: ${item.recipe.oils.map(o => escapeHtml(o.name)).join(', ')}</div>` : '';
      return `<div class="cart-item">
        ${item.img
          ? `<img class="cart-item-img" src="${escapeHtml(item.img)}" alt="${escapeHtml(item.name)}">`
          : `<div class="cart-item-img plate" style="margin:0;aspect-ratio:1/1;"><span class="sub">Zella</span></div>`}
        <div class="cart-item-info">
          <div class="cart-item-name">${escapeHtml(item.name)}</div>
          <div class="cart-item-meta">${item.metaLine
            ? escapeHtml(item.metaLine)
            : escapeHtml(item.size)}</div>
          <div class="cart-item-price">$${(item.price * item.qty).toFixed(2)}${item.recurring ? ' / mo' : ''}</div>
          ${item.recipe || item.recurring ? '' : `<div class="cart-qty">
            <button onclick="changeCartQty(${i}, -1)" aria-label="One fewer">&minus;</button>
            <span>${item.qty}</span>
            <button onclick="changeCartQty(${i}, 1)" aria-label="One more">+</button>
          </div>`}
          ${recipe}
        </div>
        <button class="cart-item-remove" onclick="removeFromCart(${i})">Remove</button>
      </div>`;
    }).join('');
  }
  const t = document.getElementById('cart-total');
  if (t) t.textContent = '$' + getCartTotal().toFixed(2);

  // A bag holding both one-off bottles and monthly lines needs to say so —
  // otherwise the subtotal reads as a single charge.
  const note = document.querySelector('.cart-note');
  if (note) {
    const monthly = cart
      .filter(i => i.recurring)
      .reduce((sum, i) => sum + i.price * i.qty, 0);
    note.textContent = monthly > 0
      ? 'Includes $' + monthly.toFixed(2) + ' billed monthly · cancel anytime'
      : 'Secure checkout by Square';
  }
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
async function checkout() {
  if (cart.length === 0) { showToast('Your bag is empty'); return; }
  const btns = Array.from(document.querySelectorAll('.checkout-btn'));
  const labels = btns.map(b => b.textContent);
  btns.forEach(b => { b.disabled = true; b.textContent = 'Opening secure checkout'; });
  try {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: cart.map(i => ({
          id: i.id, sizeIdx: i.sizeIdx, qty: i.qty,
          recurring: !!i.recurring, recipe: i.recipe
        }))
      })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.url) throw new Error(data.error || 'Checkout failed');
    window.location.href = data.url;
  } catch (e) {
    btns.forEach((b, i) => { b.disabled = false; b.textContent = labels[i]; });
    showToast('Checkout is unavailable right now');
  }
}

/* ---- Added-to-bag prompt ----------------------------------------------- */
function openAdded(name, meta) {
  let o = document.getElementById('added-overlay');
  if (!o) {
    o = document.createElement('div');
    o.id = 'added-overlay';
    o.className = 'added-overlay';
    o.innerHTML = `<div class="added-box" role="dialog" aria-modal="true" aria-labelledby="added-name">
      <span class="eyebrow">Added to your ritual</span>
      <h3 id="added-name"></h3>
      <p class="added-meta" id="added-meta"></p>
      <button class="checkout-btn" onclick="checkout()">Checkout Now</button>
      <button class="added-keep" onclick="closeAdded()">Keep Shopping</button>
      <button class="added-view" onclick="closeAdded();openCart()">View bag</button>
    </div>`;
    o.addEventListener('click', e => { if (e.target === o) closeAdded(); });
    document.body.appendChild(o);
    void o.offsetWidth;
  }
  document.getElementById('added-name').textContent = name;
  document.getElementById('added-meta').textContent =
    meta + ' · Bag subtotal $' + getCartTotal().toFixed(2);
  o.classList.add('active');
}
function closeAdded() {
  const o = document.getElementById('added-overlay');
  if (o) o.classList.remove('active');
}

/* ---- Live prices from Square ------------------------------------------- */
/* Checkout always charges the Square catalog price. This keeps what the
   page shows in step with it; if the call fails the built-in prices stand. */
fetch('/api/catalog').then(r => (r.ok ? r.json() : null)).then(data => {
  if (!data || !data.prices) return;
  Object.entries(data.prices).forEach(([id, list]) => {
    const p = PRODUCTS[id];
    if (!p) return;
    list.forEach((price, i) => { if (price != null && p.sizes[i]) p.sizes[i].price = price; });
  });
  cart.forEach(item => {
    const p = PRODUCTS[item.id];
    if (p && !item.recurring && p.sizes[item.sizeIdx]) item.price = p.sizes[item.sizeIdx].price;
  });
  persistCart();
  renderCart();
  document.dispatchEvent(new CustomEvent('zella:prices'));
}).catch(() => {});

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
  if (e.key === 'Escape') { closeModal(); closeCart(); closeAdded(); toggleMobileNav(false); }
});

document.addEventListener('DOMContentLoaded', () => {
  // Returning from Square checkout: the order is placed, so empty the bag.
  if (new URLSearchParams(window.location.search).get('order') === 'complete') {
    cart = []; persistCart();
    history.replaceState(null, '', window.location.pathname);
    showToast('Thank you — your order is confirmed');
  }
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

/* ---- The Circle (subscription) ----------------------------------------- */
function joinCircle() {
  if (!SUBSCRIPTIONS_ENABLED) {
    showToast('The Circle opens soon — write to us to save your place');
    window.location.href = 'mailto:info@ZellaBlends.com?subject=' +
      encodeURIComponent('Save my place in The Circle');
    return;
  }
  const p = PRODUCTS.circle;
  if (cart.some(i => i.id === 'circle')) {
    showToast('The Circle is already in your bag');
    openCart();
    return;
  }
  cart.push({
    id: 'circle', name: p.name, series: p.series, img: p.img,
    size: p.sizes[0].label, price: p.sizes[0].price,
    sizeIdx: 0, qty: 1, recurring: true,
    metaLine: 'Every month · cancel anytime'
  });
  persistCart();
  updateCartBadge();
  renderCart();
  openCart();
  showToast('The Circle added — $49.99 a month');
}

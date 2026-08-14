/* ==========================================================================
   ZELLA BLENDS — Bespoke blend wizard
   Logic preserved from the original build; restyled to the new system.
   ========================================================================== */

function sunSignForDate(isoDate) {
  if (!isoDate || !/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return '';
  const [, mStr, dStr] = isoDate.split('-');
  const m = parseInt(mStr, 10), d = parseInt(dStr, 10);
  const signs = [
    ['Capricorn', 1, 1, 1, 19], ['Aquarius', 1, 20, 2, 18], ['Pisces', 2, 19, 3, 20],
    ['Aries', 3, 21, 4, 19], ['Taurus', 4, 20, 5, 20], ['Gemini', 5, 21, 6, 20],
    ['Cancer', 6, 21, 7, 22], ['Leo', 7, 23, 8, 22], ['Virgo', 8, 23, 9, 22],
    ['Libra', 9, 23, 10, 22], ['Scorpio', 10, 23, 11, 21], ['Sagittarius', 11, 22, 12, 21],
    ['Capricorn', 12, 22, 12, 31]
  ];
  for (const [name, m1, d1, m2, d2] of signs) {
    if ((m === m1 && d >= d1) || (m === m2 && d <= d2)) return name;
  }
  return '';
}

const wizardSteps = [
  {
    id: 'welcome',
    render: () => `
      <div class="wizard-step active" style="text-align:center;">
        <p class="wizard-eyebrow">An Invitation</p>
        <h3 class="wizard-question">Let's compose a blend <em>made for you alone</em></h3>
        <p class="wizard-helper">A handful of gentle questions about who you are and what you're calling in. Tab will compose a one-of-one blend from Zella's library of stones and sacred oils.</p>
        <div style="text-align:center;margin-top:1.5rem;">
          <button class="wizard-next" onclick="wizardNext()">Begin</button>
        </div>
      </div>`
  },
  {
    id: 'birth', eyebrow: 'Birth',
    question: 'When did you <em>arrive</em>?',
    helper: 'The sky was holding a particular weather the day you arrived. Tab will listen to it.',
    render(ctx) {
      return `
        <div class="wizard-field">
          <label class="wizard-label">Birth date</label>
          <input class="wizard-input" id="q-birthdate" type="date" oninput="wizardLiveCapture()" max="${new Date().toISOString().slice(0, 10)}" value="${escapeHtml(ctx.answers.birthdate || '')}">
          <div id="q-sign-readout" style="margin-top:0.7rem;font-family:var(--serif);font-style:italic;color:var(--accent);font-size:1rem;min-height:1.4em;">${ctx.answers.sunSign ? `Sun in ${ctx.answers.sunSign}` : ''}</div>
        </div>
        <div class="wizard-field">
          <label class="wizard-label">Birth time <span style="opacity:0.5;text-transform:none;letter-spacing:0;">(optional — for deeper resonance)</span></label>
          <input class="wizard-input" id="q-birthtime" type="time" oninput="wizardLiveCapture()" value="${escapeHtml(ctx.answers.birthTime || '')}">
        </div>
        <div class="wizard-field">
          <label class="wizard-label">Birth place <span style="opacity:0.5;text-transform:none;letter-spacing:0;">(optional)</span></label>
          <input class="wizard-input" id="q-birthplace" type="text" oninput="wizardLiveCapture()" placeholder="City, Country" maxlength="80" value="${escapeHtml(ctx.answers.birthPlace || '')}">
        </div>`;
    },
    validate(ctx) { return !!(ctx.answers.birthdate && /^\d{4}-\d{2}-\d{2}$/.test(ctx.answers.birthdate)); },
    capture(ctx) {
      ctx.answers.birthdate = document.getElementById('q-birthdate').value;
      ctx.answers.birthTime = document.getElementById('q-birthtime').value;
      ctx.answers.birthPlace = document.getElementById('q-birthplace').value.trim();
      ctx.answers.sunSign = sunSignForDate(ctx.answers.birthdate);
      const readout = document.getElementById('q-sign-readout');
      if (readout) readout.textContent = ctx.answers.sunSign ? `Sun in ${ctx.answers.sunSign}` : '';
    }
  },
  {
    id: 'intention', eyebrow: 'Intention',
    question: 'What are you <em>calling in</em>?',
    helper: 'A word, a feeling, a season of life. There are no wrong answers.',
    render(ctx) {
      return `<textarea class="wizard-textarea" id="q-intention" oninput="wizardLiveCapture()" placeholder="More softness. Courage to begin. To feel like myself again..." maxlength="400">${escapeHtml(ctx.answers.intention || '')}</textarea>`;
    },
    validate(ctx) { return (ctx.answers.intention || '').trim().length > 2; },
    capture(ctx) { ctx.answers.intention = document.getElementById('q-intention').value.trim(); }
  },
  {
    id: 'essence', eyebrow: 'Essence',
    question: 'Which essence <em>moves through you</em> most these days?',
    helper: 'Choose the one that feels closest — not the one you wish were true.',
    type: 'options', key: 'essence',
    options: [
      { value: 'seeker', title: 'The Seeker', desc: 'Curious, restless, in pursuit of meaning.' },
      { value: 'sovereign', title: 'The Sovereign', desc: 'Self-led, steady, sure of your own ground.' },
      { value: 'healer', title: 'The Healer', desc: 'Tender, nurturing, attuned to others and the unseen.' },
      { value: 'wild', title: 'The Wild One', desc: 'Untamed, sensual, alive in your body.' },
      { value: 'mystic', title: 'The Mystic', desc: 'Intuitive, dreamy, of two worlds at once.' },
      { value: 'builder', title: 'The Builder', desc: 'Steady, devoted, making something that lasts.' }
    ]
  },
  {
    id: 'element', eyebrow: 'Element',
    question: 'Which element <em>pulls at you</em> right now?',
    helper: 'Trust the first one that flickers.',
    type: 'options', key: 'element',
    options: [
      { value: 'earth', title: 'Earth', desc: 'I need grounding, steadiness, to come home to my body.' },
      { value: 'water', title: 'Water', desc: 'I need to feel, to flow, to let something move through me.' },
      { value: 'fire', title: 'Fire', desc: 'I need ignition, courage, the heat to begin.' },
      { value: 'air', title: 'Air', desc: 'I need clarity, lift, room to think and breathe.' }
    ]
  },
  {
    id: 'release', eyebrow: 'Release',
    question: 'What are you ready to <em>release</em>?',
    helper: 'Choose any that resonate. Up to four.',
    type: 'chips', key: 'release', max: 4,
    options: ['anxiety', 'self-doubt', 'grief', 'burnout', 'stagnation', 'old stories', 'heaviness', 'resentment', 'people-pleasing', 'fear of being seen', 'overthinking', 'shame']
  },
  {
    id: 'amplify', eyebrow: 'Amplify',
    question: 'And what do you wish to <em>amplify</em>?',
    helper: 'Up to four.',
    type: 'chips', key: 'amplify', max: 4,
    options: ['clarity', 'courage', 'softness', 'pleasure', 'abundance', 'creativity', 'grounding', 'presence', 'intuition', 'magnetism', 'devotion', 'play']
  },
  {
    id: 'fear', eyebrow: 'Whisper',
    question: 'What is the fear that <em>quietly shapes</em> you?',
    helper: 'Optional. The truer you are here, the truer the blend.',
    render(ctx) {
      return `<textarea class="wizard-textarea" id="q-fear" oninput="wizardLiveCapture()" placeholder="That I'll be left behind. That I'm too much. That nothing I make will matter..." maxlength="300">${escapeHtml(ctx.answers.fear || '')}</textarea>`;
    },
    validate() { return true; },
    capture(ctx) { ctx.answers.fear = document.getElementById('q-fear').value.trim(); }
  },
  {
    id: 'joy', eyebrow: 'Joy',
    question: 'When do you feel <em>most yourself</em>?',
    helper: 'A specific moment, a sense, a season — whatever rises.',
    render(ctx) {
      return `<textarea class="wizard-textarea" id="q-joy" oninput="wizardLiveCapture()" placeholder="Slow mornings. Dancing alone in the kitchen. The hour before sleep..." maxlength="300">${escapeHtml(ctx.answers.joy || '')}</textarea>`;
    },
    validate() { return true; },
    capture(ctx) { ctx.answers.joy = document.getElementById('q-joy').value.trim(); }
  },
  {
    id: 'moment', eyebrow: 'Ritual',
    question: 'When will this blend <em>meet you</em>?',
    helper: 'Where it lives shapes how it sings.',
    type: 'options', key: 'moment',
    options: [
      { value: 'morning', title: 'Morning', desc: 'A pulse-point ritual to begin the day.' },
      { value: 'evening', title: 'Evening', desc: 'To soften the edges, before sleep.' },
      { value: 'altar', title: 'At the Altar', desc: 'For meditation, journaling, sacred space.' },
      { value: 'throughout', title: 'Throughout the Day', desc: 'Carried with me, returned to often.' }
    ]
  },
  {
    id: 'scent', eyebrow: 'Scent',
    question: 'Your nose leans toward...',
    helper: "There's no wrong path — Tab will weave around you.",
    type: 'options', key: 'scent',
    options: [
      { value: 'earthy', title: 'Earthy + Grounding', desc: 'Vetiver, oakmoss, sandalwood, patchouli.' },
      { value: 'bright', title: 'Bright + Citrus', desc: 'Bergamot, sweet orange, neroli, grapefruit.' },
      { value: 'floral', title: 'Floral + Soft', desc: 'Rose, jasmine, ylang ylang, geranium.' },
      { value: 'smoky', title: 'Smoky + Resinous', desc: 'Frankincense, myrrh, palo santo, cedar.' },
      { value: 'herbal', title: 'Herbal + Green', desc: 'Clary sage, rosemary, lavender, eucalyptus.' },
      { value: 'trust', title: 'Let the Apothecary Choose', desc: 'I trust the hands that make it.' }
    ]
  },
  {
    id: 'identity', eyebrow: 'Final',
    question: 'Who shall this blend <em>be made for</em>?',
    helper: 'Your name will be inscribed on the bottle.',
    render(ctx) {
      return `
        <div class="wizard-field">
          <label class="wizard-label">First name</label>
          <input class="wizard-input" id="q-name" type="text" oninput="wizardLiveCapture()" placeholder="Your name" maxlength="60" value="${escapeHtml(ctx.answers.name || '')}">
        </div>
        <div class="wizard-field">
          <label class="wizard-label">Email <span style="opacity:0.5;text-transform:none;letter-spacing:0;">(optional, so we can send your recipe)</span></label>
          <input class="wizard-input" id="q-email" type="email" oninput="wizardLiveCapture()" placeholder="you@somewhere.com" value="${escapeHtml(ctx.answers.email || '')}">
        </div>`;
    },
    validate() {
      const name = document.getElementById('q-name')?.value.trim() || '';
      return name.length >= 1;
    },
    capture(ctx) {
      ctx.answers.name = document.getElementById('q-name').value.trim();
      ctx.answers.email = document.getElementById('q-email').value.trim();
    }
  }
];

const wizardCtx = {
  step: 0,
  answers: {
    birthdate: '', birthTime: '', birthPlace: '', sunSign: '',
    intention: '', essence: '', element: '', release: [], amplify: [],
    fear: '', joy: '', moment: '', scent: '', name: '', email: ''
  },
  result: null, loading: false, error: null
};

function renderWizard() {
  const isResult = wizardCtx.result !== null;
  const isLoading = wizardCtx.loading;

  const dotsHtml = wizardSteps.slice(1).map((_, i) => {
    const stepIdx = i + 1;
    let cls = 'wizard-dot';
    if (stepIdx < wizardCtx.step) cls += ' done';
    else if (stepIdx === wizardCtx.step) cls += ' active';
    return `<div class="${cls}"></div>`;
  }).join('');
  document.getElementById('wizard-progress').innerHTML = (isResult || isLoading) ? '' : dotsHtml;

  const body = document.getElementById('wizard-body');

  if (isLoading) {
    body.innerHTML = `
      <div class="wizard-divining">
        <div class="divining-orb"></div>
        <div class="divining-text" id="divining-text">Consulting the stones</div>
      </div>`;
    cycleDiviningText();
    return;
  }

  if (isResult) { body.innerHTML = renderResult(wizardCtx.result); return; }

  const step = wizardSteps[wizardCtx.step];
  let inner;
  if (step.render) {
    if (wizardCtx.step === 0) { body.innerHTML = step.render(wizardCtx); return; }
    inner = step.render(wizardCtx);
  } else if (step.type === 'options') {
    const selected = wizardCtx.answers[step.key];
    inner = `<div class="wizard-options">${step.options.map(o => `
      <button class="wizard-option ${selected === o.value ? 'selected' : ''}" data-value="${escapeHtml(o.value)}" onclick="wizardSelectOption('${step.key}', '${escapeHtml(o.value)}')">
        <span class="wizard-option-title">${escapeHtml(o.title)}</span>
        <span class="wizard-option-desc">${escapeHtml(o.desc)}</span>
      </button>`).join('')}</div>`;
  } else if (step.type === 'chips') {
    const selected = wizardCtx.answers[step.key] || [];
    inner = `<div class="wizard-chips">${step.options.map(o => `
      <button class="wizard-chip ${selected.includes(o) ? 'selected' : ''}" onclick="wizardToggleChip('${step.key}', '${escapeHtml(o)}', ${step.max})">${escapeHtml(o)}</button>
    `).join('')}</div>
    <p class="wizard-chip-hint">Choose up to ${step.max}</p>`;
  }

  const errorHtml = wizardCtx.error ? `<div class="wizard-error">${escapeHtml(wizardCtx.error)}</div>` : '';
  const isLast = wizardCtx.step === wizardSteps.length - 1;
  const canAdvance = stepIsValid();

  body.innerHTML = `
    <div class="wizard-step active">
      <p class="wizard-eyebrow">${escapeHtml(step.eyebrow)}</p>
      <h3 class="wizard-question">${step.question}</h3>
      ${step.helper ? `<p class="wizard-helper">${step.helper}</p>` : ''}
      ${inner}
      ${errorHtml}
      <div class="wizard-nav">
        <button class="wizard-back" onclick="wizardBack()" ${wizardCtx.step <= 1 ? 'disabled' : ''}>&larr; Back</button>
        <button class="wizard-next" onclick="wizardNext()" ${canAdvance ? '' : 'disabled'}>${isLast ? 'Compose My Blend' : 'Continue'}</button>
      </div>
    </div>`;
}

function wizardLiveCapture() {
  const step = wizardSteps[wizardCtx.step];
  if (step.capture) { try { step.capture(wizardCtx); } catch {} }
  const nextBtn = document.querySelector('#wizard-body .wizard-next');
  if (nextBtn) nextBtn.disabled = !stepIsValid();
}

function stepIsValid() {
  const step = wizardSteps[wizardCtx.step];
  if (step.validate) { try { return step.validate(wizardCtx); } catch { return false; } }
  if (step.type === 'options') return !!wizardCtx.answers[step.key];
  if (step.type === 'chips') return (wizardCtx.answers[step.key] || []).length > 0;
  return true;
}

function wizardSelectOption(key, value) { wizardCtx.answers[key] = value; renderWizard(); }

function wizardToggleChip(key, value, max) {
  const arr = wizardCtx.answers[key] || [];
  const idx = arr.indexOf(value);
  if (idx >= 0) arr.splice(idx, 1);
  else if (arr.length < max) arr.push(value);
  wizardCtx.answers[key] = arr;
  renderWizard();
}

function wizardBack() {
  if (wizardCtx.step <= 0) return;
  wizardCtx.step -= 1;
  wizardCtx.error = null;
  renderWizard();
}

async function wizardNext() {
  const step = wizardSteps[wizardCtx.step];
  if (step.capture) { try { step.capture(wizardCtx); } catch {} }
  if (!stepIsValid()) { renderWizard(); return; }
  wizardCtx.error = null;
  if (wizardCtx.step === wizardSteps.length - 1) { await submitWizard(); return; }
  wizardCtx.step += 1;
  renderWizard();
}

async function submitWizard() {
  wizardCtx.loading = true;
  renderWizard();
  try {
    const res = await fetch('/api/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(wizardCtx.answers)
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`The apothecary is unreachable (${res.status}). ${txt.slice(0, 140)}`);
    }
    const data = await res.json();
    if (!data || !data.blendName) throw new Error('The blend came back empty. Please try again.');
    wizardCtx.result = data;
  } catch (e) {
    wizardCtx.error = e.message || 'Something interrupted the composing.';
    wizardCtx.loading = false;
    renderWizard();
    return;
  }
  wizardCtx.loading = false;
  renderWizard();
}

let diviningTimer = null;
const diviningPhrases = ['Consulting the stones', 'Listening for your intention', 'Reading the elements', 'Composing your blend'];
function cycleDiviningText() {
  clearInterval(diviningTimer);
  let i = 0;
  diviningTimer = setInterval(() => {
    const el = document.getElementById('divining-text');
    if (!el) { clearInterval(diviningTimer); return; }
    i = (i + 1) % diviningPhrases.length;
    el.textContent = diviningPhrases[i];
  }, 1800);
}

function renderResult(r) {
  const stones = (r.stones || []).map(s => `
    <div class="result-ingredient">
      <div class="result-ingredient-name">${escapeHtml(s.name)}</div>
      <div class="result-ingredient-why">${escapeHtml(s.why)}</div>
    </div>`).join('');
  const oils = (r.oils || []).map(o => `
    <div class="result-ingredient">
      <div class="result-ingredient-name">${escapeHtml(o.name)}</div>
      <div class="result-ingredient-why">${escapeHtml(o.why)}</div>
    </div>`).join('');
  const ritualHtml = r.ritual ? `
    <div class="result-ritual">
      <div class="result-ritual-label">A Ritual</div>
      <div class="result-ritual-text">${escapeHtml(r.ritual)}</div>
    </div>` : '';
  return `
    <div class="wizard-result">
      <p class="result-eyebrow">Your Bespoke Blend</p>
      <h3 class="result-name">${escapeHtml(r.blendName)}</h3>
      <p class="result-for">For ${escapeHtml(wizardCtx.answers.name || 'you')}</p>
      <p class="result-description">${escapeHtml(r.description || '')}</p>
      ${ritualHtml}
      <div class="result-section">
        <div class="result-section-label">Stones &amp; Crystals</div>
        ${stones}
      </div>
      <div class="result-section">
        <div class="result-section-label">Oils &amp; Botanicals</div>
        ${oils}
      </div>
      <div class="result-actions">
        <button class="result-claim" onclick="claimBespoke()">Claim Your Blend · $${BESPOKE_PRICE.toFixed(0)}</button>
        <button class="result-retry" onclick="retryWizard()">Begin again</button>
      </div>
    </div>`;
}

function retryWizard() {
  wizardCtx.step = 1;
  wizardCtx.result = null;
  wizardCtx.error = null;
  renderWizard();
}

function claimBespoke() {
  const r = wizardCtx.result;
  if (!r) return;
  const p = PRODUCTS.bespoke;
  const recipe = {
    blendName: r.blendName,
    recipientName: wizardCtx.answers.name,
    recipientEmail: wizardCtx.answers.email,
    intention: wizardCtx.answers.intention,
    stones: r.stones, oils: r.oils,
    description: r.description, ritual: r.ritual,
    quizAnswers: wizardCtx.answers,
    createdAt: new Date().toISOString()
  };
  cart.push({
    id: 'bespoke-' + Date.now(),
    name: `${r.blendName} (Bespoke Blend)`,
    series: 'Bespoke', img: p.img,
    size: p.sizes[0].label, price: BESPOKE_PRICE,
    sizeIdx: 0, qty: 1, recipe
  });
  persistCart();
  updateCartBadge();
  renderCart();
  openCart();
  showToast('Your bespoke blend has been added');
}

document.addEventListener('DOMContentLoaded', renderWizard);

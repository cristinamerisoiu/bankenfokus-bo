// BankenFokus-Assistent – static, zero-backend, robust init + real buttons.

// ---------- CONFIG ----------
const PDF_URL     = "https://gannaca.de/hubfs/K%C3%BCnstliche%20Intelligenz%20veraendert%20alles%20%20wie%20begegnen%20Sie%20dem%20Wandel.pdf?hsLang=de-de"; // put real link if you have it
const MEETING_URL = "https://meetings.hubspot.com/peterka/erstes-kennenlernen-i-first-meeting-";
const LP_URL      = "https://gannaca.de/genossenschaftsbanken";
const PAI_URL     = "https://www.peterka.ai/";

// ---------- STATE / ELEMS ----------
let chatBox, form, input, suggest;

// ---------- CONTENT ----------
const CHIPS = [
  "Kurzüberblick",
  "Nutzen fürs Haus",
  "Termin / Unterlagen",
];

const ANSWERS = {
  "Kurzüberblick":
    "Der Impuls zeigt, wie Führung in vernetzten Systemen handlungsfähig bleibt: klare Rollen zwischen Mensch & Maschine, Entscheidungen mit Daten UND Erfahrung sowie klare Prioritäten für Effizienz & Wirkung.",

  "Nutzen fürs Haus":
    "Ergebnisse: bessere Entscheidungsqualität, effizientere Abläufe, geschärfte Rollenprofile und eine Roadmap für 3–6 Monate. Fokus auf die konkrete Praxis Ihres Hauses – nicht Theorie.",

  "Zielgruppe":
    "Typische Zielgruppen: Vorstand (3–6 Personen), Führungskräfte (10–30), Multiplikatoren (30+). Skalierbar vom Strategie-Kreis bis zum Entscheidungs-Input in größerer Runde.",

  "Dauer & Format":
    "Empfehlung: 60–90 Minuten Impuls + Diskussion. Optional Vertiefung (2–3h) für Roadmap & Verantwortlichkeiten. Online oder vor Ort – je nach Zielsetzung.",

  "Sicherheit":
    "Sicherheit & Datenschutz: Keine produktiven Kundendaten notwendig. Anonymisierte Beispiele, DS-GVO-konform. Auf Wunsch NDA und technische Klärung vorab.",

  "Honorar":
    "Pauschalhonorar, abhängig von Format und Teilnehmerzahl. Transparent, ohne versteckte Positionen. Kurzes Vorgespräch – danach erhalten Sie das Angebot."
};

const ACTION_SETS = {
  MEETINGS: [
    { label: "PDF ansehen",             url: PDF_URL },
    { label: "Termin buchen", url: MEETING_URL },
    { label: "Zur Landingpage",         url: LP_URL }
  ],
  FALLBACK: [
    { label: "Mehr auf peterka.ai",     url: PAI_URL },
    { label: "Termin buchen", url: MEETING_URL }
  ]
};

// ---------- UTILS ----------
function q(id){ return document.getElementById(id); }
function escapeHtml(s=''){ return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }

function addMessage(sender, text, who='bot', asHtml=false){
  if (!chatBox) return;
  const wrap = document.createElement('div');
  wrap.className = `msg ${who==='you'?'you':'bot'}`;

  const bubble = document.createElement('div');
  bubble.className = 'bubble';

  const header = `<span class="sender">${escapeHtml(sender)}</span>`;
  bubble.innerHTML = asHtml ? (header + text) : (header + `<p>${escapeHtml(text)}</p>`);

  wrap.appendChild(bubble);
  chatBox.appendChild(wrap);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function actionsRow(list){
  if (!list || !list.length) return;
  const holder = document.createElement('div');
  holder.className = 'actions';
  list.forEach(a=>{
    const link = document.createElement('a');
    link.className = 'action-btn';
    link.href = a.url;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = a.label;
    holder.appendChild(link);
  });
  const last = chatBox?.lastElementChild?.querySelector('.bubble');
  if (last) last.appendChild(holder);
}

function renderChips(){
  if (!suggest) return;
  suggest.innerHTML = '';
  CHIPS.forEach(label=>{
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip';
    b.textContent = label;
    b.addEventListener('click', ()=> onChip(label));
    suggest.appendChild(b);
  });
}

// ---------- INTENT MATCH ----------
const INTENTS = [
  { key: "Kurzüberblick",      kws: ["überblick","kurzüberblick","worum","was ist","einführung","summary","intro"] },
  { key: "Nutzen fürs Haus",   kws: ["nutzen","mehrwert","bringt","ergebnis","outcome","business case","vorteil"] },
  { key: "Termin / Unterlagen",kws: ["termin","unterlagen","meeting","kalender","buchen","hubspot","pdf","call"] },
];

function routeFreeText(q){
  const t = q.toLowerCase();
  if (/^(hi|hallo|hey|guten\s?tag|moin|servus)\b/.test(t)) return "Kurzüberblick";
  let best = null, score = 0;
  for (const it of INTENTS) {
    let s = 0;
    for (const k of it.kws) if (t.includes(k)) s += (k.length > 6 ? 2 : 1);
    if (s > score) { score = s; best = it.key; }
  }
  return score >= 2 ? best : null;
}

// ---------- HANDLERS ----------
function onChip(label){
  addMessage('Sie', label, 'you');

  if (label === "Termin / Unterlagen") {
    addMessage('BankenFokus-Assistent', "Gern. Sie können die Unterlagen ansehen oder direkt einen Termin buchen.", 'bot');
    actionsRow(ACTION_SETS.MEETINGS);
    return;
  }
  const answer = ANSWERS[label] || "Bitte nutzen Sie die Optionen oben.";
  addMessage('BankenFokus-Assistent', answer, 'bot');
}

function onSubmit(e){
  e.preventDefault();
  const val = input?.value?.trim();
  if(!val) return;
  input.value = '';

  const mapped = routeFreeText(val);
  if (mapped) {
    onChip(mapped);
  } else {
    addMessage('Sie', val, 'you');
    addMessage('BankenFokus-Assistent',
      "Dazu habe ich hier nichts Konkretes. Zwei schnelle Wege: Mehr Hintergründe auf peterka.ai – oder direkt ein Gesprächstermin.",
      'bot'
    );
    actionsRow(ACTION_SETS.FALLBACK);
  }
}

// ---------- SAFE INIT ----------
function ensureContainers(){
  const app = document.querySelector('.app');
  if (!q('suggest')) {
    const sec = document.createElement('section');
    sec.id = 'suggest'; sec.className = 'suggest';
    const header = document.querySelector('.header');
    header?.insertAdjacentElement('afterend', sec);
  }
  if (!q('chat-box')) {
    const sec = document.createElement('section');
    sec.id = 'chat-box'; sec.className = 'chat'; sec.setAttribute('aria-live','polite');
    app?.appendChild(sec);
  }
  if (!q('chat-form')) {
    const f = document.createElement('form');
    f.id = 'chat-form'; f.className = 'composer'; f.autocomplete = 'off';
    f.innerHTML = `
      <input id="user-input" type="text" placeholder="(Optional) Tippen Sie hier …" aria-label="Ihre Eingabe" />
      <button type="submit" aria-label="Senden">Senden</button>
    `;
    app?.appendChild(f);
  }
}

function init(){
  ensureContainers();
  chatBox = q('chat-box');
  form    = q('chat-form');
  input   = q('user-input');
  suggest = q('suggest');

  if (!chatBox || !form || !input || !suggest) {
    console.error('BankenFokus-Assistent: Required elements not found.');
    return;
  }

  form.addEventListener('submit', onSubmit);

  addMessage('BankenFokus-Assistent',
    'Willkommen. Wählen Sie einen Einstieg über die Optionen oben – oder tippen Sie Ihre Frage.', 'bot'
  );
  renderChips();
}

// Run after DOM is ready (works with/without defer)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}


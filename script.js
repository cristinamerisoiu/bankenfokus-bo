// BankenFokus-Assistent – static, zero-backend.
// Drop-in for your current index.html + style.css.

// ---------- CONFIG ----------
const PDF_URL       = "https://YOUR_CDN/BankenFokus.pdf"; // put the real PDF link here
const MEETING_URL   = "https://meetings.hubspot.com/peterka/erstes-kennenlernen-i-first-meeting-";
const LP_URL        = "https://gannaca.de/genossenschaftsbanken";
const PAI_URL       = "https://peterka.ai"; // Peterka Intelligence

// ---------- ELEMENTS ----------
const chatBox = document.getElementById("chat-box");
const form    = document.getElementById("chat-form");
const input   = document.getElementById("user-input");
const suggest = document.getElementById("suggest");

// ---------- CONTENT ----------
const CHIPS = [
  "Kurzüberblick",
  "Nutzen fürs Haus",
  "Termin / Unterlagen",
  "Zielgruppe",
  "Dauer & Format",
  "Sicherheit",
  "Honorar"
];

const ANSWERS = {
  "Kurzüberblick":
    "Der Impuls zeigt, wie Führung in vernetzten Systemen handlungsfähig bleibt: klare Rollen zwischen Mensch & Maschine, Entscheidungen mit Daten UND Erfahrung sowie klare Prioritäten für Effizienz & Wirkung.",

  "Nutzen fürs Haus":
    "Ergebnisse: bessere Entscheidungsqualität, effizientere Abläufe, geschärfte Rollenprofile und eine Roadmap für 3–6 Monate. Fokus auf die konkrete Praxis Ihres Hauses – nicht Theorie.",

  "Zielgruppe":
    "Typische Zielgruppen: Vorstand (3–6 Personen), Führungskräfte (10–30), Multiplikatoren (30+). Skalierbar vom Strategie-Kreis bis zum Entscheidungs-Input für größere Runden.",

  "Dauer & Format":
    "Empfehlung: 60–90 Minuten Impuls + Diskussion. Optional Vertiefung (2–3h) für Roadmap & Verantwortlichkeiten. Online oder vor Ort – je nach Zielsetzung.",

  "Sicherheit":
    "Sicherheit & Datenschutz: Keine produktiven Kundendaten notwendig. Anonymisierte Beispiele, DS-GVO-konform. Auf Wunsch NDA und technische Klärung vorab.",

  "Honorar":
    "Pauschalhonorar, abhängig von Format und Teilnehmerzahl. Transparent, ohne versteckte Positionen. Kurzes Vorgespräch – dann erhalten Sie das Angebot."
};

// buttons that appear under certain answers
const ACTIONS = {
  "Termin / Unterlagen": [
    { label: "PDF ansehen",            url: PDF_URL },
    { label: "Termin buchen (HubSpot)", url: MEETING_URL },
    { label: "Zur Landingpage",         url: LP_URL }
  ],
  // shown for off-topic / unknown queries
  "_fallback": [
    { label: "Mehr auf peterka.ai",     url: PAI_URL },
    { label: "Termin buchen (HubSpot)", url: MEETING_URL }
  ]
};

// ---------- UTIL ----------
function escapeHtml(s=''){
  return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}
function addMessage(sender, text, who='bot'){
  const wrap = document.createElement('div');
  wrap.className = `msg ${who === 'you' ? 'you' : 'bot'}`;
  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.innerHTML = `<span class="sender">${escapeHtml(sender)}</span><p>${escapeHtml(text)}</p>`;
  wrap.appendChild(bubble);
  chatBox.appendChild(wrap);
  chatBox.scrollTop = chatBox.scrollHeight;
}
function renderActions(key){
  const actions = ACTIONS[key] || [];
  if(!actions.length) return;
  const holder = document.createElement('div');
  holder.className = 'actions';
  actions.forEach(a=>{
    const link = document.createElement('a');
    link.className = 'action-btn';
    link.href = a.url;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = a.label;
    holder.appendChild(link);
  });
  const last = chatBox.lastElementChild?.querySelector('.bubble');
  if (last) last.appendChild(holder);
}
function renderChips(){
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

// ---------- INTENT MATCHING (fuzzy, keyword score) ----------
const INTENTS = [
  { key: "Kurzüberblick",    kws: ["überblick","kurzüberblick","worum","was ist","einführung","summary","intro"] },
  { key: "Nutzen fürs Haus", kws: ["nutzen","mehrwert","bringt","ergebnis","outcome","business case","vorteil"] },
  { key: "Termin / Unterlagen", kws: ["termin","unterlagen","meeting","kalender","buchen","hubspot","pdf","call"] },
  { key: "Zielgruppe",       kws: ["zielgruppe","publikum","für wen","vorstand","führung","multiplikatoren","teilnehmer"] },
  { key: "Dauer & Format",   kws: ["dauer","format","ablauf","ag]()

// BankenFokus-Assistent – static, no backend.
// 3 core options + an ACTION for peterka.ai (CP-Assistent).

// --- CONFIG ---
const PDF_URL     = "https://gannaca.de/hubfs/K%C3%BCnstliche%20Intelligenz%20veraendert%20alles%20%20wie%20begegnen%20Sie%20dem%20Wandel.pdf?hsLang=de-def"; // set real link if available
const MEETING_URL = "https://meetings.hubspot.com/peterka/erstes-kennenlernen-i-first-meeting-";
const LP_URL      = "https://gannaca.de/genossenschaftsbanken";
const PAI_URL     = "https://www.peterka.ai/";

// --- ELEMENTS ---
const chatBox = document.getElementById("chat-box");
const form    = document.getElementById("chat-form");
const input   = document.getElementById("user-input");
const suggest = document.getElementById("suggest");

// --- HELPERS ---
function addMessage(sender, text, who='bot') {
  const wrap = document.createElement('div');
  wrap.className = `msg ${who==='you'?'you':'bot'}`;
  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.innerHTML = `<span class="sender">${sender}</span><p>${text}</p>`;
  wrap.appendChild(bubble);
  chatBox.appendChild(wrap);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function actionsRow(list){
  const holder = document.createElement('div');
  holder.className = 'actions';
  list.forEach(a=>{
    const link = document.createElement('a');
    link.className = 'action-btn';
    link.href = a.url; link.target = "_blank"; link.rel = "noopener";
    link.textContent = a.label;
    holder.appendChild(link);
  });
  const lastBubble = chatBox.lastElementChild?.querySelector('.bubble');
  if (lastBubble) lastBubble.appendChild(holder);
}

// --- CONTENT ---
const CHIP_CP = "Christophers Clone";
const CHIPS = [
  "Kurzüberblick",
  "Nutzen fürs Haus",
  "Termin und Unterlagen",
  CHIP_CP
];

const ANSWERS = {
  "Kurzüberblick":
    "Der Impuls zeigt, wie Führung in vernetzten Systemen handlungsfähig bleibt: klare Rollen zwischen Mensch & Maschine, Entscheidungen mit Daten UND Erfahrung sowie klare Prioritäten für Effizienz & Wirkung.",

  "Nutzen fürs Haus":
    "Ergebnisse: bessere Entscheidungsqualität, effizientere Abläufe, geschärfte Rollenprofile und eine Roadmap für 3–6 Monate. Fokus auf die konkrete Praxis Ihres Hauses – nicht Theorie."
};

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

// --- ROUTING (minimal fuzzy) ---
function toLower(s){ return (s || '').toLowerCase(); }

function routeText(q){
  const t = toLower(q);
  if (/überblick|worum|intro|einführung/.test(t)) return "Kurzüberblick";
  if (/nutzen|mehrwert|bringt|ergebnis/.test(t))   return "Nutzen fürs Haus";
  if (/termin|meeting|unterlagen|buchen|kalender|hubspot|pdf/.test(t)) return "Termin und Unterlagen";
  if (/^\/peterka$/.test(t) || /christopher\s+peterka/.test(t) || /peterka\.ai/.test(t))
    return CHIP_CP;
  return null;
}

// --- HANDLERS ---
function onChip(label){
  addMessage('Sie', label, 'you');

  if (label === CHIP_CP) {
    addMessage('BankenFokus-Assistent', "Öffne peterka.ai (CP-Assistent) in einem neuen Tab …", 'bot');
    window.open(PAI_URL, '_blank', 'noopener');
    return;
  }

  if (label === "Termin / Unterlagen") {
    addMessage('BankenFokus-Assistent', "Gern. Sie können die Unterlagen ansehen oder direkt einen Termin buchen.", 'bot');
    actionsRow([
      { label: "PDF ansehen",     url: PDF_URL },
      { label: "Termin buchen",   url: MEETING_URL },
      { label: "Zur Landingpage", url: LP_URL }
    ]);
    return;
  }

  const text = ANSWERS[label];
  if (text) {
    addMessage('BankenFokus-Assistent', text, 'bot');
  } else {
    addMessage('BankenFokus-Assistent', "Bitte nutzen Sie die Optionen oben.", 'bot');
  }
}

form.addEventListener('submit', (e)=>{
  e.preventDefault();
  const val = input.value.trim();
  if (!val) return;
  input.value = '';

  const mapped = routeText(val);
  if (mapped) {
    onChip(mapped);
  } else {
    addMessage('Sie', val, 'you');
    addMessage('BankenFokus-Assistent',
      "Dazu habe ich hier nichts Konkretes. Zwei schnelle Wege: den CP-Assistenten auf peterka.ai öffnen oder direkt einen Gesprächstermin buchen.",
      'bot'
    );
    actionsRow([
      { label: "peterka.ai öffnen", url: PAI_URL },
      { label: "Termin buchen",     url: MEETING_URL }
    ]);
  }
});

// --- INIT ---
(function init(){
  addMessage('BankenFokus-Assistent', "Willkommen. Wählen Sie oben eine Option oder tippen Sie Ihre Frage. (Tipp: /peterka)", 'bot');
  renderChips();
})();

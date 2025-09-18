// BankenFokus-Assistent – static, no backend.
// Chips always visible (no toggle). Typing indicator, bubble tails (CSS), mobile polish.

const PDF_URL     = "https://gannaca.de/hubfs/K%C3%BCnstliche%20Intelligenz%20veraendert%20alles%20%20wie%20begegnen%20Sie%20dem%20Wandel.pdf?hsLang=de-de"; // set if you have it
const MEETING_URL = "https://meetings.hubspot.com/peterka/erstes-kennenlernen-i-first-meeting-";
const LP_URL      = "https://gannaca.de/genossenschaftsbanken";
const CLONE_URL   = "https://www.peterka.ai/";

// Elements
const chatBox = document.getElementById("chat-box");
const suggest = document.getElementById("suggest");
const form    = document.getElementById("chat-form");
const input   = document.getElementById("user-input");

// Chips
const CHIPS = [
  "Kurzüberblick",
  "Nutzen fürs Haus",
  "Termin und Unterlagen",
  "Christophers Clone"
];

// Copy
const ANSWERS = {
  "Kurzüberblick":
    "Der Impuls zeigt, wie Führung in vernetzten Systemen handlungsfähig bleibt: klare Rollen zwischen Mensch & Maschine, Entscheidungen mit Daten UND Erfahrung sowie klare Prioritäten für Effizienz & Wirkung.",

  "Nutzen fürs Haus":
    "Ergebnisse: bessere Entscheidungsqualität, effizientere Abläufe, geschärfte Rollenprofile und eine Roadmap für 3–6 Monate. Fokus auf die konkrete Praxis Ihres Hauses – nicht Theorie.",

  "Termin und Unterlagen":
    "Gern. Sie können Unterlagen ansehen oder einen Termin buchen.",

  "Clone-Fallback":
    "Für weitere Informationen können Sie Christophers Clone öffnen oder einen Gesprächstermin buchen."
};

// Helpers
function addMessage(sender, text, who='bot'){
  const wrap = document.createElement('div');
  wrap.className = `msg ${who==='you' ? 'you' : 'bot'}`;
  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.innerHTML = `<span class="sender">${sender}</span><p>${text}</p>`;
  wrap.appendChild(bubble);
  chatBox.appendChild(wrap);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function addActions(actions){
  if(!actions || !actions.length) return;
  const holder = document.createElement('div');
  holder.className = 'actions';
  actions.forEach(a=>{
    const link = document.createElement('a');
    link.className = 'action-btn';
    link.href = a.url; link.target = '_blank'; link.rel = 'noopener';
    link.textContent = a.label;
    holder.appendChild(link);
  });
  const lastBubble = chatBox.lastElementChild?.querySelector('.bubble');
  if(lastBubble) lastBubble.appendChild(holder);
}

function showTypingThen(handler, delay=600){
  const wrap = document.createElement('div');
  wrap.className = 'msg bot typing';
  wrap.innerHTML = `
    <div class="bubble">
      <span class="sender">BankenFokus-Assistent</span>
      <span class="dot"></span><span class="dot"></span><span class="dot"></span>
    </div>`;
  chatBox.appendChild(wrap);
  chatBox.scrollTop = chatBox.scrollHeight;
  setTimeout(()=>{ wrap.remove(); handler(); }, delay);
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

// Routing for free text
function routeText(q){
  const t = (q||'').toLowerCase();
  if (/überblick|worum|intro|einführung/.test(t)) return "Kurzüberblick";
  if (/nutzen|mehrwert|bringt|ergebnis/.test(t))   return "Nutzen fürs Haus";
  if (/termin|unterlagen|meeting|kalender|hubspot|pdf|dokument/.test(t)) return "Termin und Unterlagen";
  if (/christopher?s?\s+clone/.test(t)) return "Christophers Clone";
  return null;
}

// Handlers
function onChip(label, skipEcho=false){
  if (!skipEcho){
    const echo = document.createElement('div');
    echo.className = 'msg you';
    echo.innerHTML = `<div class="bubble"><span class="sender">Sie</span><p>${label}</p></div>`;
    chatBox.appendChild(echo);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  if (label === "Christophers Clone") {
    showTypingThen(()=>{
      addMessage('BankenFokus-Assistent', 'Christophers Clone wird in einem neuen Tab geöffnet.', 'bot');
      window.open(CLONE_URL, '_blank', 'noopener');
    });
    return;
  }

  if (label === "Termin und Unterlagen") {
    showTypingThen(()=>{
      addMessage('BankenFokus-Assistent', ANSWERS[label], 'bot');
      addActions([
        { label:'PDF ansehen', url: PDF_URL },
        { label:'Termin buchen', url: MEETING_URL },
        { label:'Zur Landingpage', url: LP_URL }
      ]);
    });
    return;
  }

  if (ANSWERS[label]) {
    showTypingThen(()=> addMessage('BankenFokus-Assistent', ANSWERS[label], 'bot'));
  } else {
    showTypingThen(()=>{
      addMessage('BankenFokus-Assistent', ANSWERS["Clone-Fallback"], 'bot');
      addActions([
        { label:'Clone öffnen',  url: CLONE_URL },
        { label:'Termin buchen', url: MEETING_URL }
      ]);
    });
  }
}

// Submit (free text)
form.addEventListener('submit', (e)=>{
  e.preventDefault();
  const val = input.value.trim();
  if(!val) return;
  input.value = '';

  const you = document.createElement('div');
  you.className = 'msg you';
  you.innerHTML = `<div class="bubble"><span class="sender">Sie</span><p>${val}</p></div>`;
  chatBox.appendChild(you);
  chatBox.scrollTop = chatBox.scrollHeight;

  const mapped = routeText(val);
  if (mapped) {
    onChip(mapped, true);
  } else {
    showTypingThen(()=>{
      addMessage('BankenFokus-Assistent', ANSWERS["Clone-Fallback"], 'bot');
      addActions([
        { label:'Clone öffnen',  url: CLONE_URL },
        { label:'Termin buchen', url: MEETING_URL }
      ]);
    });
  }
});

// Init
(function init(){
  addMessage('BankenFokus-Assistent', 'Willkommen. Bitte wählen Sie eine Option.', 'bot');
  renderChips();
})();

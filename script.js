// Desktop: chips row under header
// Mobile: top-left hamburger opens a left drawer with 4 big stacked options
// No chips inside messages

const PDF_URL     = "https://gannaca.de/hubfs/K%C3%BCnstliche%20Intelligenz%20veraendert%20alles%20%20wie%20begegnen%20Sie%20dem%20Wandel.pdf?hsLang=de-de";
const MEETING_URL = "https://meetings.hubspot.com/peterka/erstes-kennenlernen-i-first-meeting-";
const LP_URL      = "https://gannaca.de/genossenschaftsbanken";
const CLONE_URL   = "https://www.peterka.ai/";

// Elements
const chatBox      = document.getElementById("chat-box");
const suggest      = document.getElementById("suggest");
const form         = document.getElementById("chat-form");
const input        = document.getElementById("user-input");

const menuBtn      = document.getElementById("menu-btn");
const drawer       = document.getElementById("menu-drawer");
const drawerClose  = document.getElementById("menu-close");
const drawerOpts   = document.getElementById("drawer-options");

// Chip labels (desktop row + mobile drawer)
const CHIPS = [
  "Kurzüberblick",
  "Nutzen fürs Haus",
  "Termin und Unterlagen",
  "Peterka Intelligence"
];

// Answers / copy (refined)
const ANSWERS = {
  "Kurzüberblick":
    "Der BankenFokus-Impuls zeigt, wie sich Führung im KI-Zeitalter neu ordnet: klare Trennung zwischen Aufgaben für Menschen und Maschinen, präzise Nutzung von Daten ohne den Erfahrungswert zu verlieren, und Prioritätensetzung entlang von Effizienz, Wirkung und Zukunftsfähigkeit.",

  "Nutzen fürs Haus":
    "Direkter Nutzen für Ihr Haus: bessere Entscheidungsqualität auf Basis valider Daten, schlankere Abläufe im Tagesgeschäft, und klar abgegrenzte Rollen, die Überlastung vermeiden. Das Ergebnis: mehr Orientierung im Veränderungsdruck - und konkrete Handlungsfähigkeit im Jetzt.",

  "Termin und Unterlagen":
    "Gern. Sie können Unterlagen ansehen oder einen Termin buchen.",

  "Peterka Intelligence":
    "Peterka Intelligence bündelt über 20 Jahre Erfahrung von Christopher Peterka mit modernster KI. Sie erhalten präzise Impulse in natürlicher Gesprächsform."
};

// Softer fallback
const FALLBACK_TEXT =
  "Dazu habe ich keine fertige Antwort - aber Sie können gleich einen Termin buchen.";

// --- Low-effort “chatbot feel” additions ---

// 1) Greeting variety
const GREETINGS = [
  "Guten Tag. Bitte wählen Sie, ob Sie einen Überblick, den konkreten Nutzen für Ihr Haus oder Unterlagen und einen Termin wünschen.",
  "Hallo! Womit möchten Sie starten?",
  "Willkommen zurück - welche Option ist für Sie spannend?"
];
function pickGreeting(){
  return GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
}

// 4) Gentle follow-up nudge helper
function addNudgeToLastBubble(text, linkLabel, linkChip){
  const lastBubble = chatBox.lastElementChild?.querySelector('.bubble');
  if (!lastBubble) return;
  const p = document.createElement('p');
  p.style.marginTop = '8px';
  p.style.opacity = '.9';
  p.innerHTML = `${text} <a href="#" style="text-decoration:underline" onclick="event.preventDefault(); onChip('${linkChip}', true);">${linkLabel}</a>`;
  lastBubble.appendChild(p);
}

// UI helpers
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

// Desktop chips row
function renderChipsRow(){
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

// Drawer options (mobile)
function renderDrawerOptions(){
  drawerOpts.innerHTML = '';
  CHIPS.forEach(label=>{
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip';
    b.textContent = label;
    b.addEventListener('click', ()=>{
      closeDrawer();
      onChip(label);
    });
    drawerOpts.appendChild(b);
  });
}

// Drawer controls (mobile)
function openDrawer(){
  drawer.classList.add('open');
  drawer.setAttribute('aria-hidden', 'false');
  menuBtn.setAttribute('aria-expanded', 'true');
  document.body.classList.add('no-scroll');
}
function closeDrawer(){
  drawer.classList.remove('open');
  drawer.setAttribute('aria-hidden', 'true');
  menuBtn.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('no-scroll');
}

menuBtn.addEventListener('click', ()=> {
  if (drawer.classList.contains('open')) closeDrawer(); else openDrawer();
});
drawerClose.addEventListener('click', closeDrawer);
drawer.addEventListener('click', (e)=>{
  if (e.target.dataset.close) closeDrawer();
});
document.addEventListener('keydown', (e)=>{
  if (e.key === 'Escape' && drawer.classList.contains('open')) closeDrawer();
});

// Map free text to a known option
function routeText(q){
  const t = (q||'').toLowerCase();
  if (/überblick|worum|intro|einführung/.test(t)) return "Kurzüberblick";
  if (/nutzen|mehrwert|bringt|ergebnis/.test(t))   return "Nutzen fürs Haus";
  if (/termin|unterlagen|meeting|kalender|hubspot|pdf|dokument/.test(t)) return "Termin und Unterlagen";
  if (/peterka|intelligence/.test(t)) return "Peterka Intelligence";
  return null;
}

// Handle option selection
function onChip(label, skipEcho=false){
  if (!skipEcho){
    const echo = document.createElement('div');
    echo.className = 'msg you';
    echo.innerHTML = `<div class="bubble"><span class="sender">Sie</span><p>${label}</p></div>`;
    chatBox.appendChild(echo);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  if (label === "Peterka Intelligence") {
    showTypingThen(()=>{
      addMessage('BankenFokus-Assistent', 'Peterka Intelligence wird in einem neuen Tab geöffnet.', 'bot');
      window.open(CLONE_URL, '_blank', 'noopener');
    });
    return;
  }

  if (label === "Termin und Unterlagen") {
    showTypingThen(()=>{
      addMessage('BankenFokus-Assistent', ANSWERS[label], 'bot');
      addActions([
        { label:'PDF ansehen',    url: PDF_URL },
        { label:'Termin buchen',  url: MEETING_URL },
        { label:'Zur Landingpage',url: LP_URL }
      ]);
    });
    return;
  }

  if (ANSWERS[label]) {
    showTypingThen(()=>{
      addMessage('BankenFokus-Assistent', ANSWERS[label], 'bot');
      // Gentle follow-up nudge after Nutzen fürs Haus
      if (label === "Nutzen fürs Haus") {
        addNudgeToLastBubble("Möchten Sie die Details auch im PDF nachlesen?", "Jetzt öffnen", "Termin und Unterlagen");
      }
    });
  } else {
    showTypingThen(()=>{
      addMessage('BankenFokus-Assistent', FALLBACK_TEXT, 'bot');
      addActions([
        { label:'Peterka Intelligence öffnen',  url: CLONE_URL },
        { label:'Termin buchen',                url: MEETING_URL }
      ]);
    });
  }
}

// Free-text submit
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
      addMessage('BankenFokus-Assistent', FALLBACK_TEXT, 'bot');
      addActions([
        { label:'Peterka Intelligence öffnen',  url: CLONE_URL },
        { label:'Termin buchen',                url: MEETING_URL }
      ]);
    });
  }
});

// Init
(function init(){
  // 3) Friendlier placeholder
  if (input) input.placeholder = "Fragen Sie den Assistenten …";

  // 1) Rotating greeting
  addMessage('BankenFokus-Assistent', pickGreeting(), 'bot');

  renderChipsRow();       // desktop chips
  renderDrawerOptions();  // mobile drawer options
})();



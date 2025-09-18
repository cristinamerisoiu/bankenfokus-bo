// Static, minimal assistant with intent matching + quick chips (no backend).

const chatBox = document.getElementById("chat-box");
const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");
const suggest = document.getElementById("suggest");

let KB = null; // loaded from bankenfokus.json

// --- Utils ---
function escapeHtml(s=''){ return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
function toHtml(md=''){
  let t = escapeHtml(md);
  t = t.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  t = t.replace(/_(.+?)_/g, '<em>$1</em>');
  t = t.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
  t = t.replace(/\n{2,}/g, '</p><p>');
  return `<p>${t}</p>`;
}

function addMessage(sender, msg, who='bot'){
  const wrap = document.createElement('div');
  wrap.className = `msg ${who==='you'?'you':'bot'}`;
  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.innerHTML = `<span class="sender">${escapeHtml(sender)}</span>${toHtml(msg)}`;
  wrap.appendChild(bubble);
  chatBox.appendChild(wrap);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function renderChips(labels=[]){
  suggest.innerHTML = '';
  labels.forEach(label=>{
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip';
    chip.textContent = label;
    chip.addEventListener('click', ()=> handleQuery(label));
    suggest.appendChild(chip);
  });
}

async function loadKB(){
  const res = await fetch('bankenfokus.json'); // same origin
  KB = await res.json();
}

function matchIntent(q){
  const text = q.toLowerCase();
  for(const intent of KB.intents){
    const hit = intent.keywords.some(k => text.includes(k.toLowerCase()));
    if(hit) return intent;
  }
  return KB.fallback;
}

function handleActions(intent){
  if(!intent || !intent.actions) return '';
  const parts = intent.actions.map(a => `• <a href="${a.url}" target="_blank" rel="noopener">${a.label}</a>`);
  return parts.length ? `\n\n${parts.join('\n')}` : '';
}

async function handleQuery(userMsg){
  addMessage('Sie', userMsg, 'you');
  const intent = matchIntent(userMsg);
  const actions = handleActions(intent);
  addMessage('BankenFokus-Assistent', `${intent.answer}${actions}`, 'bot');
  // refresh suggestions if provided
  if (intent.suggest && intent.suggest.length) renderChips(intent.suggest);
}

form.addEventListener('submit', (e)=>{
  e.preventDefault();
  const val = input.value.trim();
  if(!val) return;
  input.value = '';
  handleQuery(val);
});

// init
(async function init(){
  await loadKB();
  addMessage('BankenFokus-Assistent',
    'Willkommen. Wählen Sie einen Einstieg:\n\n1) Kurzüberblick\n2) Was bringt das meinem Haus?\n3) Termin / Unterlagen'
  );
  renderChips(KB.suggest || ['Kurzüberblick','Nutzen fürs Haus','Termin / Unterlagen','Zielgruppe','Dauer & Format','Sicherheit','Honorar']);
})();

const chatBox = document.getElementById("chat-box");
const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");

// --- Utils: safe HTML ---
function escapeHtml(s = '') {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function toHtml(md = '') {
  let text = escapeHtml(md);
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/_(.+?)_/g, '<em>$1</em>');
  text = text.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
  return `<p>${text}</p>`;
}

// --- UI helpers ---
function addMessage(sender, msg, who = 'bot') {
  const wrap = document.createElement('div');
  wrap.className = `msg ${who === 'you' ? 'you' : 'bot'}`;
  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.innerHTML = `<span class="sender">${sender}</span>${toHtml(msg)}`;
  wrap.appendChild(bubble);
  chatBox.appendChild(wrap);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// --- static QA from bankenfokus.json ---
async function askBackend(question) {
  const res = await fetch("bankenfokus.json");
  const data = await res.json();
  const q = question.toLowerCase();
  if (q.includes("überblick")) return data.overview;
  if (q.includes("nutzen")) return data.benefits;
  if (q.includes("termin") || q.includes("unterlagen")) return data.meet;
  return "Bitte wählen Sie: Kurzüberblick, Nutzen fürs Haus oder Termin / Unterlagen.";
}

// --- Form submit ---
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const userMsg = input.value.trim();
  if (!userMsg) return;
  addMessage("Sie", userMsg, 'you');
  input.value = "";
  try {
    const reply = await askBackend(userMsg);
    addMessage("BankenFokus-Assistent", reply, 'bot');
  } catch (err) {
    addMessage("BankenFokus-Assistent", "Fehler beim Laden der Antwort.", 'bot');
    console.error(err);
  }
});

// --- greeting ---
addMessage("BankenFokus-Assistent", "Willkommen. Wählen Sie einen Einstieg:\n\n1) Kurzüberblick\n2) Was bringt das meinem Haus?\n3) Termin / Unterlagen");

const chatArea = document.getElementById('chatArea');
const welcome = document.getElementById('welcome');
const promptInput = document.getElementById('prompt');
const sendBtn = document.getElementById('sendBtn');
const clearBtn = document.getElementById('clearBtn');
const newChatBtn = document.getElementById('newChatBtn');
const themeBtn = document.getElementById('themeBtn');
const counter = document.getElementById('counter');
const status = document.getElementById('status');
const menuBtn = document.getElementById('menuBtn');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');


const CHAT_KEY = 'my-ai-chat-history';
const THEME_KEY = 'my-ai-chat-theme';

let conversation = [];
let isSending = false;


function saveConversation() {
  localStorage.setItem(CHAT_KEY, JSON.stringify(conversation));
}


function addMessage(role, text) {
  const row = document.createElement('div');
  row.className = `message ${role}`;

  const avatar = document.createElement('div');
  avatar.className = `avatar ${role === 'assistant' ? 'ai' : 'user'}`;
  avatar.textContent = role === 'assistant' ? 'AI' : 'YOU';

  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.textContent = text;

  if (role === 'assistant') {
    row.append(avatar, bubble);
  } else {
    row.append(bubble, avatar);
  }

  chatArea.appendChild(row);
  chatArea.scrollTop = chatArea.scrollHeight;
  return bubble;
}


function showLoading() {
  const row = document.createElement('div');
  row.className = 'message assistant';
  row.id = 'loading';
  row.innerHTML = `
    <div class="avatar ai">AI</div>
    <div class="bubble">
      <div class="loading"><span></span><span></span><span></span></div>
    </div>`;
  chatArea.appendChild(row);
  chatArea.scrollTop = chatArea.scrollHeight;
}

function removeLoading() {
  document.getElementById('loading')?.remove();
}


async function typeAnswer(text) {
  const bubble = addMessage('assistant', '');
  bubble.classList.add('typing');

  for (let i = 0; i < text.length; i++) {
    bubble.textContent += text[i];
    if (i % 3 === 0) {
      chatArea.scrollTop = chatArea.scrollHeight;
      await new Promise(resolve => setTimeout(resolve, 8));
    }
  }

  bubble.classList.remove('typing');
}


async function sendMessage(prefilled = '') {
  if (isSending) return;

  const text = (prefilled || promptInput.value).trim();

  if (!text) {
    status.textContent = 'Please type a message first.';
    promptInput.focus();
    setTimeout(() => status.textContent = '', 2000);
    return;
  }

  isSending = true;
  sendBtn.disabled = true;
  promptInput.disabled = true;
  welcome?.remove();

  addMessage('user', text);
  conversation.push({ role: 'user', content: text });
  saveConversation();

  promptInput.value = '';
  updateCounter();
  autoGrow();
  status.textContent = 'AI is thinking...';
  showLoading();

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: conversation })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'The AI request failed.');
    }

    if (!data.response) {
      throw new Error('The AI returned an empty response.');
    }

    removeLoading();
    await typeAnswer(data.response);

    conversation.push({ role: 'assistant', content: data.response });
    saveConversation();
    status.textContent = '';
  } catch (error) {
    removeLoading();
    addMessage('assistant', `Sorry, something went wrong.\n\n${error.message}`);
    status.textContent = 'Request failed. Try again.';
  } finally {
    isSending = false;
    sendBtn.disabled = false;
    promptInput.disabled = false;
    promptInput.focus();
  }
}

function updateCounter() {
  counter.textContent = `${promptInput.value.length} / 2000`;
}

function autoGrow() {
  promptInput.style.height = 'auto';
  promptInput.style.height = Math.min(promptInput.scrollHeight, 130) + 'px';
}

// Clear the current conversation.
function clearChat() {
  conversation = [];
  localStorage.removeItem(CHAT_KEY);
  chatArea.innerHTML = `
    <div class="welcome" id="welcome">
      <div class="welcome-icon">AI</div>
      <h2>Hello! 👋</h2>
      <p>Ask me anything. I can help with learning, coding, writing and ideas.</p>
      <div class="welcome-buttons">
        <button data-prompt="Give me 5 beginner web development project ideas.">💡 Project ideas</button>
        <button data-prompt="Teach me the basics of JavaScript.">📚 Learn JavaScript</button>
      </div>
    </div>`;
  promptInput.value = '';
  updateCounter();
  autoGrow();
  bindQuickButtons();
}

function loadChat() {
  try {
    const saved = JSON.parse(localStorage.getItem(CHAT_KEY) || '[]');
    if (!Array.isArray(saved) || saved.length === 0) return;

    conversation = saved;
    welcome?.remove();
    conversation.forEach(message => addMessage(message.role, message.content));
  } catch {
    conversation = [];
  }
}

function bindQuickButtons() {
  document.querySelectorAll('[data-prompt]').forEach(button => {
    button.onclick = () => {
      closeSidebar();
      sendMessage(button.dataset.prompt);
    };
  });
}

function loadTheme() {
  const dark = localStorage.getItem(THEME_KEY) === 'dark';
  document.documentElement.classList.toggle('dark', dark);
  themeBtn.textContent = dark ? '☀️ Light Mode' : '🌙 Dark Mode';
}

function toggleTheme() {
  const dark = !document.documentElement.classList.contains('dark');
  document.documentElement.classList.toggle('dark', dark);
  localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light');
  themeBtn.textContent = dark ? '☀️ Light Mode' : '🌙 Dark Mode';
}

function closeSidebar() {
  sidebar.classList.remove('open');
  overlay.classList.remove('show');
}

// Buttons and keyboard events
sendBtn.addEventListener('click', () => sendMessage());
clearBtn.addEventListener('click', clearChat);
newChatBtn.addEventListener('click', clearChat);
themeBtn.addEventListener('click', toggleTheme);

promptInput.addEventListener('input', () => {
  updateCounter();
  autoGrow();
});

promptInput.addEventListener('keydown', event => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
});

menuBtn.addEventListener('click', () => {
  sidebar.classList.toggle('open');
  overlay.classList.toggle('show');
});

overlay.addEventListener('click', closeSidebar);

loadTheme();
loadChat();
bindQuickButtons();
updateCounter();
autoGrow();
promptInput.focus();

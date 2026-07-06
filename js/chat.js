// Chat amagat: injecta estils, mostra/oculta la UI i fa la crida a l'API
(function(){
  const css = `
  .hidden-chat-toggle{ position: fixed; right: 18px; bottom: 18px; background:#2b8a3e; color:#fff; border:none; padding:10px 14px; border-radius:24px; cursor:pointer; z-index:1000; }
  .hidden-chat{ position:fixed; right:18px; bottom:70px; width:320px; max-height:60vh; background:#fff; border:1px solid #ddd; border-radius:8px; box-shadow:0 8px 24px rgba(0,0,0,0.15); display:flex; flex-direction:column; overflow:hidden; z-index:1000; }
  .hidden-chat-header{ background:#f6f6f6; padding:8px 12px; display:flex; justify-content:space-between; align-items:center; font-weight:600; }
  .hidden-chat-close{ background:transparent; border:none; font-size:16px; cursor:pointer; }
  .hidden-chat-messages{ padding:12px; overflow:auto; flex:1 1 auto; }
  .hidden-chat-messages .msg{ margin-bottom:10px; line-height:1.4; }
  .hidden-chat-messages .msg.user{ text-align:right; }
  .hidden-chat-messages .msg.bot{ text-align:left; color:#111; }
  .hidden-chat-messages .msg h1{ font-size:1.2em; font-weight:bold; margin:8px 0 4px 0; }
  .hidden-chat-messages .msg h2{ font-size:1.1em; font-weight:bold; margin:6px 0 3px 0; }
  .hidden-chat-messages .msg h3{ font-size:1em; font-weight:bold; margin:4px 0 2px 0; }
  .hidden-chat-messages .msg ul{ margin:4px 0 4px 16px; padding:0; }
  .hidden-chat-messages .msg li{ margin:2px 0; }
  .hidden-chat-messages .msg strong{ font-weight:bold; }
  .hidden-chat-messages .msg em{ font-style:italic; }
  .hidden-chat-form{ display:flex; border-top:1px solid #eee; padding:8px; }
  .hidden-chat-form input{ flex:1 1 auto; padding:8px; border:1px solid #ddd; border-radius:4px; margin-right:8px; }
  .hidden-chat-form button{ background:#2b8a3e; color:#fff; border:none; padding:8px 12px; border-radius:4px; cursor:pointer; }
  `;

  // inject CSS
  const styleEl = document.createElement('style');
  styleEl.setAttribute('data-hidden-chat','true');
  styleEl.innerHTML = css;
  document.head.appendChild(styleEl);

  // helpers
  const $ = id => document.getElementById(id);

  function ensureElements(){
    const toggle = $('hiddenChatToggle');
    const chat = $('hiddenChat');
    const close = $('hiddenChatClose');
    const form = $('hiddenChatForm');
    const input = $('hiddenChatInput');
    const messages = $('hiddenChatMessages');
    if(!toggle || !chat || !close || !form || !input || !messages) return null;
    return { toggle, chat, close, form, input, messages };
  }

  function parseMarkdown(text) {
    // Títols h3, h2, h1
    text = text.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
    text = text.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
    text = text.replace(/^# (.*?)$/gm, '<h1>$1</h1>');
    
    // Negretes **text**
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Itàliques *text*
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Listes - item
    text = text.replace(/^- (.*?)$/gm, '<li>$1</li>');
    
    // Envolver listes en <ul>
    text = text.replace(/(<li>.*?<\/li>)/s, '<ul>$1</ul>');
    
    // Salts de línia
    text = text.replace(/\n/g, '<br>');
    
    return text;
  }

  function appendMsg(container, text, cls, isHtml = false){
    const d = document.createElement('div');
    d.className = 'msg ' + cls;
    if(isHtml){
      d.innerHTML = text;
    } else {
      d.textContent = text;
    }
    container.appendChild(d);
    container.scrollTop = container.scrollHeight;
    return d;
  }

  async function loadProducts(){
    try{
      const res = await fetch('/data/products.json');
      if(!res.ok) return [];
      const data = await res.json();
      return data.map(p=>({ name: p.name }));
    }catch(e){ return []; }
  }

  async function sendQuestion(text, messagesEl){
    const products = await loadProducts();
    const payload = {
      model: 'qwen2.5:14b',
      prompt: 'Respon sempre en el mateix idioma de la pregunta. ' + text + ' con ' + JSON.stringify(products)
    };

    const loading = appendMsg(messagesEl, 'Enviant...', 'bot');

    try{
      const res = await fetch('http://raonador.upc.edu:8080/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if(!res.ok){
        loading.textContent = 'Error: ' + res.status + ' ' + res.statusText;
        return;
      }

      // llegir resposta com a stream NDJSON i extreure només "response"
      const textResp = await res.text();
      const lines = textResp.trim().split('\n').filter(l => l);
      let fullResponse = '';
      for(const line of lines){
        try{
          const obj = JSON.parse(line);
          if(obj.response) fullResponse += obj.response;
        }catch(e){ }
      }
      loading.innerHTML = parseMarkdown(fullResponse) || '(sense resposta)';
    }catch(err){
      loading.textContent = 'Error: ' + (err.message || String(err));
    }
  }

  // inicialitza
  document.addEventListener('DOMContentLoaded', ()=>{
    const els = ensureElements();
    if(!els) return;

    els.toggle.addEventListener('click', ()=>{
      const hidden = els.chat.getAttribute('aria-hidden') === 'true';
      els.chat.setAttribute('aria-hidden', String(!hidden));
      els.chat.style.display = hidden ? 'flex' : 'none';
    });

    els.close.addEventListener('click', ()=>{
      els.chat.setAttribute('aria-hidden','true');
      els.chat.style.display = 'none';
    });

    els.form.addEventListener('submit', async (ev) =>{
      ev.preventDefault();
      const val = els.input.value.trim();
      if(!val) return;
      appendMsg(els.messages, val, 'user');
      els.input.value = '';
      await sendQuestion(val, els.messages);
    });
  });

})();

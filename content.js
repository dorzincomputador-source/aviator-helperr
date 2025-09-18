// Aviator Helper - content script
// Captura elementos visíveis que correspondem a resultados do jogo

(function(){
  const STORAGE_KEY = 'aviator_history_v1';

  function saveResult(value, timestamp) {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      data.push({ v: value, t: timestamp });
      // mantém só últimos 500
      if (data.length > 500) data.splice(0, data.length - 500);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      // notifica popup via custom event
      window.dispatchEvent(new CustomEvent('AviatorHelper:NewResult', { detail: { value, timestamp } }));
    } catch(e) { console.error('AviatorHelper save error', e); }
  }

  function parseTextToNumber(text){
    if(!text) return null;
    text = text.replace(',', '.').match(/[0-9]+(\\.[0-9]+)?/);
    return text ? parseFloat(text[0]) : null;
  }

  const candidateSelectors = [
    '.result, .round-result, .last-result, .history-item, .crash-value',
    'div[role="status"]',
    'span.value, span.result'
  ];

  function scanAndSave(){
    for(const sel of candidateSelectors){
      const nodes = document.querySelectorAll(sel);
      if(nodes && nodes.length){
        const last = nodes[nodes.length-1];
        const num = parseTextToNumber(last.innerText || last.textContent);
        if(num !== null) saveResult(num, Date.now());
        return;
      }
    }
  }

  const observer = new MutationObserver((mutations)=>{
    scanAndSave();
  });
  observer.observe(document.body, { childList: true, subtree: true });

  setTimeout(scanAndSave, 2000);

  window.AviatorHelper = {
    getHistory: ()=> JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'),
    clearHistory: ()=> localStorage.removeItem(STORAGE_KEY)
  };
})();
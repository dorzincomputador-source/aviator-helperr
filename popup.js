function formatDate(ts){
  const d = new Date(ts);
  return d.toLocaleString();
}

async function updateUI(){
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if(!tab) return;

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: ()=> window.AviatorHelper ? window.AviatorHelper.getHistory() : []
  }, (res)=>{
    const data = (res && res[0] && res[0].result) || [];
    const statsEl = document.getElementById('stats');
    if(data.length === 0){ statsEl.textContent = 'Sem dados rastreados nesta aba.'; document.getElementById('history').innerHTML = ''; return; }

    const valores = data.map(x=>x.v);
    const soma = valores.reduce((a,b)=>a+b,0);
    const media = soma / valores.length;
    const max = Math.max(...valores);
    const min = Math.min(...valores);

    statsEl.innerHTML = `Registros: ${valores.length} — média ${media.toFixed(2)} — min ${min} — max ${max}`;

    const hist = document.getElementById('history');
    hist.innerHTML = data.slice().reverse().slice(0,50).map(x=>`<div class="row">${formatDate(x.t)} — ${x.v}</div>`).join('');
  });
}

document.getElementById('refresh').addEventListener('click', updateUI);
document.getElementById('clear').addEventListener('click', async ()=>{
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript({ target: { tabId: tab.id }, func: ()=> window.AviatorHelper ? window.AviatorHelper.clearHistory() : null }, updateUI);
});

updateUI();
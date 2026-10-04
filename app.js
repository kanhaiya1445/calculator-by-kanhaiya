(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const expressionEl = $('#expression'), resultEl = $('#result'), angleEl = $('#angleMode'), memoryEl = $('#memoryIndicator'), statusEl = $('#statusMessage');
  const historyPanel = $('#historyPanel'), historyList = $('#historyList');
  let expr = '', result = '0', angleMode = 'DEG', memory = 0, justEvaluated = false, history = JSON.parse(localStorage.getItem('calcx-history') || '[]');

  const format = n => {
    if (!Number.isFinite(n)) throw new Error('Math error');
    if (Math.abs(n) < 1e-12) n = 0;
    return Number.isInteger(n) ? String(n) : Number(n.toPrecision(12)).toString();
  };
  const showStatus = msg => { statusEl.textContent = msg || ''; clearTimeout(showStatus.t); if(msg) showStatus.t=setTimeout(()=>statusEl.textContent='',1500); };
  const render = () => { expressionEl.textContent = expr || '0'; resultEl.textContent = result; angleEl.textContent = angleMode; memoryEl.classList.toggle('hidden', memory === 0); };
  const push = (v, kind='input') => {
    if (justEvaluated && (/[0-9.]|π|e/.test(v) || kind==='number')) expr='';
    justEvaluated=false; expr += v; render();
  };
  const clear = () => {expr=''; result='0'; justEvaluated=false; render();};
  const backspace = () => {expr=expr.slice(0,-1); render();};
  const toRad = x => angleMode==='DEG' ? x*Math.PI/180 : x;
  const factorial = n => { if(n<0 || !Number.isInteger(n) || n>170) throw new Error('Invalid factorial'); let r=1; for(let i=2;i<=n;i++) r*=i; return r; };

  function tokenize(s){
    s=s.replace(/π/g,'PI').replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-').replace(/mod/g,'%');
    s=s.replace(/\s+/g,'');
    const tokens=[]; let i=0;
    while(i<s.length){
      if(/[0-9.]/.test(s[i])){let j=i; while(j<s.length && /[0-9.eE+-]/.test(s[j])){if((s[j]=='+'||s[j]=='-') && j>i && !/[eE]/.test(s[j-1])) break; j++;} const n=Number(s.slice(i,j)); if(Number.isNaN(n)) throw new Error('Invalid number'); tokens.push(n); i=j;}
      else if(/[A-Za-z_]/.test(s[i])){let j=i;while(j<s.length&&/[A-Za-z_]/.test(s[j]))j++;tokens.push(s.slice(i,j));i=j;}
      else if('+-*/%^()'.includes(s[i])){tokens.push(s[i++]);}
      else throw new Error('Invalid character');
    } return tokens;
  }
  function evaluate(s){
    const t=tokenize(s); let p=0;
    const peek=()=>t[p]; const eat=x=>{if(t[p]===x)p++;else throw new Error('Syntax error');};
    const primary=()=>{let x=peek(); if(x==='-'){p++;return -primary();} if(x==='+'){p++;return primary();} if(x==='('){p++;let v=add();eat(')');return v;} if(x==='PI'){p++;return Math.PI;} if(x==='e'){p++;return Math.E;} if(typeof x==='number'){p++;return x;} throw new Error('Expected number');};
    const power=()=>{let a=primary(); if(peek()==='^'){p++;let b=power();a=Math.pow(a,b);}return a;};
    const mul=()=>{let a=power();while(['*','/','%'].includes(peek())){let op=t[p++],b=power();if(op==='*')a*=b;else if(op==='/'){if(b===0)throw new Error('Cannot divide by zero');a/=b;}else a%=b;}return a;};
    const add=()=>{let a=mul();while(peek()==='+'||peek()==='-'){let op=t[p++],b=mul();a=op==='+'?a+b:a-b;}return a;};
    const v=add(); if(p<t.length)throw new Error('Syntax error'); return v;
  }
  const evaluateCurrent=()=>{ if(!expr) return 0; return evaluate(expr); };
  const saveHistory=()=>{history.unshift({expr,result});history=history.slice(0,50);localStorage.setItem('calcx-history',JSON.stringify(history));renderHistory();};
  const calculate=()=>{try{const v=evaluateCurrent();result=format(v);saveHistory();justEvaluated=true;render();}catch(e){result='Error';showStatus(e.message);render();}};
  const applyUnary = (fn,name) => {try{const v=fn(evaluateCurrent());expr=name==='negate'?`(${format(v)})`:format(v);result=format(v);justEvaluated=true;render();saveHistory();}catch(e){result='Error';showStatus(e.message);render();}};

  function scientific(type){
    const x=()=>evaluateCurrent();
    const f={
      sin:()=>Math.sin(toRad(x())), cos:()=>Math.cos(toRad(x())), tan:()=>Math.tan(toRad(x())),
      log:()=>{if(x()<=0)throw new Error('Log domain error');return Math.log10(x());}, ln:()=>{if(x()<=0)throw new Error('Log domain error');return Math.log(x());},
      sqrt:()=>{if(x()<0)throw new Error('Square root domain error');return Math.sqrt(x());}, square:()=>x()**2, cube:()=>x()**3,
      reciprocal:()=>{if(x()===0)throw new Error('Cannot divide by zero');return 1/x();}, factorial:()=>factorial(x()), percent:()=>x()/100,
      negate:()=>-x(), abs:()=>Math.abs(x()), exp:()=>Math.exp(x()), tenpow:()=>10**x(), floor:()=>Math.floor(x()), ceil:()=>Math.ceil(x())
    };
    if(f[type])applyUnary(f[type],type);
  }
  function memoryAction(a){try{const v=evaluateCurrent(); if(a==='MC')memory=0; if(a==='MR')push(format(memory),'memory'); if(a==='MS')memory=v; if(a==='M+')memory+=v; if(a==='M-')memory-=v; render();showStatus(a);}catch(e){showStatus(e.message);}}
  function renderHistory(){if(!history.length){historyList.innerHTML='<div class="empty-history">No calculations yet.</div>';return;}historyList.innerHTML=history.map((h,i)=>`<div class="history-item" data-i="${i}"><div class="history-expr">${escapeHtml(h.expr)}</div><div class="history-result">${escapeHtml(h.result)}</div></div>`).join('');}
  const escapeHtml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  document.querySelector('.keypad').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const a=b.dataset.action,v=b.dataset.value;if(a==='clear')clear();else if(a==='backspace')backspace();else if(a==='equals')calculate();else if(a==='scientific')scientific(v);else if(a==='memory')memoryAction(v);else if(a==='openParen')push('(');else if(a==='closeParen')push(')');else if(a==='constant')push(v==='pi'?'π':'e');else if(v)push(v,/^[0-9.]$/.test(v)?'number':'input');});
  document.querySelector('.controls').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const a=b.dataset.action,v=b.dataset.value;if(a==='backspace')backspace();else if(a==='openParen')push('(');else if(a==='closeParen')push(')');else if(a==='constant')push(v==='pi'?'π':'e');});
  $('#angleBtn').onclick=()=>{angleMode=angleMode==='DEG'?'RAD':'DEG';render();showStatus(`${angleMode} mode`);};
  $('#themeBtn').onclick=()=>{const next=document.documentElement.dataset.theme==='light'?'dark':'light';document.documentElement.dataset.theme=next;localStorage.setItem('calcx-theme',next);};
  $('#historyBtn').onclick=()=>historyPanel.style.display=historyPanel.style.display==='none'?'flex':'';
  $('#clearHistory').onclick=()=>{history=[];localStorage.removeItem('calcx-history');renderHistory();};
  historyList.addEventListener('click',e=>{const item=e.target.closest('.history-item');if(!item)return;const h=history[Number(item.dataset.i)];expr=h.expr;result=h.result;justEvaluated=true;render();});
  document.addEventListener('keydown',e=>{const k=e.key;if(/^[0-9.]$/.test(k)){push(k,'number');e.preventDefault();return;}const map={'+':'+','-':'−','*':'×','/':'÷','%':'mod','^':'^','(': '(', ')':')'};if(map[k]){push(map[k]);e.preventDefault();return;}if(k==='Enter'||k==='='){calculate();e.preventDefault();return;}if(k==='Backspace'){backspace();e.preventDefault();return;}if(k==='Escape'){clear();e.preventDefault();return;}});
  document.documentElement.dataset.theme=localStorage.getItem('calcx-theme')||'dark'; renderHistory();render();
})();

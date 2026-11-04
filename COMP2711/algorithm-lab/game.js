/* Alice–Bob has an oracle-call cost model, separate from array comparisons. */
(function(){
'use strict';
const byId=id=>document.getElementById(id),E=SortingEngine;
const game={mode:'manual',n:16,secret:null,low:1,high:16,guess:null,reply:null,history:[],complete:false,trace:[],step:0,timer:null,initialized:false};
const code={
 linear:['for guess = 1 … n','  reply ← AskAlice(guess)','  if reply = correct','    return guess'],
 binary:['low ← 1; high ← n','while low ≤ high','  guess ← floor((low + high) / 2)','  reply ← AskAlice(guess)','  if reply = correct: return guess','  if reply = too small: low ← guess + 1','  else: high ← guess − 1']
};
function error(message){byId('game-error').hidden=!message;byId('game-error').textContent=message;}
function integer(text,min,max,label){if(!/^\d+$/.test(text.trim()))throw Error(`${label} must be an integer from ${min} to ${max}.`);const value=Number(text);if(!Number.isSafeInteger(value)||value<min||value>max)throw Error(`${label} must be from ${min} to ${max}.`);return value;}
function pause(){clearTimeout(game.timer);game.timer=null;byId('game-play').textContent=game.step===game.trace.length-1?'↶ Replay':'▶ Play';}
function start(mode){
 try{
  const n=integer(byId('game-n').value,1,64,'n');
  const secret=mode==='manual'?1+Math.floor(Math.random()*n):integer(byId('game-secret').value,1,n,'Alice’s secret');
  pause();Object.assign(game,{mode,n,secret,low:1,high:n,guess:null,reply:null,history:[],complete:false,step:0,initialized:true});
  game.trace=mode==='manual'?[]:E.guessing(n,secret,mode);
  error('');byId('game-guess-input').value='';render();
 }catch(e){error(e.message);}
}
function current(){return game.mode==='manual'?{...game,calls:game.history.length,message:game.complete?`Correct: ${game.secret}. ${game.history.length} ${game.history.length===1?'guess':'guesses'}, including the correct guess.`:game.history.length?'Use Alice’s reply to choose your next guess.':'Click a number or enter a guess.'}:game.trace[game.step];}
function render(){
 const s=current(),manual=game.mode==='manual';
 document.querySelectorAll('[data-game-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.gameMode===game.mode)));
 document.querySelector('.game-layout').classList.toggle('manual',manual);
 byId('game-secret-setting').hidden=manual;byId('game-code-panel').hidden=manual;byId('game-playback').hidden=manual;byId('game-guess-form').hidden=!manual;byId('game-apply').textContent=manual?'New game':'Apply';
 byId('alice-secret').textContent=manual&&!s.complete?'?':game.secret;
 byId('bob-name').textContent=manual?'Bob · you':'Bob';byId('bob-guess').textContent=s.guess??'—';
 byId('bob-question').textContent=s.guess===null?'Guess a number.':`← Is it ${s.guess}?`;
 byId('alice-reply').textContent=s.reply?`${s.reply==='correct'?'Correct!':s.reply==='too small'?'Too small.':'Too big.'} →`:s.guess===null?'Too small, too big, or correct.':'Awaiting Alice’s reply…';
 byId('alice-reply').classList.toggle('correct',s.reply==='correct');
 byId('game-candidates-label').textContent=s.complete?`Found: ${s.guess}`:`Candidates: ${s.low===s.high?s.low:`${s.low}…${s.high}`}`;
 byId('game-calls').textContent=s.calls;byId('game-status').textContent=s.message;
 byId('game-guess-input').placeholder=`1–${game.n}`;byId('game-guess-input').disabled=s.complete;byId('submit-guess').disabled=s.complete;
 byId('game-candidates').replaceChildren(...Array.from({length:game.n},(_,i)=>{
  const value=i+1,el=document.createElement(manual?'button':'div');
  const excluded=value<s.low||value>s.high,selected=value===s.guess;
  el.className='candidate'+(excluded?' excluded':'')+(selected?' chosen':'')+(s.complete&&selected?' correct':'');el.textContent=value;
  el.setAttribute('aria-label',`${manual?'Guess ':''}${value}${excluded?', ruled out':''}${s.complete&&selected?', correct':''}`);
  if(manual){el.type='button';el.disabled=s.complete;el.addEventListener('click',()=>guess(value));}return el;
 }));
 byId('game-history-body').replaceChildren(...s.history.map((item,i)=>{const tr=document.createElement('tr');for(const value of [i+1,item.guess,item.reply]){const td=document.createElement('td');td.textContent=value;tr.append(td);}return tr;}));
 if(!s.history.length){const tr=document.createElement('tr'),td=document.createElement('td');td.colSpan=3;td.textContent='No guesses yet.';tr.append(td);byId('game-history-body').append(tr);}
 if(!manual){
  byId('game-code').replaceChildren(...code[game.mode].map((text,i)=>{const li=document.createElement('li');li.textContent=text;li.className=i===s.line?'current':'';return li;}));
  byId('game-progress').textContent=`${game.step+1} / ${game.trace.length}`;byId('game-timeline').max=game.trace.length-1;byId('game-timeline').value=game.step;
  byId('game-back').disabled=game.step===0;byId('game-next').disabled=game.step===game.trace.length-1;
  byId('game-play').textContent=game.timer?'Ⅱ Pause':s.complete?'↶ Replay':'▶ Play';
 }
}
function guess(value){if(game.mode!=='manual'||game.complete)return;game.guess=value;game.reply=E.guessReply(game.secret,value);game.history.push({guess:value,reply:game.reply});if(game.reply==='correct'){game.low=game.high=value;game.complete=true;}else if(game.reply==='too small')game.low=Math.max(game.low,value+1);else game.high=Math.min(game.high,value-1);error('');render();}
function go(step){pause();game.step=Math.max(0,Math.min(step,game.trace.length-1));render();}
function play(){if(game.mode==='manual')return;if(game.timer){pause();return;}if(game.step===game.trace.length-1)game.step=0;const tick=()=>{if(game.step>=game.trace.length-1){pause();render();return;}game.step++;game.timer=setTimeout(tick,Number(byId('game-speed').value));render();};game.timer=setTimeout(tick,Number(byId('game-speed').value));render();}
byId('game-settings').addEventListener('submit',event=>{event.preventDefault();start(game.mode);});
byId('game-guess-form').addEventListener('submit',event=>{event.preventDefault();try{guess(integer(byId('game-guess-input').value,1,game.n,'Your guess'));}catch(e){error(e.message);}});
document.querySelectorAll('[data-game-mode]').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.gameMode!==game.mode)start(b.dataset.gameMode);}));
byId('game-restart').onclick=()=>go(0);byId('game-back').onclick=()=>go(game.step-1);byId('game-next').onclick=()=>go(game.step+1);byId('game-play').onclick=play;byId('game-timeline').oninput=e=>go(Number(e.target.value));byId('game-speed').onchange=()=>{if(game.timer){pause();play();}};
document.addEventListener('keydown',event=>{if(byId('game-section').hidden||game.mode==='manual'||/INPUT|SELECT|TEXTAREA|BUTTON/.test(event.target.tagName)||event.metaKey||event.ctrlKey||event.altKey)return;if(event.key===' '){event.preventDefault();play();}else if(event.key==='ArrowRight'){event.preventDefault();go(game.step+1);}else if(event.key==='ArrowLeft'){event.preventDefault();go(game.step-1);}});
window.GameLab={enter(){if(!game.initialized)start('manual');else render();},pause};
})();

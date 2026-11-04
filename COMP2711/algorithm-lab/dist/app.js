'use strict';
const $=id=>document.getElementById(id),E=SortingEngine;
const state={mode:'free',values:[4,2,5,1,3],binaryValues:[1,2,3,4,5,6,7,8],target:3,left:[1,4,7],right:[2,3,8],free:[],undo:[],trace:[],step:0,timer:null,drag:null};
const code={
 quick:[['QuickSort(low, high)'],['  if low ≥ high: return'],['  pivot ← A[high]  // save the last value'],['  nextSmall ← low'],['  for scan = low … high − 1'],['    if A[scan] < pivot'],['      swap A[scan], A[nextSmall]'],['      nextSmall ← nextSmall + 1'],['  swap A[nextSmall], A[high]'],['  QuickSort(low, nextSmall − 1)'],['  QuickSort(nextSmall + 1, high)'],['// Both sides and the pivot are now sorted.',1]],
 selection:[['// Remember both the value and its position.',1],['for i = 1 … n − 1'],['  nextMinPosition ← i'],['  nextMin ← A[i]'],['  for scan = i + 1 … n'],['    if A[scan] < nextMin'],['      nextMin ← A[scan]'],['      nextMinPosition ← scan'],['  if nextMinPosition ≠ i'],['    swap A[i], A[nextMinPosition]'],['// The array is now sorted.',1]],
 insertion:[['for i = 2 … n'],['  key ← A[i]'],['  j ← i − 1'],['  while j ≥ 1 and A[j] > key'],['    A[j + 1] ← A[j]  // shift right'],['    j ← j − 1'],['  A[j + 1] ← key'],['// The array is now sorted.',1]],
 bubble:[['for pass = 1 … n − 1'],['  for j = 1 … n − pass'],['    if A[j] > A[j + 1]'],['      swap A[j], A[j + 1]'],['  // One more final position.',1],['// The array is now sorted.',1]],
 linear:[['for i = 1 … n'],['  value ← A[i]'],['  if value = target'],['    return i'],['return NOT_FOUND']],
 binary:[['// A is sorted in nondecreasing order.',1],['low ← 1; high ← n'],['while low ≤ high'],['  mid ← floor((low + high) / 2)'],['  value ← A[mid]'],['  if value = target'],['    return mid'],['  if value < target'],['    low ← mid + 1'],['  else'],['    high ← mid − 1'],['return NOT_FOUND']],
 merge:[['// L and R must already be sorted.',1],['i ← 1; j ← 1'],['while both lists have unread values'],['  if L[i] ≤ R[j]'],['    append L[i]; i++'],['  else'],['    append R[j]; j++'],['append the remaining values'],['return output']],
 mergesort:[['MergeSort(numbers)'],['  if length ≤ 1: return numbers'],['  split into left and right halves'],['  sortedLeft ← MergeSort(left)'],['  sortedRight ← MergeSort(right)'],['  output ← Merge(sortedLeft, sortedRight)'],['  return output']]
};
const titles={quick:['','Quicksort','Last-value pivot · worst case Θ(n²)'],insertion:['','Insertion sort','Worst case Θ(n²)'],bubble:['','Bubble sort','Θ(n²)'],linear:['','Linear search','Worst case Θ(n)'],binary:['','Binary search','Worst case Θ(log n)'],selection:['FIND THE NEXT MINIMUM','Selection sort','Θ(n²)'],merge:['TWO SORTED LISTS → ONE','Merging','Θ(|L| + |R|)'],mergesort:['DIVIDE · SOLVE · COMBINE','Merge sort','Θ(n log n)']};
function messageError(text){$('error').hidden=!text;$('error').textContent=text;}
function parse(text,{empty=false}={}){if(!text.trim()){if(empty)return [];throw Error('Enter at least one integer.');}const tokens=text.trim().split(/[\s,]+/);if(tokens.some(t=>!/^[-+]?\d+$/.test(t)))throw Error('Use integers separated by commas or spaces.');const a=tokens.map(Number);if(a.length>12)throw Error('Use at most 12 cards so every step stays readable.');if(a.some(x=>!Number.isSafeInteger(x)||Math.abs(x)>999))throw Error('Choose integers between −999 and 999.');return a;}
function isSearch(){return state.mode==='linear'||state.mode==='binary';}
function syncInputs(){$('numbers').value=(state.mode==='binary'?state.binaryValues:state.values).join(', ');$('target').value=state.target;$('left-input').value=state.left.join(', ');$('right-input').value=state.right.join(', ');}
function pause(){clearTimeout(state.timer);state.timer=null;$('play').textContent=state.step===state.trace.length-1?'↶ Replay':'▶ Play';}
function buildTrace(){pause();const input=E.cards(state.mode==='binary'?state.binaryValues:state.values);switch(state.mode){case 'quick':state.trace=E.quickSort(input);break;case 'selection':state.trace=E.selection(input);break;case 'insertion':state.trace=E.insertion(input);break;case 'bubble':state.trace=E.bubble(input);break;case 'linear':state.trace=E.linearSearch(input,state.target);break;case 'binary':state.trace=E.binarySearch(input,state.target);break;case 'merge':{const cards=E.cards([...state.left,...state.right]);state.trace=E.merging(cards.slice(0,state.left.length),cards.slice(state.left.length));break;}default:state.trace=E.mergeSort(input);}state.step=0;}
function changeMode(mode){cleanupDrag();pause();GameLab.pause();messageError('');$('game-section').hidden=mode!=='guess';document.querySelector('.setup').hidden=mode==='guess';if(mode==='guess'){state.mode=mode;document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===mode)));$('free-section').hidden=true;$('guided-section').hidden=true;GameLab.enter();return;}if(state.mode==='free'&&mode!=='free'&&state.free.length){state.freeInput=[...state.values];if(['selection','insertion','bubble','quick','mergesort','linear'].includes(mode)){const a=orderedFree();if(!a.length&&mode!=='linear'){messageError('Put a value in A, or choose Line up.');return;}state.values=a;}}if(mode==='free'&&state.free.length&&state.freeInput)state.values=[...state.freeInput];state.mode=mode;document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===mode)));$('free-section').hidden=mode!=='free';$('guided-section').hidden=mode==='free';$('single-input').hidden=mode==='merge';$('merge-inputs').hidden=mode!=='merge';$('target-input').hidden=!isSearch();$('sort-search-input').hidden=mode!=='linear';$('numbers-label').textContent=mode==='binary'?'Numbers · sorted':'Numbers';syncInputs();if(mode==='free'){if(!state.free.length)resetFree();else renderFree();return;}buildTrace();renderGuided();}
function remember(){state.undo.push(JSON.parse(JSON.stringify(state.free)));if(state.undo.length>80)state.undo.shift();}
function layoutFree(){state.free.forEach((c,i)=>{c.bank='A';c.slot=i;});}
function resetFree(){state.free=E.cards(state.values).map((c,i)=>({...c,bank:'A',slot:i}));state.undo=[];renderFree();$('access-log').textContent='';}
function orderedFree(){return [...state.free].filter(c=>c.bank==='A').sort((a,b)=>a.slot-b.slot).map(c=>c.value);}
function freeStatus(){$('undo').disabled=!state.undo.length;}
function renderFree(){cleanupDrag();const board=$('free-board');board.replaceChildren();for(const bank of ['A','B']){const row=document.createElement('div');row.className='memory-bank';row.innerHTML=`<p class="row-label">${bank==='A'?'A · INPUT ARRAY':'B · WORKSPACE'}</p>`;const slots=document.createElement('div');slots.className='memory-row';for(let i=0;i<state.values.length;i++){const slot=document.createElement('div');slot.className='memory-slot';slot.dataset.bank=bank;slot.dataset.slot=i;slot.innerHTML=`<span class="empty-slot">empty</span><span class="address">${bank}[${i+1}]</span>`;const c=state.free.find(c=>c.bank===bank&&c.slot===i);if(c){const el=document.createElement('button');el.type='button';el.className='number-card free-card';el.dataset.id=c.id;el.setAttribute('aria-label',`Value ${c.value} in ${bank}[${i+1}]. Drag or use arrow keys to move.`);el.innerHTML=`${c.value}<span class="identity">${String.fromCharCode(97+c.id)}</span>`;el.addEventListener('pointerdown',startDrag);el.addEventListener('keydown',moveByKey);slot.append(el);}slots.append(slot);}row.append(slots);board.append(row);}freeStatus();}
function transfer(id,bank,index){const c=state.free.find(c=>c.id===id);if(!c||c.bank===bank&&c.slot===index)return;remember();const other=state.free.find(x=>x.bank===bank&&x.slot===index),source=`${c.bank}[${c.slot+1}]`,target=`${bank}[${index+1}]`,oldBank=c.bank,oldSlot=c.slot;c.bank=bank;c.slot=index;if(other){other.bank=oldBank;other.slot=oldSlot;$('access-log').textContent=`Read ${source} → ${c.value}; read ${target} → ${other.value}. Write ${source} ← ${other.value}; write ${target} ← ${c.value}. 2 reads, 2 writes.`;}else $('access-log').textContent=`Read ${source} → ${c.value}. Write ${target} ← ${c.value}; clear ${source}. The source slot is now empty.`;renderFree();const dest=document.querySelector(`.free-card[data-id="${id}"]`);dest?.focus({preventScroll:true});}
function cleanupDrag(){
 const d=state.drag;state.drag=null;
 window.removeEventListener('pointermove',drag,true);
 window.removeEventListener('pointerup',endDrag,true);
 window.removeEventListener('pointercancel',cancelDrag,true);
 if(d){d.el.removeEventListener('lostpointercapture',cancelDrag);d.el.classList.remove('dragging');if(d.el.hasPointerCapture?.(d.pointerId))d.el.releasePointerCapture(d.pointerId);d.ghost.remove();}
 document.querySelectorAll('.drag-ghost').forEach(el=>el.remove());
 document.querySelectorAll('.drop-target').forEach(el=>el.classList.remove('drop-target'));
 return d;
}
function cancelDrag(event){if(event?.pointerId!==undefined&&state.drag&&event.pointerId!==state.drag.pointerId)return;cleanupDrag();}
function startDrag(event){
 if(event.button!==0||event.isPrimary===false)return;
 cleanupDrag();event.preventDefault();
 const el=event.currentTarget,rect=el.getBoundingClientRect(),ghost=el.cloneNode(true);
 ghost.className='number-card drag-ghost';ghost.removeAttribute('id');ghost.removeAttribute('data-id');ghost.tabIndex=-1;ghost.setAttribute('aria-hidden','true');ghost.inert=true;
 ghost.style.width=rect.width+'px';ghost.style.height=rect.height+'px';ghost.style.left=rect.left+'px';ghost.style.top=rect.top+'px';
 state.drag={id:Number(el.dataset.id),pointerId:event.pointerId,el,offsetX:event.clientX-rect.left,offsetY:event.clientY-rect.top,ghost};
 document.body.append(ghost);el.classList.add('dragging');
 // Listen above the cards: swapping replaces their DOM nodes.
 window.addEventListener('pointermove',drag,true);window.addEventListener('pointerup',endDrag,true);window.addEventListener('pointercancel',cancelDrag,true);
 el.addEventListener('lostpointercapture',cancelDrag);
 try{el.setPointerCapture(event.pointerId);}catch{cleanupDrag();}
}
function drag(event){
 const d=state.drag;if(!d||event.pointerId!==d.pointerId)return;
 if(event.pointerType==='mouse'&&event.buttons===0){cleanupDrag();return;}
 d.ghost.style.left=(event.clientX-d.offsetX)+'px';d.ghost.style.top=(event.clientY-d.offsetY)+'px';
 document.querySelectorAll('.drop-target').forEach(el=>el.classList.remove('drop-target'));
 document.elementFromPoint(event.clientX,event.clientY)?.closest('.memory-slot')?.classList.add('drop-target');
}
function endDrag(event){
 if(!state.drag||event.pointerId!==state.drag.pointerId)return;
 const slot=document.elementFromPoint(event.clientX,event.clientY)?.closest('.memory-slot');
 const destination=slot?{bank:slot.dataset.bank,index:Number(slot.dataset.slot)}:null;
 const d=cleanupDrag();
 if(destination)transfer(d.id,destination.bank,destination.index);
 else d.el.focus({preventScroll:true});
}
window.addEventListener('blur',()=>cleanupDrag());
document.addEventListener('visibilitychange',()=>{if(document.hidden)cleanupDrag();});
document.addEventListener('keydown',event=>{if(event.key==='Escape')cleanupDrag();});
function moveByKey(event){if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;event.preventDefault();const id=Number(event.currentTarget.dataset.id),c=state.free.find(c=>c.id===id);let bank=c.bank,index=c.slot;if(event.key==='ArrowLeft')index--;if(event.key==='ArrowRight')index++;if(event.key==='ArrowUp')bank='A';if(event.key==='ArrowDown')bank='B';if(index>=0&&index<state.values.length)transfer(id,bank,index);}
function card(c,classes='',key=''){return `<div class="number-card ${classes}" data-key="${key}${c.id}" aria-label="${c.value}">${c.value}<span class="identity">${String.fromCharCode(97+c.id)}</span></div>`;}
function pointer(label,key,address){return `<div class="position-pointer" data-key="${key}" aria-label="${label} points to ${address}"><span>${label}</span><i aria-hidden="true"></i></div>`;}
function mergeHTML(m){
 const source=(arr,index,label)=>`<div class="list-group"><p class="row-label">${label==='L'?'Left list':'Right list'}</p><div class="card-row pointer-row">${arr.map((c,k)=>`<div class="guided-slot">${k===index?pointer(label==='L'?'i':'j','pointer-'+label,`${label}[${k+1}]`):''}<span class="address">${label}[${k+1}]</span>${card(c,k<index?'consumed':m.compare.includes(c.id)?'compare':k===index?'active':'',label)}</div>`).join('')}${index===arr.length?`<div class="guided-slot end-slot">${pointer(label==='L'?'i':'j','pointer-'+label,`${label}[${index+1}], end of list`)}<span class="end-label">end</span><span class="address">${label}[${index+1}]</span></div>`:''}</div></div>`;
 return `<div class="merge-sources">${source(m.left,m.i,'L')}${source(m.right,m.j,'R')}</div><div class="output-row"><p class="row-label">Output · ${m.output.length} values written</p><div class="card-row">${Array.from({length:m.left.length+m.right.length},(_,k)=>`<div class="guided-slot"><span class="address">O[${k+1}]</span>${m.output[k]?card(m.output[k],'done','out'):'<span class="output-empty">·</span>'}</div>`).join('')}</div></div>`;
}
function treeHTML(s){
 const n=state.values.length,depth=Math.max(...s.nodes.map(x=>x.depth));
 let tree=`<div class="tree" style="min-width:${Math.max(520,n*82)}px">`;
 for(let d=0;d<=depth;d++){
  tree+='<div class="tree-level" style="position:relative;min-height:78px">';
  for(const node of s.nodes.filter(x=>x.depth===d))tree+=`<div class="tree-node ${node.key===s.active?'current':''} ${node.complete?'complete':''}" style="position:absolute;left:${100*node.start/n}%;width:${100*node.size/n}%"><div class="node-cards">${node.values.map(c=>`<span class="mini-card">${c.value}</span>`).join('')}</div><small>${node.complete?'sorted':`size ${node.size}`}</small></div>`;
  tree+='</div>';
 }
 tree+='</div>';
 const node=s.nodes.find(node=>node.key===s.active);
 const width=s.merge?Math.max(520,(s.merge.left.length+s.merge.right.length)*86+20,Math.max(s.merge.left.length,s.merge.right.length)*172+36):Math.max(520,node.values.length*118);
 const detail=s.merge?mergeHTML(s.merge):`<div class="card-row">${node.values.map(c=>card(c,node.complete?'done':'active','current-')).join('')}</div>`;
 return `<div class="merge-sort-view"><section class="tree-pane" aria-label="Recursion tree"><h3>Recursion tree</h3><div class="tree-scroll">${tree}</div></section><section class="merge-detail" aria-label="Current recursive call"><h3>${s.merge?'Active merge':node.complete?'Sorted group':'Current group'}</h3><div class="merge-scroll"><div class="merge-content" style="min-width:${width}px">${detail}</div></div></section></div>`;
}
function arrayHTML(s){
 const search=s.kind==='linear'||s.kind==='binary';if(search)$('stage').style.setProperty('--search-card-width',Math.max(72,...s.array.map(c=>String(c.value).length*24+12))+'px');
 const heading=s.kind==='bubble'&&!s.complete?`Array · pass ${s.pass||1}`:`Array · n = ${s.array.length}`;
 let html=`${search?`<div class="search-summary"><span>Target <strong>${s.target}</strong></span>${s.kind==='binary'?`<span>${s.low<=s.high?`Search A[${s.low}…${s.high}]`:`Empty interval: low = ${s.low}, high = ${s.high}`}</span>`:''}</div>`:''}<p class="row-label">${heading}</p><div class="card-row pointer-row ${s.kind==='selection'?'selection-array':''}">`;
 html+=s.array.map((c,index)=>{
  const pos=index+1,labels=[];let style='',mark='';
  if(s.kind==='selection'){if(pos===s.currentPosition)labels.push('i');if(pos===s.nextMinPosition)labels.push('nextMinPosition');style=index<s.fixed?'done':s.compare.includes(c.id)?'compare':c.id===s.minimum?'active':'';if(index<s.fixed)mark=' ✓';}
  if(s.kind==='insertion'){if(pos===s.currentPosition)labels.push('i');if(pos===s.scan)labels.push('j');style=s.complete?'done':s.compare.includes(pos)?'compare':s.written===pos?'active':index<s.sortedPrefix?'done':'';}
  if(s.kind==='bubble'){if(pos===s.scan)labels.push('j');if(s.scan!==null&&pos===s.scan+1)labels.push('j+1');style=index>=s.array.length-s.fixed?'done':s.compare.includes(pos)?'compare':'';}
  if(s.kind==='linear'){if(pos===s.currentPosition)labels.push('i');style=pos===s.found?'done':pos===s.currentPosition&&s.comparing?'compare':pos===s.currentPosition?'active':pos<=s.checked?'ruled-out':'';if(pos===s.found)mark=' ✓';}
  if(s.kind==='binary'){if(s.low<=s.high){if(pos===s.low)labels.push('low');if(pos===s.mid)labels.push('mid');if(pos===s.high)labels.push('high');}style=pos===s.found?'done':pos===s.mid&&s.comparing?'compare':pos===s.mid?'active':pos<s.low||pos>s.high?'ruled-out':'';if(pos===s.found)mark=' ✓';}
  const label=labels.join('\n');
  // A shifted insertion-sort value can temporarily occupy two slots.
  const identity=s.kind==='insertion'?`slot-${pos}-`:'array';
  return `<div class="card-wrap guided-slot ${s.kind==='binary'&&pos>=s.low&&pos<=s.high?'search-range':''}">${label?pointer(label,s.kind==='selection'&&labels.includes('nextMinPosition')?'pointer-minimum':`pointer-${labels.join('-')}`,`A[${pos}]`):''}${card(c,style,identity)}<span class="index">A[${pos}]${mark}</span></div>`;
 }).join('');
 if(!s.array.length)html+='<span class="placeholder">Empty array</span>';
 html+='</div>';
 if(s.kind==='selection'||s.kind==='insertion'){
  const name=s.kind==='selection'?'nextMin':'key',value=s.kind==='selection'?s.nextMin:s.key?.value;
  html+=`<div class="stored-variables"><div class="stored-variable ${s.compare.length?'reading':''}"><span class="variable-name">${name}</span><strong>${value==null?'—':value}</strong><span class="variable-meaning">${s.kind==='selection'?'smallest value found so far':'saved value to insert'}</span></div></div>`;
 }
 return html;
}
function quickHTML(s){
 if(s.buckets)return bucketQuickHTML(s);
 const depth=s.stack.length-1;
 const depthRows=s.stack.map((r,i)=>{
  const empty=r.low>r.high;
  const left=100*(r.low-1)/Math.max(1,s.array.length);
  const width=100*Math.max(0,r.high-r.low+1)/Math.max(1,s.array.length);
  return `<div class="quick-depth-row ${i===depth?'current':''}"><span>Depth ${i}</span><div class="quick-depth-track"><span class="quick-depth-bar" style="left:${left}%;width:${width}%"></span></div><span>${empty?'Empty':`A[${r.low}…${r.high}]`}</span></div>`;
 }).join('');
 const depthView=`<section class="quick-depth" aria-label="Quicksort recursion depth"><h3>Recursion depth: ${depth<0?(s.complete?'Complete':'Not started'):depth}</h3>${depthRows}</section>`;
 const breadcrumb=s.stack.filter(r=>r.low<=r.high).map(r=>`A[${r.low}…${r.high}]`).join(' → ');
 let html=`<div class="quick-summary"><span>${breadcrumb||'Quicksort'}</span><span>Pivot <strong>${s.pivot??'—'}</strong></span></div><div class="card-row pointer-row quick-array">`;
 html+=s.array.map((c,i)=>{
  const pos=i+1,labels=[];let region='',style='';
  if(pos===s.scan)labels.push('scan');if(pos===s.nextSmall)labels.push('nextSmall');if(pos===s.pivotPosition)labels.push('pivot');
  if(s.fixed.includes(pos)){style='done';region='fixed';}
  else if(s.phase==='partition'&&pos>=s.low&&pos<=s.high){
   if(pos===s.pivotPosition){style='active';region='pivot';}
   else if(pos<s.nextSmall){region='< pivot';style='quick-smaller';}
   else if(s.scan!==null&&pos<s.scan){region='≥ pivot';style='quick-larger';}
   else region='unread';
  }
  if(s.compare.includes(pos))style='compare';
  return `<div class="card-wrap guided-slot ${pos>=s.low&&pos<=s.high?'quick-range':''}">${labels.length?pointer(labels.join('\n'),'quick-pointer-'+labels.join('-'),`A[${pos}]`):''}${card(c,style,'quick-card-')}<span class="index">A[${pos}]</span><span class="quick-region">${region}</span></div>`;
 }).join('');
 return html+'</div>'+depthView;
}
function renderGuided(){$('guided-section').classList.toggle('quick-mode',state.mode==='quick');$('legend-active').textContent=isSearch()?'Current':'Selected';$('legend-done').textContent=isSearch()?'Found':state.mode==='insertion'?'Sorted prefix':'Finished';$('guided-section').classList.toggle('merge-sort-mode',['mergesort','quick'].includes(state.mode));$('guided-section').classList.toggle('search-mode',isSearch());const s=state.trace[state.step];if(!s)return;const [kicker,title,cost]=titles[state.mode];$('cost').textContent=cost;$('explanation').textContent=s.message;$('comparisons').textContent=s.comparisons;$('moves').textContent=isSearch()?s.reads:s.moves;$('moves-label').textContent=isSearch()?'array reads':state.mode==='insertion'?'array writes':['selection','bubble','quick'].includes(state.mode)?'swaps':'values copied';$('progress-text').textContent=`${state.step+1} / ${state.trace.length}`;$('timeline').max=state.trace.length-1;$('timeline').value=state.step;$('back').disabled=state.step===0;$('next').disabled=state.step===state.trace.length-1;
 const explanationPanel=$('explanation').parentElement;
 if(state.mode==='quick')$('stage').before(explanationPanel);
 else $('stage').after(explanationPanel);
 const old=new Map([...$('stage').querySelectorAll('[data-key]')].map(el=>[el.dataset.key,el.getBoundingClientRect()]));
 if(state.mode==='quick')$('stage').innerHTML=quickHTML(s);else if(['selection','insertion','bubble','linear','binary'].includes(state.mode))$('stage').innerHTML=arrayHTML(s);else if(state.mode==='merge')$('stage').innerHTML=mergeHTML(s);else $('stage').innerHTML=treeHTML(s);
 if(!matchMedia('(prefers-reduced-motion: reduce)').matches)$('stage').querySelectorAll('[data-key]').forEach(el=>{const before=old.get(el.dataset.key),after=el.getBoundingClientRect();if(before&&Math.abs(before.x-after.x)+Math.abs(before.y-after.y)>1)el.animate([{transform:`translate(${before.x-after.x}px,${before.y-after.y}px)`},{transform:'translate(0,0)'}],{duration:300,easing:'ease-out'});});
 $('code').replaceChildren(...code[state.mode].map(([text,comment],i)=>{
  const li=document.createElement('li'),content=document.createElement('span');
  content.className='code-content';
  text.split('\n').forEach((line,j)=>{
   if(j)content.append(document.createElement('br'));
   const part=document.createElement('span');
   part.textContent=line;
   if(line.trimStart().startsWith('//'))part.className='code-explanation';
   content.append(part);
  });
  li.append(content);
  li.className=(comment?'comment ':'')+((Array.isArray(s.line)?s.line.includes(i):i===s.line)?'current':'');
  return li;
 }));
 $('play').textContent=state.timer?'Ⅱ Pause':s.complete?'↶ Replay':'▶ Play';
}
function bucketQuickHTML(s){
 $('moves-label').textContent='bucket placements';
 const row=(items,highlight=false)=>items.map((c,i)=>{
  if(!highlight)return card(c,s.fixed.some(pos=>s.array[pos-1].id===c.id)?'done':'','bucket-');
  const isPivot=c.id===s.pivotId;
  const label=[isPivot?'pivot':'',c.id===s.scan?'i = '+(i+1):''].filter(Boolean).join(' / ');
  return `<div class="scan-card"><span class="scan-label ${isPivot?'pivot-label':''}" ${label?`aria-label="${label} points to value ${c.value}"`:''}>${label?label+' ↓':''}</span>${card(c,isPivot?'active':c.id===s.scan?'compare':'','source-')}</div>`;
 }).join('')||'<span>Empty</span>';

 const groups=[['< pivot',s.buckets[0]],['= pivot',s.buckets[1]],['> pivot',s.buckets[2]]].map(([name,items])=>`<div class="bucket-group"><h3>${name.replace('<','&lt;').replace('>','&gt;')}</h3><div class="card-row">${row(items)}</div></div>`).join('');
const main=s.array.map((c,i)=>`<div class="quick-main-slot ${!s.complete&&i+1>=s.low&&i+1<=s.high?'in-call':''}">${card(c,s.fixed.includes(i+1)?'done':'','result-')}<small>A[${i+1}]</small></div>`).join('');
 const showPartition=!s.complete&&!['recurse','return'].includes(s.phase);
 return `<div class="quick-focus-layout"><section class="quick-focus-arrays"><div class="quick-array-scroll"><h3>Main array</h3><div class="quick-aligned-row" style="--slots:${Math.max(1,s.array.length)}">${main}</div><div class="quick-partition-placeholder" style="visibility:${showPartition?'visible':'hidden'}" aria-hidden="${!showPartition}"><h3>Active subarray · depth ${Math.max(0,s.stack.length-1)}</h3><div class="quick-aligned-row quick-active-row" style="--slots:${Math.max(1,s.array.length)}">${Array.from({length:Math.max(0,s.low-1)},()=>'<div aria-hidden="true"></div>').join('')}${s.input.length?row(s.input,true):'<span class="quick-empty-call">Empty interval</span>'}</div></div></div><div class="bucket-groups" style="visibility:${showPartition?'visible':'hidden'}" aria-hidden="${!showPartition}">${groups}</div></section><aside class="quick-call-outline"><h3>Recursive calls</h3>${quickRecursionTree(s)}</aside></div>`;
}
function quickRecursionTree(s){
 const nodes=s.nodes||[];
 const render=n=>{
  const children=nodes.filter(c=>c.parent===n.key);
  const active=!s.complete&&n.key===s.activeNode;
  return `<li><span class="quick-call-label ${active?'current':''}" ${active?'aria-current="step"':''}>${n.side?n.side+' → ':'Root · '}A[${n.low}, ${n.high}]${n.low>n.high?' (empty)':''} <small>${active?'current':n.done?'sorted':n.pending?'pending':''}</small></span>${children.length?'<ul>'+children.map(render).join('')+'</ul>':''}</li>`;
 };
 return '<ul class="quick-calls">'+nodes.filter(n=>!n.parent).map(render).join('')+'</ul>';
}

function go(step){pause();state.step=Math.max(0,Math.min(step,state.trace.length-1));renderGuided();}
function play(){if(state.timer){pause();return;}if(state.step===state.trace.length-1)state.step=0;const tick=()=>{if(state.step>=state.trace.length-1){pause();renderGuided();return;}state.step++;state.timer=setTimeout(tick,Number($('speed').value));renderGuided();};state.timer=setTimeout(tick,Number($('speed').value));renderGuided();}
$('input-form').addEventListener('submit',event=>{event.preventDefault();try{
 if(state.mode==='merge'){
  const left=parse($('left-input').value,{empty:true}),right=parse($('right-input').value,{empty:true});
  if(!left.length&&!right.length)throw Error('Add a value to at least one list.');if(left.length+right.length>12)throw Error('Use at most 12 cards across both lists.');
  if(!E.sorted(E.cards(left))||!E.sorted(E.cards(right)))throw Error('Merging requires two sorted lists. Arrange each list in nondecreasing order.');state.left=left;state.right=right;
 }else{
  const values=parse($('numbers').value,{empty:isSearch()});let target=state.target;
  if(isSearch()){const targets=parse($('target').value);if(targets.length!==1)throw Error('Enter exactly one target number.');target=targets[0];}
  if(state.mode==='binary'&&!E.sorted(E.cards(values)))throw Error('Binary search requires a sorted list. Enter values in nondecreasing order.');
  if(state.mode==='binary')state.binaryValues=values;else state.values=values;state.target=target;
 }
 messageError('');syncInputs();if(state.mode==='free')resetFree();else{state.free=[];buildTrace();renderGuided();}
 }catch(error){messageError(error.message);}});
$('sort-search-input').onclick=()=>{try{
 const values=parse($('numbers').value,{empty:true});const targets=parse($('target').value);
 if(targets.length!==1)throw Error('Enter exactly one target number.');
 state.values=[...values].sort((a,b)=>a-b);state.target=targets[0];state.free=[];
 messageError('');syncInputs();buildTrace();renderGuided();
 }catch(error){messageError(error.message);}};
document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>changeMode(b.dataset.mode)));
$('example').onchange=event=>{const presets={five:[4,2,5,1,3],reverse:[8,7,6,5,4,3,2,1],duplicates:[3,1,3,2,1,2],random:Array.from({length:8},()=>Math.floor(Math.random()*19)+1)};const a=presets[event.target.value];if(!a)return;if(state.mode==='merge'){const mid=Math.floor(a.length/2);state.left=a.slice(0,mid).sort((a,b)=>a-b);state.right=a.slice(mid).sort((a,b)=>a-b);}else if(state.mode==='binary')state.binaryValues=[...a].sort((a,b)=>a-b);else state.values=a;messageError('');syncInputs();if(state.mode==='free')resetFree();else{state.free=[];buildTrace();renderGuided();}event.target.value='';};
$('undo').onclick=()=>{if(state.undo.length){state.free=state.undo.pop();renderFree();$('access-log').textContent='Restored the previous slot contents.';}};
$('tidy').onclick=()=>{remember();state.free.sort((a,b)=>a.bank.localeCompare(b.bank)||a.slot-b.slot);layoutFree();renderFree();$('access-log').textContent='Packed the values into consecutive A slots, preserving their row order.';};
$('reset-free').onclick=resetFree;
$('restart').onclick=()=>go(0);$('back').onclick=()=>go(state.step-1);$('next').onclick=()=>go(state.step+1);$('play').onclick=play;$('timeline').oninput=e=>go(Number(e.target.value));$('speed').onchange=()=>{if(state.timer){pause();play();}};
$('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{$('fullscreen').textContent='Use your browser’s full-screen view';}};document.addEventListener('fullscreenchange',()=>{$('fullscreen').textContent='⛶';});
document.addEventListener('keydown',event=>{if(state.mode==='free'||state.mode==='guess'||/INPUT|SELECT|TEXTAREA|BUTTON/.test(event.target.tagName)||event.metaKey||event.ctrlKey||event.altKey)return;if(event.key===' '){event.preventDefault();play();}else if(event.key==='ArrowRight'){event.preventDefault();go(state.step+1);}else if(event.key==='ArrowLeft'){event.preventDefault();go(state.step-1);}});
let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{if(state.mode==='free')renderFree();},150);});
E.quickSort=E.bucketQuickSort;
code.quick=[['QuickSort(A)'],['  if length(A) ≤ 1: return A'],['  choose pivot from A'],['  smaller, equal, larger ← empty lists'],['  for each value in A'],['    copy to smaller (<), equal (=), or larger (>)'],['  combine smaller + equal + larger\n  // All equal values are now in final sorted positions.\n  // Sort only the smaller and larger groups.'],['  left ← QuickSort(smaller)'],['  right ← QuickSort(larger)'],['  return left + equal + right']];
titles.quick=['','Quicksort','Median pivot (demo) · partition comparisons shown'];
changeMode('free');

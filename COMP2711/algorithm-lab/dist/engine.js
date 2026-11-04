/* Pure algorithm traces: every snapshot owns its arrays, so rewind is exact. */
(function(root){
'use strict';
const clone=x=>JSON.parse(JSON.stringify(x));
const cards=values=>values.map((value,id)=>({value,id}));
const sorted=a=>a.every((v,i)=>!i||a[i-1].value<=v.value);
function selection(input){
 const a=clone(input),states=[];let comparisons=0,moves=0,nextMin=null,nextMinPosition=null,currentPosition=null;
 const push=(message,line,extra={})=>states.push({kind:'selection',array:clone(a),comparisons,moves,line,message,fixed:0,compare:[],minimum:null,currentPosition,nextMin,nextMinPosition:nextMinPosition===null?null:nextMinPosition+1,...extra});
 push('Keep both the smallest value found so far and the position where it was found.',0);
 for(let position=0;position<a.length-1;position++){
  currentPosition=position+1;nextMinPosition=position;nextMin=a[position].value;
  push(`Read A[${position+1}] = ${nextMin}. Store nextMin = ${nextMin} and nextMinPosition = ${position+1}.`,[2,3],{fixed:position,minimum:a[position].id});
  for(let scan=position+1;scan<a.length;scan++){
   comparisons++;
   push(`Read A[${scan+1}] = ${a[scan].value}. Compare it with the stored nextMin = ${nextMin}.`,5,{fixed:position,minimum:a[nextMinPosition].id,compare:[a[scan].id],scan:scan+1});
   if(a[scan].value<nextMin){nextMin=a[scan].value;nextMinPosition=scan;
    push(`${nextMin} is smaller. Store nextMin = ${nextMin} and nextMinPosition = ${scan+1}.`,[6,7],{fixed:position,minimum:a[scan].id});
   }
  }
  if(nextMinPosition!==position){const x=a[position].value;[a[position],a[nextMinPosition]]=[a[nextMinPosition],a[position]];moves++;push(`Use nextMinPosition = ${nextMinPosition+1} to swap ${nextMin} into A[${position+1}], exchanging it with ${x}.`,9,{fixed:position+1});}
  else push(`nextMinPosition is already ${position+1}. No swap is needed.`,8,{fixed:position+1});
 }
 nextMin=null;nextMinPosition=null;currentPosition=null;
 push(`Sorted. ${comparisons} value comparisons and ${moves} ${moves===1?'swap':'swaps'}.`,10,{fixed:a.length,complete:true});return states;
}
function merging(left,right){
 if(!sorted(left)||!sorted(right))throw new Error('Both input lists must be in nondecreasing order.');
 let i=0,j=0,comparisons=0,moves=0;const output=[],states=[];
 const push=(message,line,extra={})=>states.push({kind:'merge',left:clone(left),right:clone(right),i,j,output:clone(output),comparisons,moves,line,message,compare:[],...extra});
 push('Both lists are sorted. Compare their first unread values.',0);
 while(i<left.length&&j<right.length){
  comparisons++;push(`Compare ${left[i].value} on the left with ${right[j].value} on the right.`,3,{compare:[left[i].id,right[j].id]});
  const tied=left[i].value===right[j].value;const takeLeft=left[i].value<=right[j].value;const chosen=takeLeft?left[i++]:right[j++];output.push(chosen);moves++;
  push(`Append ${chosen.value} from the ${takeLeft?'left':'right'} list.${tied?' Equal values are taken from the left first.':''}`,takeLeft?4:6);
 }
 while(i<left.length||j<right.length){const chosen=i<left.length?left[i++]:right[j++];output.push(chosen);moves++;push(`One list is exhausted. Append ${chosen.value} from the remaining list.`,7);}
 push(`Merged ${output.length} values using ${comparisons} value comparisons.`,8,{complete:true});return states;
}
function mergeSort(input){
 const states=[],nodes=[];let comparisons=0,moves=0,active=null;
 function push(message,line,extra={}){states.push({kind:'mergesort',nodes:clone(nodes),active,comparisons,moves,message,line,merge:null,...extra});}
 function run(a,start,depth,parent){
  const node={key:`${start}:${a.length}`,start,size:a.length,depth,parent,values:clone(a),complete:false};nodes.push(node);active=node.key;
  push(`Sort [${a.map(c=>c.value).join(', ')}].`,0);
  if(a.length<=1){node.complete=true;push('A single value is already sorted. Return it.',1);return a;}
  const middle=Math.floor(a.length/2);
  push(`Divide ${a.length} values into groups of ${middle} and ${a.length-middle}.`,2);
  push(`Recursively sort the left half.`,3);
  const left=run(a.slice(0,middle),start,depth+1,node.key);
  active=node.key;push(`Recursively sort the right half.`,4);
  const right=run(a.slice(middle),start+middle,depth+1,node.key);
  active=node.key;const trace=merging(left,right),baseComparisons=comparisons,baseMoves=moves;
  for(const m of trace){comparisons=baseComparisons+m.comparisons;moves=baseMoves+m.moves;push(m.message,5,{merge:m});}
  node.values=clone(trace.at(-1).output);node.complete=true;
  push(`Return the sorted group [${node.values.map(c=>c.value).join(', ')}].`,6);
  return node.values;
 }
 const output=run(clone(input),0,0,null);active=nodes[0].key;
 push(`Sorted. ${comparisons} value comparisons; ${moves} values copied across all merges.`,6,{complete:true,output});return states;
}
function insertion(input){
 const a=clone(input),states=[];let comparisons=0,moves=0,currentPosition=null,scan=null,key=null;
 const push=(message,line,extra={})=>states.push({kind:'insertion',array:clone(a),comparisons,moves,currentPosition,scan,key:clone(key),message,line,compare:[],sortedPrefix:0,...extra});
 push('Save the next value, shift larger values right, then insert it into the gap.',0,{sortedPrefix:Math.min(1,a.length)});
 for(let i=1;i<a.length;i++){
  currentPosition=i+1;key=clone(a[i]);scan=i;
  push(`Save A[${i+1}] = ${key.value} as key. The first ${i} ${i===1?'value is':'values are'} sorted.`,[1,2],{sortedPrefix:i});
  while(scan>=1){
   comparisons++;const value=a[scan-1].value;
   push(`Compare A[${scan}] = ${value} with key = ${key.value}.`,3,{compare:[scan],sortedPrefix:scan});
   if(value<=key.value){push(`${value} ≤ ${key.value}. Insert after this position.`,3,{sortedPrefix:scan});break;}
   a[scan]=clone(a[scan-1]);moves++;
   push(`Copy ${value} from A[${scan}] to A[${scan+1}]. key = ${key.value} stays saved.`,4,{written:scan+1,sortedPrefix:scan});
   scan--;push(scan?`Move j left to ${scan}.`:'j = 0: stop at the beginning of the array.',5,{sortedPrefix:scan});
  }
  a[scan]=clone(key);moves++;
  push(`Write key = ${key.value} into A[${scan+1}]. The first ${i+1} values are sorted.`,6,{written:scan+1,sortedPrefix:i+1});
 }
 key=null;currentPosition=null;scan=null;
 push(`Sorted. ${comparisons} value comparisons and ${moves} array writes.`,7,{sortedPrefix:a.length,complete:true});return states;
}
function bubble(input){
 const a=clone(input),states=[];let comparisons=0,moves=0,scan=null,pass=0,fixed=0;
 const push=(message,line,extra={})=>states.push({kind:'bubble',array:clone(a),comparisons,moves,scan,pass,fixed,message,line,compare:[],...extra});
 push('Compare neighbors and swap them when they are out of order.',0);
 for(pass=1;pass<a.length;pass++){
  scan=1;push(`Pass ${pass}: move the largest remaining value to position ${a.length-pass+1}.`,0);
  for(let j=0;j<a.length-pass;j++){
   scan=j+1;comparisons++;
   push(`Compare A[${j+1}] = ${a[j].value} with A[${j+2}] = ${a[j+1].value}.`,2,{compare:[j+1,j+2]});
   if(a[j].value>a[j+1].value){[a[j],a[j+1]]=[a[j+1],a[j]];moves++;push('The pair is out of order. Swap the two values.',3);}
   else push('The pair is already in order. No swap.',2);
  }
  fixed=pass;scan=null;push(`Position ${a.length-pass+1} is now fixed.`,4);
 }
 fixed=a.length;scan=null;
 push(`Sorted. ${comparisons} value comparisons and ${moves} swaps.`,5,{complete:true});return states;
}
function linearSearch(input,target){
 const a=clone(input),states=[];let comparisons=0,reads=0,currentPosition=null,checked=0;
 const push=(message,line,extra={})=>states.push({kind:'linear',array:clone(a),target,comparisons,reads,moves:0,currentPosition,checked,message,line,found:null,result:null,...extra});
 push(`Scan from left to right for ${target}.`,0);
 for(let i=0;i<a.length;i++){
  currentPosition=i+1;reads++;push(`Read A[${i+1}] = ${a[i].value}.`,1);
  comparisons++;const equal=a[i].value===target;if(!equal)checked=i+1;
  push(equal?`${a[i].value} = ${target}: a match.`:`${a[i].value} ≠ ${target}. Continue to the next slot.`,2,{comparing:true});
  if(equal){push(`Found ${target} at A[${i+1}]. Return ${i+1}.`,3,{found:i+1,result:i+1,complete:true});return states;}
 }
 currentPosition=null;push(`${target} is not in the array. Return NOT_FOUND.`,4,{result:-1,complete:true});return states;
}
function binarySearch(input,target){
 if(!sorted(input))throw new Error('Binary search requires a sorted list.');
 const a=clone(input),states=[];let comparisons=0,reads=0,low=1,high=a.length,mid=null;
 const push=(message,line,extra={})=>states.push({kind:'binary',array:clone(a),target,comparisons,reads,moves:0,low,high,mid,message,line,found:null,result:null,...extra});
 push(`Search the sorted array for ${target}.`,0);
 while(low<=high){
  mid=Math.floor((low+high)/2);push(`low = ${low}, high = ${high}. Choose mid = ${mid}.`,3);
  reads++;const value=a[mid-1].value;push(`Read A[${mid}] = ${value}.`,4);
  comparisons++;push(`${value} ${value===target?'=':'≠'} ${target}.`,5,{comparing:true});
  if(value===target){push(`Found ${target} at A[${mid}]. Return ${mid}.`,6,{found:mid,result:mid,complete:true});return states;}
  comparisons++;const smaller=value<target;push(`${value} ${smaller?'<':'>'} ${target}. ${smaller?'Discard the middle and everything to its left.':'Discard the middle and everything to its right.'}`,7,{comparing:true});
  const previousMid=mid;if(smaller)low=mid+1;else high=mid-1;mid=null;
  push(`Set ${smaller?'low':'high'} = ${previousMid} ${smaller?'+':'−'} 1 = ${smaller?low:high}.`,smaller?8:10);
 }
 mid=null;push(`low = ${low} > high = ${high}: no slots remain. ${target} is not in the array.`,11,{result:-1,complete:true});return states;
}
function quickSort(input){
 const a=clone(input),states=[],fixed=new Set(),stack=[];let comparisons=0,moves=0;
 const push=(message,line,extra={})=>states.push({kind:'quick',array:clone(a),comparisons,moves,message,line,compare:[],fixed:[...fixed],stack:clone(stack),low:null,high:null,scan:null,nextSmall:null,pivot:null,pivotPosition:null,phase:'call',...extra});
 const swap=(i,j)=>{if(i!==j){[a[i-1],a[j-1]]=[a[j-1],a[i-1]];moves++;}};
 function run(low,high){
  stack.push({low,high});
  if(low>=high){if(low===high)fixed.add(low);push(low===high?`A[${low}] is a single value: already sorted.`:'This subarray is empty: return.',1,{low,high});stack.pop();return;}
  push(`Sort A[${low}…${high}].`,0,{low,high});
  const pivot=a[high-1].value;let nextSmall=low,scan=null;
  const snapshot=(message,line,extra={})=>push(message,line,{low,high,pivot,pivotPosition:high,nextSmall,scan,phase:'partition',...extra});
  snapshot(`Save pivot = A[${high}] = ${pivot}. Keep the pivot card at the right end while scanning.`,2);
  snapshot(`nextSmall = ${nextSmall}: the next slot for a value smaller than ${pivot}.`,3);
  for(scan=low;scan<high;scan++){
   comparisons++;const value=a[scan-1].value;
   snapshot(`Compare A[${scan}] = ${value} with pivot = ${pivot}.`,5,{compare:[scan]});
   if(value<pivot){
    const dest=nextSmall;swap(scan,dest);
    snapshot(scan===dest?`${value} is already in the next smaller-value slot. No swap.`:`Swap ${value} into A[${dest}], the next smaller-value slot.`,6,{swapped:[scan,dest]});
    nextSmall++;snapshot(`Advance nextSmall to ${nextSmall}.`,7);
   }else snapshot(`${value} ≥ ${pivot}: leave it in the scanned larger-or-equal region.`,5);
  }
  scan=null;const pivotIndex=nextSmall;swap(pivotIndex,high);fixed.add(pivotIndex);
  snapshot(`Move pivot ${pivot} to A[${pivotIndex}]. Every value left is smaller; every value right is at least ${pivot}.`,8,{pivotPosition:pivotIndex,phase:'placed'});
  snapshot(`Recursively sort the left subarray A[${low}…${pivotIndex-1}].`,9,{pivotPosition:pivotIndex,phase:'placed'});
  run(low,pivotIndex-1);
  snapshot(`Recursively sort the right subarray A[${pivotIndex+1}…${high}].`,10,{pivotPosition:pivotIndex,phase:'placed'});
  run(pivotIndex+1,high);stack.pop();
 }
 push('Choose the last value as pivot, partition in place, then sort both sides.',0);
 run(1,a.length);
 push(`Sorted. ${comparisons} value comparisons and ${moves} swaps.`,11,{complete:true});return states;
}

function guessReply(secret,guess){return guess<secret?'too small':guess>secret?'too big':'correct';}
function guessing(n,secret,strategy){
 if(!Number.isInteger(n)||n<1||!Number.isInteger(secret)||secret<1||secret>n)throw Error('Choose n ≥ 1 and a secret from 1 to n.');
 if(!['linear','binary'].includes(strategy))throw Error('Unknown guessing strategy.');
 const states=[];let low=1,high=n,guess=null,calls=0,reply=null,history=[];
 const push=(message,line,extra={})=>states.push({n,secret,strategy,low,high,guess,calls,reply,history:clone(history),message,line,complete:false,...extra});
 push(`Find Alice’s secret in 1…${n}. Each guess is one AskAlice call.`,0);
 let next=1;
 while(low<=high){
  guess=strategy==='linear'?next++:Math.floor((low+high)/2);reply=null;
  push(strategy==='linear'?`Bob guesses ${guess}, the next number in order.`:`Bob chooses the middle of ${low}…${high}: ${guess}.`,strategy==='linear'?0:2);
  reply=guessReply(secret,guess);calls++;history.push({guess,reply});
  if(reply==='correct'){low=high=guess;push(`Alice: correct. Found ${guess} in ${calls} ${calls===1?'guess':'guesses'}.`,strategy==='linear'?3:4,{complete:true});break;}
  push(`Alice: ${reply}.`,strategy==='linear'?1:3);
  if(reply==='too small')low=Math.max(low,guess+1);else high=Math.min(high,guess-1);
  push(`Keep ${low===high?low:`${low}…${high}`}.`,strategy==='linear'?0:reply==='too small'?5:6);
 }
 return states;
}
const api={cards,sorted,quickSort,selection,insertion,bubble,merging,mergeSort,linearSearch,binarySearch,guessReply,guessing};root.SortingEngine=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:window);

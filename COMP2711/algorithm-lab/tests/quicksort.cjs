const assert=require('node:assert/strict');
const E=require('../dist/engine.js');let count=0;
function check(values){
 const input=E.cards(values),before=JSON.stringify(input),trace=E.quickSort(input),end=trace.at(-1),expected=[...values].sort((a,b)=>a-b);
 assert.deepEqual(end.array.map(c=>c.value),expected);assert(end.complete);assert.equal(JSON.stringify(input),before);
 let comparisons=0,moves=0;
 for(const s of trace){
  assert.deepEqual(s.array.map(c=>c.id).sort((a,b)=>a-b),input.map(c=>c.id));
  assert(s.comparisons>=comparisons&&s.moves>=moves);comparisons=s.comparisons;moves=s.moves;
  for(const pos of s.fixed)assert.equal(s.array[pos-1].value,expected[pos-1]);
  if(s.phase==='placed'){
   assert.equal(s.array[s.pivotPosition-1].value,s.pivot);
   assert(s.array.slice(s.low-1,s.pivotPosition-1).every(c=>c.value<s.pivot));
   assert(s.array.slice(s.pivotPosition,s.high).every(c=>c.value>=s.pivot));
  }
 }
 assert(end.comparisons<=values.length*(values.length-1)/2);count++;
}
for(let n=0;n<=7;n++)for(let enc=0;enc<3**n;enc++){
 let v=enc;check(Array.from({length:n},()=>{const x=v%3-1;v=Math.floor(v/3);return x;}));
}
for(let n=1;n<=12;n++){
 check(Array.from({length:n},(_,i)=>i));check(Array.from({length:n},(_,i)=>n-i));check(Array(n).fill(5));
 assert.equal(E.quickSort(E.cards(Array(n).fill(5))).at(-1).comparisons,n*(n-1)/2);
}
console.log(`PASS ${count} quicksort inputs: sorting, card preservation, fixed positions, partition bounds, cost counters, duplicate worst case`);

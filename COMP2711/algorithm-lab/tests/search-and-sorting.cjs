const assert=require('node:assert/strict');const E=require('../dist/engine.js');let cases=0,searches=0;
function check(a){const input=E.cards(a),expected=[...a].sort((a,b)=>a-b);
 for(const name of ['insertion','bubble']){const trace=E[name](input),last=trace.at(-1);assert.deepEqual(last.array.map(c=>c.value),expected);assert.deepEqual(last.array.map(c=>c.id),[...input].sort((a,b)=>a.value-b.value).map(c=>c.id));if(name==='bubble')assert.equal(last.comparisons,Math.max(0,a.length*(a.length-1)/2));else assert.ok(last.comparisons<=a.length*(a.length-1)/2);}
 const selection=E.selection(input);for(const s of selection)if(s.currentPosition!==null)assert.equal(s.currentPosition,s.fixed+1-(s.line===9||s.line===8?1:0));
 for(let target=-2;target<=2;target++){
  const linear=E.linearSearch(input,target),l=linear.at(-1),index=a.indexOf(target);assert.equal(l.result,index===-1?-1:index+1);assert.equal(l.reads,index===-1?a.length:index+1);assert.equal(l.comparisons,l.reads);
  const sorted=E.cards(expected),binary=E.binarySearch(sorted,target),b=binary.at(-1);assert.equal(b.result===-1,!a.includes(target));if(b.result!==-1)assert.equal(sorted[b.result-1].value,target);assert.ok(b.reads<=Math.floor(Math.log2(a.length||1))+1);assert.equal(b.comparisons,2*b.reads-(b.result!==-1?1:0));
  for(const s of binary){if(!s.complete&&s.low<=s.high){const matches=sorted.filter(c=>c.value===target);if(matches.length)assert.ok(sorted.slice(s.low-1,s.high).some(c=>c.value===target));}if(s.mid!==null)assert.ok(s.mid>=s.low&&s.mid<=s.high);}
  searches+=2;
 }
 assert.deepEqual(input,E.cards(a));cases++;
}
function enumerate(a,n){if(a.length===n)return check(a);for(const x of [-1,0,1])enumerate([...a,x],n);}
for(let n=0;n<=6;n++)enumerate([],n);check([4,2,5,1,3]);check([999,-999,0,8,2,8,1,6,12,3,4,5]);
assert.throws(()=>E.binarySearch(E.cards([2,1]),1),/sorted/);
console.log(`PASS ${cases} arrays: insertion/bubble correctness and stability, selection i pointer, plus ${searches} searches including duplicates, absence, empty arrays and shrinking intervals.`);

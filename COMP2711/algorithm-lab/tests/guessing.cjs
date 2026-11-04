const assert = require('node:assert/strict');
const E = require('../dist/engine.js');
for (let n=1;n<=64;n++) for(let secret=1;secret<=n;secret++) for(const strategy of ['linear','binary']) {
 const trace=E.guessing(n,secret,strategy),end=trace.at(-1);
 assert(end.complete);assert.equal(end.guess,secret);
 assert.equal(end.calls,end.history.length);
 assert.equal(end.history.at(-1).reply,'correct');
 for(const s of trace){assert(s.low<=secret&&secret<=s.high);assert.equal(s.calls,s.history.length);}
 if(strategy==='linear'){assert.equal(end.calls,secret);assert.deepEqual(end.history.map(h=>h.guess),Array.from({length:secret},(_,i)=>i+1));}
 else assert(end.calls<=Math.floor(Math.log2(n))+1);
}
assert.deepEqual(E.guessing(16,13,'binary').at(-1).history.map(h=>h.guess),[8,12,14,13]);
console.log('PASS 4160 guessing games, interval invariants, exact linear counts, binary bound and lecture example');

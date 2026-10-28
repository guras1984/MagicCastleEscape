const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const key='magic-castle-model-3-save-v1';
function boot(hero=0,existing=null){
 const values=new Map([[key,JSON.stringify({hero})]]),nodes=new Map();if(existing)for(const [k,v] of existing)values.set(k,v);let buttons=[];
 function el(){return {style:{},classList:{add(){},remove(){}},append(...children){buttons.push(...children)},prepend(){},setAttribute(){},addEventListener(){},querySelectorAll(){return []},getContext(){return new Proxy({createLinearGradient(){return {addColorStop(){}}},createRadialGradient(){return {addColorStop(){}}}},{get:(o,k)=>o[k]||(()=>{})})}}}
 const ctx={console,Math,JSON,Date,Number,Array,Set,Option:function(){},Image:function(){},document:{querySelector(q){if(!nodes.has(q))nodes.set(q,el());return nodes.get(q)},querySelectorAll(){return []},createElement:el,addEventListener(){}},localStorage:{getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)},setInterval(){},setTimeout(){},requestAnimationFrame(){},confirm:()=>true,innerWidth:960,innerHeight:540,navigator:{},MagicRanking:{start:async()=>null}};ctx.window=ctx;ctx.addEventListener=()=>{};
 const source=fs.readFileSync('script.js','utf8').replace("startMenu();document.title='Magic Castle · 하늘의 수호자';requestAnimationFrame(frame);",`globalThis.test={get save(){return save},get level(){return level},get player(){return player},get coins(){return stageCoins},get mode(){return mode},get checkpoint(){return checkpoint},get status(){return rankStatus},heroes,localSaveMenu,saveManager,continueAdventure,loadStage,snapshot,validateSnapshot,restoreSnapshot,rememberProgress,damageEnemy,clearStage,update,draw,blessingMenu,resume,pause,die,finishRankRun,setCheckpoint(v){checkpoint=v},setCombo(v){combo=v},setTicket(v){rankTicket=v},setTime(v){elapsed=v}};`);
 vm.createContext(ctx);vm.runInContext(source,ctx);return {g:ctx.test,values,ctx,nodes,buttons};
}
for(const [oldHero,expected] of [[0,0],[1,0],[2,1],[3,1]]){const {g}=boot(oldHero);assert.equal(g.save.hero,expected);assert.equal(g.heroes.length,2)}
const {g,values,nodes}=boot(2);g.loadStage(1);g.player.x=650;g.player.hp=2;g.level.items[0].taken=true;g.level.enemies[0].hp=0;g.rememberProgress();const data=g.snapshot();g.validateSnapshot(data);g.player.x=30;g.restoreSnapshot(data.resume);assert.equal(g.player.x,650);assert.equal(g.player.hp,2);assert.equal(g.level.items[0].taken,true);assert.equal(g.level.enemies[0].hp,0);assert.match(g.status,/랭킹 제외/);
const bad=JSON.parse(JSON.stringify(data));bad.resume.player.hp=999;assert.throws(()=>g.validateSnapshot(bad));
g.setCombo(2);const before=g.coins;g.damageEnemy({x:0,y:0,hp:1,hit:0,kind:0},5);assert.equal(g.coins,before+3);
g.loadStage(1);const s=g.level.secret;g.player.x=s.x;g.player.y=s.y;g.update(0);assert.equal(s.inRoom,true);g.player.x=s.roomX+200;g.update(0);assert.equal(s.claimed,true);const reward=g.coins;g.update(0);assert.equal(g.coins,reward);g.player.x=s.roomX+360;g.update(0);assert.equal(s.inRoom,false);
g.loadStage(1);g.setTicket('ticket');g.setTime(50);assert.equal(g.finishRankRun().id,'ticket');assert.equal(g.finishRankRun(),null);
g.clearStage();const wallet=g.save.coins;g.clearStage();assert.equal(g.save.coins,wallet);assert.equal(values.has(key+'-resume-v2'),false);
for(let n=1;n<=30;n++){g.loadStage(n);g.update(.016);g.draw();g.validateSnapshot(g.snapshot())}
console.log('PASS: legacy classes, full save/restore, invalid payload, combo rewards, treasure once, ranking idempotency, clear rewards once, all 30 stage update/render/snapshot checks');

const reloaded=boot(2,values);reloaded.g.continueAdventure();assert.equal(reloaded.g.mode,'play');
const localOnly=boot(0);localOnly.g.loadStage(1);localOnly.g.player.x=220;localOnly.g.pause();localOnly.g.localSaveMenu();assert.ok(localOnly.values.has(key+'-resume-v2'));assert.ok(localOnly.buttons.some(b=>b.textContent==='💾 지금 다시 저장'));assert.ok(!localOnly.buttons.some(b=>/구글|클라우드/.test(b.textContent||'')));
const reset=boot(0);reset.g.loadStage(1);reset.g.rememberProgress();reset.g.saveManager();reset.buttons.find(b=>b.textContent==='🗑 전체 게임 기록 초기화').onclick();assert.equal(reset.values.has(key+'-resume-v2'),false);assert.equal(reset.g.save.resume,undefined);
assert.ok(!fs.readFileSync('index.html','utf8').includes('cloud.js'));assert.ok(!fs.readFileSync('script.js','utf8').includes('MagicCloud'));
console.log('PASS: reload continuation, local manual save, no login UI, complete local reset, no cloud dependency');

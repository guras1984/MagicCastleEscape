(()=>{'use strict';
const MODEL_VARIANT=2;
const c=document.querySelector('#game'),ctx=c.getContext('2d'),W=960,H=540,ui={screen:document.querySelector('#screen'),title:document.querySelector('#title'),msg:document.querySelector('#message'),options:document.querySelector('#options'),actions:document.querySelector('#actions'),hp:document.querySelector('#hp'),stage:document.querySelector('#stageName'),coins:document.querySelector('#coins'),progress:document.querySelector('#progressFill'),progressPct:document.querySelector('#progressPct')};
const themes=[{name:'초록빛 성',sky:['#8ce6fa','#e5faff'],land:'#83c879',edge:'#397d57',hill:'#9ad6b1'},{name:'수정 동굴',sky:['#5264b8','#b0a4f2'],land:'#7478bd',edge:'#48447c',hill:'#a3a2eb'},{name:'불꽃의 성',sky:['#ff9d68','#ffe5a2'],land:'#ae7869',edge:'#7c3c43',hill:'#f3b16b'},{name:'얼음 궁전',sky:['#8cd6f6','#e6fbff'],land:'#9bcde0',edge:'#5e8eaf',hill:'#b8e9f4'},{name:'하늘의 성',sky:['#68b9ff','#d8f4ff'],land:'#9fc4a4',edge:'#648c7d',hill:'#c7ebed'},{name:'마왕의 성',sky:['#7d6cb5','#e5b9d8'],land:'#8975a2',edge:'#534a78',hill:'#b9a0c6'}];
const weapons=[{name:'나무검',icon:'🗡️',type:'melee',power:1,range:55,rate:.28},{name:'기사의 검',icon:'⚔️',type:'melee',power:2,range:75,rate:.3},{name:'전투 도끼',icon:'🪓',type:'melee',power:3,range:65,rate:.47},{name:'마법 창',icon:'🔱',type:'melee',power:2,range:115,rate:.36},{name:'번개 망치',icon:'🔨',type:'melee',power:4,range:70,rate:.62},{name:'나무 활',icon:'🏹',type:'ranged',power:1,speed:470,rate:.4},{name:'얼음 지팡이',icon:'❄️',type:'ranged',power:2,speed:390,rate:.56},{name:'화염 지팡이',icon:'🔥',type:'ranged',power:3,speed:420,rate:.68},{name:'별빛 마법봉',icon:'✨',type:'ranged',power:2,speed:550,rate:.32},{name:'용의 석궁',icon:'🐉',type:'ranged',power:5,speed:610,rate:.8}];
const monsterIcons=['🍄','🐣','🦋','🐸','🐝','👻','🦉','🧚','🐲','🐞'];const flyingKinds=new Set([2,4,5,6,7,8,9]);
const bossNames={5:'거대 슬라임',10:'수정 골렘',15:'화염 기사',20:'얼음 마법사',25:'폭풍 드래곤',30:'암흑 마왕'};
const heroes=[
{name:'수호기사',icon:'🛡️',color:'#73d9ff',hp:3,speed:.96,jump:1,power:1,desc:'튼튼한 방패 · 피해 감소',skill:''},
{name:'바람검사',icon:'⚔️',color:'#ffca78',hp:1,speed:1.13,jump:1.07,power:2,desc:'빠른 검술 · 강한 근접 공격',skill:''},
{name:'별빛마법사',icon:'🔮',color:'#d4a5ff',hp:0,speed:1,jump:1.08,power:2,desc:'마법탄 · 광역 마법',skill:''},
{name:'햇살치유사',icon:'🌻',color:'#a9f5a0',hp:2,speed:1.04,jump:1.04,power:1,desc:'자동 회복 · 안전한 모험',skill:''}];
const combatStyles=[{type:'melee',range:85,rate:.34,icon:'⚔️',speed:0},{type:'melee',range:115,rate:.30,icon:'🌀',speed:0},{type:'ranged',range:340,rate:.52,icon:'🔮',speed:480},{type:'ranged',range:270,rate:.65,icon:'🌟',speed:410}];
const pets=[{name:'몽글 병아리',icon:'🐥',color:'#ffdf69',desc:'동전 수집 보너스'},{name:'별빛 요정',icon:'🧚',color:'#c5b6ff',desc:'일정 시간마다 체력 회복'},{name:'꼬마 용',icon:'🐲',color:'#8af2cd',desc:'적에게 마법탄 발사'}];
const xpNeed=l=>30+l*22;
function grantXP(amount){save.petXP+=Math.ceil(amount*.35);while(save.petXP>=save.petLevel*35&&save.petLevel<20){save.petXP-=save.petLevel*35;save.petLevel++;if(player)burst(player.x,player.y,"#fff1a3",18)}save.xp+=amount;let ups=0;while(save.xp>=xpNeed(save.level)&&save.level<50){save.xp-=xpNeed(save.level);save.level++;ups++}if(ups){flash('✨ 레벨 업! LV.'+save.level);sound(990,.25);if(player){player.max+=ups;player.hp=Math.min(player.max,player.hp+ups)}}persist()}
function petForm(){return save.petLevel>=15?'전설':save.petLevel>=8?'성장':'아기'}
function petMenu(){show('🥚 나의 펫',`현재 펫: ${pets[save.pet].icon} ${pets[save.pet].name}<br>펫 레벨 ${save.petLevel} · ${petForm()} 단계 · 경험치 ${save.petXP}/${save.petLevel*35}<br>펫은 Lv.8에 성장, Lv.15에 전설 모습으로 진화해요.`);pets.forEach((pet,i)=>button(`${save.pet===i?'✓ ':''}${pet.icon} ${pet.name} · ${pet.desc}`,()=>{save.pet=i;persist();petMenu()},save.pet!==i));button('◀ 돌아가기',startMenu,true)}

const storeKey='magic-castle-model-3-save-v1';let save;try{save=JSON.parse(localStorage.getItem(storeKey))||{}}catch{save={}};save={unlocked:1,best:{},coins:0,weapon:1,shield:0,hero:0,achievements:[],seen:[],level:1,xp:0,pet:0,petXP:0,petLevel:1,skillUses:0,shopHearts:0,shopLuck:0,heroLocked:false,...save};
const persist=()=>{try{localStorage.setItem(storeKey,JSON.stringify(save))}catch{}};
save.hero=Math.max(0,Math.min(3,Math.floor(Number(save.hero)||0)));save.heroLocked=Boolean(save.heroLocked||save.unlocked>1||save.level>1);
save.coins=Math.max(0,Math.floor(Number(save.coins)||0));save.weapon=Math.max(1,Math.min(5,Number(save.weapon)||1));save.shield=Math.max(0,Number(save.shield)||0);save.shopHearts=Math.max(0,Math.min(5,Math.floor(Number(save.shopHearts)||0)));save.shopLuck=Math.max(0,Math.min(3,Math.floor(Number(save.shopLuck)||0)));
let mode='menu',level=null,player=null,camera=0,t=0,elapsed=0,stageCoins=0,stageDamage=0,checkpoint=0,particles=[],projectiles=[],heroShots=[],keys={},difficulty='normal',audio=null,musicOn=true,lastBeat=-1,shake=0,notice='',noticeTime=0,combo=0,comboTimer=0,defeated=0;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),rand=(seed)=>{let x=seed|0;return()=>{x=(Math.imul(1664525,x)+1013904223)|0;return (x>>>0)/4294967296}},rect=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
function sound(freq=400,dur=.1,type='sine',volume=.07){if(!audio)return;try{const o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.setValueAtTime(freq,audio.currentTime);g.gain.setValueAtTime(volume,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+dur);o.connect(g).connect(audio.destination);o.start();o.stop(audio.currentTime+dur)}catch{}}
function unlockAudio(){try{audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume()}catch{}}
// Energetic, original procedural battle soundtrack. No downloads or copyrighted audio.
function music(){
 if(!musicOn||!audio||mode!=='play')return;
 // 142 BPM, energetic 8th-note drive with drum, bass, lead and rhythmic arpeggios.
 const step=Math.floor(t*(142/60)*2);
 if(step===lastBeat)return;
 lastBeat=step;
 const phrase=step%32, eight=step%8, zoneShift=[0,2,-2,5,7,-5][level.zone];
 const minor=[0,3,7,10,12,15,19,22], midi=(n)=>440*Math.pow(2,(n-69)/12);
 function note(midiNumber,dur,type,vol){sound(midi(midiNumber+zoneShift),dur,type,vol)}
 // Bass line, root and fifth (low octave) on quarter notes.
 if(step%2===0)note(39+[0,0,5,3][Math.floor(phrase/8)],.20,'sawtooth',.012);
 // Lead melody with rotating phrases that become more urgent in boss fights.
 const line=[12,15,19,15,17,19,22,19,12,15,17,19,22,19,17,15];
 if(eight!==3&&eight!==7)note(57+line[step%16]-.0,.12,'triangle',.012);
 if(step%4===2)note(69+minor[(step/2)%8|0],.085,'sine',.012);
 // Tight low kick and snare pulse, softer high percussion on offbeats.
 if(step%4===0)musicDrum(0);
 if(step%4===2)musicDrum(1);
 if(step%2===1)musicDrum(2);
}
function musicDrum(kind){
 if(!audio)return;
 try{const now=audio.currentTime,o=audio.createOscillator(),g=audio.createGain();
 o.type=kind===2?'triangle':'sine';const hz=kind===0?95:kind===1?205:760;
 o.frequency.setValueAtTime(hz,now);o.frequency.exponentialRampToValueAtTime(kind===0?42:kind===1?98:420,now+.065);
 g.gain.setValueAtTime(kind===0?.027:kind===1?.015:.004,now);
 g.gain.exponentialRampToValueAtTime(.0001,now+(kind===0?.16:.07));o.connect(g).connect(audio.destination);o.start(now);o.stop(now+.17)
 }catch{}
}

function button(label,fn,secondary=false){let b=document.createElement('button');b.textContent=label;if(secondary)b.className='secondary';b.onclick=()=>{unlockAudio();sound(620,.08);fn()};ui.actions.append(b);return b}
function show(title,msg){mode='menu';ui.screen.classList.remove('hidden');ui.title.textContent=title;ui.msg.innerHTML=msg;ui.options.innerHTML='';ui.actions.innerHTML='';keys={}}
function startMenu(){show('🏰 마법의 성 탈출 대작전','동화 속 판타지 모험 · 4가지 직업 · 성장하는 펫!<br>30개 스테이지 · 보스 6종 · 무기 10종!<br>자동 공격 · 2단 점프: 스페이스 · 무기: Q / E');for(let d of [['easy','쉬움'],['normal','보통'],['hard','어려움']]){let b=document.createElement('button');b.textContent=d[1];b.className=difficulty===d[0]?'selected':'';b.onclick=()=>{difficulty=d[0];startMenu()};ui.options.append(b)}const chooser=document.createElement('div');chooser.className='hero-chooser';heroes.forEach((h,i)=>{const b=document.createElement('button');b.className='hero-card'+(save.hero===i?' active':'');const combat=combatStyles[i];b.innerHTML=`<span class="hero-icon">${h.icon}</span><span class="hero-role">${combat.type==='melee'?'근거리':'원거리'} · ${combat.range}px</span><strong>${h.name}</strong><small>${h.desc}</small>`;b.disabled=save.heroLocked&&save.hero!==i;b.onclick=()=>{if(save.heroLocked)return;save.hero=i;persist();startMenu()};chooser.append(b)});ui.options.append(chooser);if(save.heroLocked){const note=document.createElement('p');note.textContent='🔒 모험 중에는 처음 선택한 직업이 유지됩니다. 직업 변경은 저장 데이터 관리에서 새 게임을 시작해야 합니다.';ui.options.append(note)}button(save.heroLocked?'▶ 모험 이어하기':'▶ 직업 확정하고 모험 시작',()=>loadStage(save.heroLocked?save.unlocked:1));button('🗺 월드맵',worldMap,true);button('🛒 상점',shop,true);button('🥚 펫 선택',petMenu,true);button('🏆 기록 / 업적',records,true);button('⚙ 저장 데이터 관리',saveManager,true);button(musicOn?'🔊 음악 켜짐':'🔇 음악 꺼짐',()=>{musicOn=!musicOn;startMenu()},true)}
function saveManager(){
 show('⚙ 저장 데이터 관리',`현재 보유 동전: 🪙 ${save.coins}<br>최고 해금 스테이지: ${save.unlocked}/30<br><small>기존 플레이 기록은 자동으로 삭제되지 않습니다.</small>`);
 button('🪙 동전만 0개로 초기화',()=>{
  if(!confirm('동전만 0개로 초기화할까요? 캐릭터와 스테이지 기록은 유지됩니다.'))return;
  save.coins=0;persist();saveManager();flash('동전 초기화 완료');
 });
 button('🗑 전체 게임 기록 초기화',()=>{
  if(!confirm('모든 게임 기록을 삭제할까요? 이 작업은 되돌릴 수 없습니다.'))return;
  try{localStorage.removeItem(storeKey)}catch{}
  save={unlocked:1,best:{},coins:0,weapon:1,shield:0,hero:0,achievements:[],seen:[],level:1,xp:0,pet:0,petXP:0,petLevel:1,skillUses:0,shopHearts:0,shopLuck:0,heroLocked:false};persist();startMenu();
 });
 button('◀ 돌아가기',startMenu,true);
}
function worldMap(){show('🗺 30개 스테이지','해금된 스테이지를 선택하세요. 완료한 단계는 다시 플레이할 수 있습니다.');ui.options.style.maxWidth='620px';for(let n=1;n<=30;n++){let b=document.createElement('button');b.textContent=(n%5===0?'👑':'')+n;b.style.minWidth='48px';b.style.padding='8px';b.disabled=n>save.unlocked;b.onclick=()=>loadStage(n);ui.options.append(b)}button('◀ 돌아가기',startMenu,true)}
function shop(){
 const balance=Math.max(0,Number(save.coins)||0);save.coins=balance;
 const price=Math.max(45,(Number(save.weapon)||1)*45);
 show('🛒 모험가 상점',`보유 동전: 🪙 ${balance}<br>검 강화 비용: ${price} · 방어막 비용: 35<br><small>스테이지에서 모은 동전은 클리어하면 지갑에 들어옵니다.</small>`);
 const upgrade=button(save.weapon>=5?'⚔ 검 최대 강화 완료':`⚔ 검 강화 (${price}🪙)`,()=>{
  if(save.weapon>=5)return;
  if(save.coins<price){shopMessage(`동전이 ${price-save.coins}개 부족합니다.`);return;}
  save.coins-=price;save.weapon++;persist();shop();shopMessage('검 강화에 성공했습니다!');
 });upgrade.disabled=save.weapon>=5;
 button('🛡 방어막 구매 (35🪙)',()=>{
  if(save.coins<35){shopMessage(`동전이 ${35-save.coins}개 부족합니다.`);return;}
  save.coins-=35;save.shield++;persist();shop();shopMessage('방어막을 구매했습니다!');
 });
 const heartPrice=70+save.shopHearts*45;
 const heart=button(save.shopHearts>=5?'❤️ 최대 체력 강화 완료':`❤️ 최대 체력 +1 (${heartPrice}🪙)`,()=>{if(save.coins<heartPrice){shopMessage(`동전이 ${heartPrice-save.coins}개 부족합니다.`);return}save.coins-=heartPrice;save.shopHearts++;persist();shop();shopMessage('최대 체력이 증가했습니다!')});heart.disabled=save.shopHearts>=5;
 const luckPrice=90+save.shopLuck*60;
 const luck=button(save.shopLuck>=3?'🍀 행운 강화 완료':`🍀 동전 획득 행운 (${luckPrice}🪙)`,()=>{if(save.coins<luckPrice){shopMessage(`동전이 ${luckPrice-save.coins}개 부족합니다.`);return}save.coins-=luckPrice;save.shopLuck++;persist();shop();shopMessage('행운이 강화되었습니다!')});luck.disabled=save.shopLuck>=3;
 button('◀ 돌아가기',startMenu,true);
}
function shopMessage(message){const m=document.createElement('div');m.className='shop-feedback';m.textContent=message;ui.options.querySelectorAll('.shop-feedback').forEach(el=>el.remove());ui.options.prepend(m);}
function records(){let stars=Object.values(save.best).reduce((s,v)=>s+(v.stars||0),0);show('🏆 나의 모험 기록',`모험가 레벨: ${save.level} · 경험치 ${save.xp}/${xpNeed(save.level)}<br>동행 펫: ${pets[save.pet].name} Lv.${save.petLevel}<br>최고 도달 단계: ${save.unlocked}/30<br>총 획득 별: ⭐ ${stars}/90<br>동전: 🪙 ${save.coins}<br>검 레벨: ⚔ ${save.weapon}<br>발견한 몬스터: ${save.seen.length}종<br>업적: ${save.achievements.join(', ')||'아직 없음'}<br><small>이 기록은 현재 브라우저에만 저장됩니다.</small>`);button('◀ 돌아가기',startMenu,true)}
function flash(s){notice=s;noticeTime=2;sound(250,.2,'square',.04)}
function makeLevel(n){
 const zone=Math.floor((n-1)/5),r=rand(n*1919+37),boss=n%5===0;
 const width=3900+n*135,ground=420,platforms=[],hazards=[],enemies=[],items=[],switches=[],doors=[],moving=[],decor=[];
 let x=0,section=0;platforms.push({x:0,y:ground,w:520,h:120});x=520;
 // Each stage has its own deterministic layout and a changing mix of five obstacle rooms.
 while(x<width-460){
  const room=(section*7+n*3+Math.floor(r()*5))%8, gap=n<3?35:38+Math.floor(r()*(30+zone*8)),len=195+Math.floor(r()*145),start=x+gap;
  const y=ground-([0,38,62,18,45,78,25,55][room]);
  platforms.push({x:start,y,w:len,h:540-y});
  if(room===0||room===3||room===6){platforms.push({x:start+28,y:y-105,w:Math.min(120,len-45),h:16});items.push({x:start+70,y:y-145,type:'coin',taken:false})}
  if(room===1||room===4||room===7){platforms.push({x:start+25,y:y-90,w:88,h:16});platforms.push({x:start+len-100,y:y-170,w:85,h:16});items.push({x:start+len-65,y:y-208,type:'gem',taken:false})}
  if((room===2||room===5)&&n>3){moving.push({x:start+len*.38,y:y-100,baseY:y-100,w:94,h:16,phase:r()*6})}
  if(n>1&&r()<.40+zone*.055)hazards.push({x:start+35,y:y-17,w:Math.min(55,len-55),h:17,type:'spike',phase:r()*6});
  if(n>4&&(room===3||r()<.20))hazards.push({x:start+len-48,y:y-43,baseY:y-43,w:26,h:26,type:'saw',phase:r()*6});
  if(n>7&&room===4)hazards.push({x:start+len*.5,y:y-43,baseY:y-43,w:34,h:34,type:'flame',phase:r()*6});
  if(n>12&&room===1)hazards.push({x:start+len*.7,y:y-18,w:36,h:18,type:'pulse',phase:r()*6});
  if(n>15&&(room===0||room===6))platforms.push({x:start+len*.6,y:y-205,w:70,h:14,crumble:true,timer:0});
  const kind=Math.floor(r()*Math.min(10,3+zone*2)),fly=flyingKinds.has(kind),ex=start+len*.5,ey=y-(fly?105:36);
  enemies.push({x:ex,y:ey,w:33,h:36,hp:1+Math.floor(zone/2)+(fly?1:0),max:1+Math.floor(zone/2)+(fly?1:0),dir:r()>.5?1:-1,home:ex,homeY:ey,kind,fly,phase:r()*6,hit:0,pattern:Math.floor(r()*4),wander:r()*1.7,pace:.85+r()*.4});
  if(n>6&&r()<.55){let fx=start+len*.25,fy=y-140,k=[2,4,5,6,7,8,9][Math.floor(r()*7)];enemies.push({x:fx,y:fy,w:33,h:36,hp:1+Math.floor(zone/2),max:1+Math.floor(zone/2),dir:1,home:fx,homeY:fy,kind:k,fly:true,phase:r()*6,hit:0,pattern:Math.floor(r()*4),wander:r()*1.7,pace:.8+r()*.45})}
  for(let j=0;j<3;j++)items.push({x:start+30+j*32,y:y-54-(j%2)*18,type:'coin',taken:false});
  if(r()<.23)items.push({x:start+len*.7,y:y-60,type:r()<.6?'heart':'gem',taken:false});
  if(r()<.22)items.push({x:start+len*.5,y:y-85,type:'weapon',weapon:Math.floor(r()*10),taken:false});
  if(section>0&&section%7===0){switches.push({x:start+36,y:y-20,w:30,h:20,on:false});doors.push({x:start+len-30,y:y-76,w:30,h:76,open:false,requires:'switch',switchIndex:switches.length-1})}
  if(section>0&&section%9===0){items.push({x:start+35,y:y-75,type:'key',taken:false});doors.push({x:start+len-30,y:y-76,w:30,h:76,open:false,requires:'key'})}
  decor.push({x:start+len*.8,y:y-10,type:Math.floor(r()*3)});
  if(room===5){platforms.push({x:start+len*.42,y:y-132,w:85,h:14});items.push({x:start+len*.54,y:y-170,type:'gem',taken:false})}
  if(room===6&&n>5){hazards.push({x:start+len*.58,y:y-17,w:34,h:17,type:'pulse',phase:r()*6})}
  if(room===7&&n>8){moving.push({x:start+len*.55,y:y-155,baseY:y-155,w:76,h:16,phase:r()*6})}
  x=start+len;section++;
 }
 platforms.push({x:width-460,y:ground,w:550,h:120});
 const bossObj=boss?{x:width-355,y:ground-90,w:75,h:90,hp:n===30?100:n===10||n===20?40+zone*10:24+zone*8,max:n===30?100:n===10||n===20?40+zone*10:24+zone*8,dir:-1,hit:0,cool:1.5,phase:1}:null;
 if(bossObj){enemies.splice(0,enemies.length,...enemies.filter(e=>e.x<width-650));items.push({x:width-570,y:ground-65,type:'heart',taken:false})}
 return{n,zone,boss,width,stageVariant:(n-1)%5,platforms,hazards,enemies,items,switches,doors,moving,decor,bossObj,exit:{x:width-68,y:ground-85,w:48,h:85},checkpointX:Math.floor(width*.52),checkpointOn:false};
}
function loadStage(n){if(!save.heroLocked){save.heroLocked=true;persist()}level=makeLevel(n);let hp=(difficulty==='easy'?6:difficulty==='hard'?3:4)+heroes[save.hero||0].hp+Math.floor((save.level-1)/3)+(save.shopHearts||0);player={x:70,y:330,w:32,h:46,vx:0,vy:0,ground:false,jumps:0,jumpHeld:false,hp,max:hp,inv:0,attack:0,attackCD:0,petCD:2,healCD:7,guardTimer:0,guardCooldown:save.hero===0?12:15,guardReady:false,dir:1,shield:save.shield,hasKey:false,weapon:0,owned:[0]};camera=0;t=0;elapsed=0;stageCoins=0;stageDamage=0;combo=0;comboTimer=0;defeated=0;checkpoint=70;particles=[];projectiles=[];heroShots=[];lastBeat=-1;notice='';noticeTime=0;mode='play';ui.screen.classList.add('hidden');updateHUD()}
function updateHUD(){ui.hp.textContent='Lv.'+save.level+' '+heroes[save.hero||0].icon+' '+'❤️'.repeat(Math.max(0,player.hp))+(player.shield?' 🛡'+player.shield:'')+((save.hero===0||save.hero===1)?(player.guardTimer>0?' ✨보호막 '+player.guardTimer.toFixed(1)+'초':' 🛡충전 '+Math.ceil(player.guardCooldown)+'초'):'');const progress=Math.max(0,Math.min(100,Math.floor(player.x/(level.exit.x||1)*100)));ui.progress.style.width=progress+'%';ui.progressPct.textContent=progress+'%';ui.stage.textContent=`${level.n}/30 · ${themes[level.zone].name}${level.boss?' 👑':''}`;ui.coins.textContent=`🪙 ${stageCoins} · ${weapons[player.weapon].icon} ${weapons[player.weapon].name} · ${combatStyles[save.hero].type==='melee'?'근거리':'원거리'}`}
function burst(x,y,color='#fff',count=12){for(let i=0;i<count;i++)particles.push({x,y,vx:(Math.random()-.5)*240,vy:(Math.random()-.8)*240,life:.4+Math.random()*.5,color})}
function hurt(amount=1){if(player.inv>0)return;let dmg=amount;if(player.guardTimer>0){dmg=Math.random()<(save.hero===0?.70:.50)?0:dmg;burst(player.x+16,player.y+20,save.hero===0?"#8deeff":"#b9ffbc",7);}if(save.hero===0&&Math.random()<.30)dmg=0;if(player.shield){player.shield--;dmg=0}if(dmg){player.hp-=dmg;stageDamage+=dmg}player.inv=1.3;shake=10;sound(145,.22,'sawtooth');burst(player.x+16,player.y+22,'#ff6b7a');if(player.hp<=0)die();updateHUD()}
function die(){mode='dead';show('💔 다시 도전해요!',`스테이지 ${level.n} · 체크포인트에서 다시 시작할 수 있어요.`);button('🔁 체크포인트에서 재도전',()=>{let n=level.n;loadStage(n);player.x=checkpoint;player.y=280;player.hp=player.max;player.inv=1});button('🗺 월드맵',worldMap,true)}
function clearStage(){mode='clear';save.coins+=Math.max(0,Math.floor(stageCoins));grantXP(25+level.n*4);save.unlocked=Math.max(save.unlocked,Math.min(30,level.n+1));let stars=1+(stageDamage<=2?1:0)+(stageDamage===0&&elapsed<125?1:0);let best=save.best[level.n];if(!best||stars>best.stars||stars===best.stars&&elapsed<best.time)save.best[level.n]={stars,time:Math.round(elapsed),coins:stageCoins};if(level.n===5&&!save.achievements.includes('첫 보스 격파'))save.achievements.push('첫 보스 격파');if(level.n===30&&!save.achievements.includes('마법의 성 구원자'))save.achievements.push('마법의 성 구원자');persist();show(level.n===30?'🏆 마법의 성을 구했어요!':'🎉 스테이지 클리어!',`STAGE ${level.n} · ${'⭐'.repeat(stars)}<br>시간 ${Math.floor(elapsed)}초 · 🪙 ${stageCoins}<br>${level.n===30?'모든 모험을 완수했습니다!':'다음 스테이지가 열렸어요!'}`);if(level.n<30)button('▶ 다음 스테이지',()=>loadStage(level.n+1));button('🛒 상점',shop,true);button('🗺 월드맵',worldMap,true);sound(659,.3);setTimeout(()=>sound(880,.35),180)}
function damageEnemy(e,damage){if(e.hp<=0||e.hit>0)return;e.hp-=damage;e.hit=.23;burst(e.x+15,e.y+14,'#ffe080',10);if(e.hp<=0){combo++;comboTimer=5;defeated++;if(combo>=3&&combo%3===0){burst(e.x+15,e.y,'#fff2a4',Math.min(26,8+combo));sound(680+Math.min(combo,12)*30,.12,'triangle',.035)}grantXP(5+level.zone*2);save.seen=Array.from(new Set([...save.seen,monsterIcons[e.kind]]));if(Math.random()<.45)level.items.push({x:e.x,y:e.y,type:'coin',taken:false})}}
function damageBoss(b,damage){if(!b||b.hp<=0||b.hit>0)return;b.hp-=damage;b.hit=.24;shake=4;burst(b.x+25,b.y+30,'#ffdc73',16);if(b.hp<=0){grantXP(65+level.n*2);flash('보스 격파! 출구로 이동하세요');sound(900,.4)}}
function equipWeapon(id){if(!player.owned.includes(id))player.owned.push(id);player.weapon=id;flash(`${weapons[id].icon} ${weapons[id].name} 획득!`);sound(980,.22,'triangle');updateHUD()}
function cycleWeapon(delta){if(!player||mode!=='play')return;let i=player.owned.indexOf(player.weapon);player.weapon=player.owned[(i+delta+player.owned.length)%player.owned.length];flash(`${weapons[player.weapon].icon} ${weapons[player.weapon].name} · ${combatStyles[save.hero].type==='melee'?'근거리':'원거리'}`);updateHUD()}
function attack(target=null){const style=combatStyles[save.hero];if(player.attackCD>0)return;player.attack=.22;player.attackCD=style.rate;sound(style.type==='melee'?520:760,.11,style.type==='melee'?'sawtooth':'triangle',.045);const bonus=Math.floor((save.weapon-1)/2)+Math.floor((save.level-1)/5);const base=weapons[player.weapon].power+heroes[save.hero].power-1+bonus;if(style.type==='ranged'){let dx=player.dir,dy=0;if(target){dx=target.x+target.w/2-(player.x+16);dy=target.y+target.h/2-(player.y+21);let mag=Math.hypot(dx,dy)||1;dx/=mag;dy/=mag}heroShots.push({x:player.x+16,y:player.y+21,vx:dx*style.speed,vy:dy*style.speed,r:8,life:style.range/style.speed+.18,power:base,icon:style.icon});return}const area={x:player.dir===1?player.x+player.w:player.x-style.range,y:player.y-5,w:style.range,h:player.h+10};for(const e of level.enemies)if(rect(area,e))damageEnemy(e,base);if(level.bossObj&&rect(area,level.bossObj))damageBoss(level.bossObj,base);for(const sw of level.switches)if(rect(area,sw))sw.on=true}
function update(dt){if(mode!=='play')return;t+=dt;elapsed+=dt;music();if(comboTimer>0){comboTimer-=dt;if(comboTimer<=0)combo=0;}
player.petCD-=dt;player.healCD-=dt;
// Passive defense for melee classes: no skill button required.
if(save.hero===0||save.hero===1){
 if(player.guardTimer>0){player.guardTimer=Math.max(0,player.guardTimer-dt)}
 else {player.guardCooldown-=dt;if(player.guardCooldown<=0){player.guardTimer=save.hero===0?4:3;player.guardCooldown=save.hero===0?12:15;burst(player.x+16,player.y+20,save.hero===0?'#8deeff':'#b9ffbc',18);sound(820,.18,'sine',.03)}}
}
if(save.hero===3&&player.healCD<=0){player.hp=Math.min(player.max,player.hp+1);player.healCD=8;burst(player.x+15,player.y,'#a9ff99',10)}
if(save.pet===1&&player.petCD<=0){player.hp=Math.min(player.max,player.hp+1);player.petCD=Math.max(9,18-save.petLevel*.4);burst(player.x,player.y,'#e2bbff',8)}
if(save.pet===2&&player.petCD<=0){let target=level.enemies.filter(e=>e.hp>0).sort((a,b)=>Math.abs(a.x-player.x)-Math.abs(b.x-player.x))[0];if(target&&Math.abs(target.x-player.x)<350){let dx=target.x-player.x,dy=target.y-player.y,m=Math.hypot(dx,dy)||1;heroShots.push({x:player.x,y:player.y-10,vx:dx/m*370,vy:dy/m*370,life:2,power:1+Math.floor(save.level/8)+Math.floor(save.petLevel/5),icon:'✨'})}player.petCD=Math.max(1.6,3.5-save.petLevel*.09)}
noticeTime-=dt;shake=Math.max(0,shake-40*dt);player.inv=Math.max(0,player.inv-dt);player.attack=Math.max(0,player.attack-dt);player.attackCD=Math.max(0,player.attackCD-dt);// Auto-attack only when a target is within weapon range, including flying targets.
 const style=combatStyles[save.hero],targets=level.enemies.filter(e=>e.hp>0);if(level.bossObj?.hp>0)targets.push(level.bossObj);let nearest=null,dist=Infinity;for(const e of targets){const dx=e.x+e.w/2-(player.x+player.w/2),dy=e.y+e.h/2-(player.y+player.h/2),d=Math.hypot(dx,dy);if(d<dist){nearest=e;dist=d}}if(nearest&&dist<style.range+(style.type==='melee'?20:0)){player.dir=nearest.x+nearest.w/2>=player.x+player.w/2?1:-1;if(player.attackCD<=0)attack(nearest)}
 let speed=(difficulty==='easy'?245:235)*heroes[save.hero||0].speed;const horizontal=keys.left?-1:keys.right?1:joystickAxis;const targetV=horizontal*speed;const smoothing=horizontal?15:19;player.vx+=(targetV-player.vx)*Math.min(1,smoothing*dt);if(Math.abs(player.vx)<.35)player.vx=0;if(Math.abs(horizontal)>.12)player.dir=Math.sign(horizontal);if(keys.jump&&!player.jumpHeld&&player.jumps<2){player.vy=-(player.jumps===0?490:445)*heroes[save.hero||0].jump;player.jumps++;player.ground=false;burst(player.x+16,player.y+45,player.jumps===2?'#b3f7ff':'#ffe8a1',12);sound(player.jumps===2?650:420,.12,'triangle')}player.jumpHeld=!!keys.jump;player.vy=Math.min(900,player.vy+1250*dt);let oldY=player.y;player.x=clamp(player.x+player.vx*dt,0,level.width-player.w);player.y+=player.vy*dt;player.ground=false;for(let p of [...level.platforms,...level.moving]){if(p.crumble&&p.timer>0){p.timer-=dt;if(p.timer<=0)p.gone=true}if(p.gone)continue;if(player.x+player.w>p.x+4&&player.x<p.x+p.w-4&&oldY+player.h<=p.y+14&&player.y+player.h>=p.y&&player.vy>=0){player.y=p.y-player.h;player.vy=0;player.ground=true;player.jumps=0;if(p.crumble&&!p.timer)p.timer=.7}}for(let d of level.doors){d.open=d.requires==='key'?player.hasKey:level.switches[d.switchIndex]?.on;if(!d.open&&rect(player,d)){if(player.vx>0)player.x=d.x-player.w;else if(player.vx<0)player.x=d.x+d.w}}if(player.y>600){hurt();if(mode==='play'){player.x=checkpoint;player.y=240;player.vy=0;player.jumps=0}}if(player.x>=level.checkpointX&&!level.checkpointOn){level.checkpointOn=true;checkpoint=level.checkpointX;flash('🚩 체크포인트 저장!');sound(760,.18)}for(let h of level.hazards){if(h.type==='saw')h.y=h.baseY+Math.sin(t*2+h.phase)*32;if(h.type==='flame'||h.type==='pulse'){h.active=Math.sin(t*(h.type==='flame'?3.1:4.5)+h.phase)>.15}else h.active=true;if(h.active&&rect(player,h))hurt()}for(let e of level.enemies){if(e.hp<=0)continue;e.hit=Math.max(0,e.hit-dt);{
 // All enemies patrol predictably on easy, cover more ground on normal,
 // and switch between pursuit, zigzag and elliptical flight on hard.
 const tuning=difficulty==='easy'?{speed:.68,range:.70,complex:.38}:difficulty==='hard'?{speed:1.52,range:1.85,complex:1.75}:{speed:1,range:1,complex:1};
 const elapsedEnemy=t*e.pace+e.phase,pattern=e.pattern||0;
 const baseSpeed=(e.fly?70+level.zone*13:39+level.zone*9)*tuning.speed;
 const patrolRadius=(e.fly?108:65)*tuning.range;
 const dxPlayer=player.x-e.x,dyPlayer=player.y-e.y;
 if(e.fly){
   const wave=pattern===0?Math.sin(elapsedEnemy*1.8)*35:pattern===1?Math.sin(elapsedEnemy*2.65)*55:pattern===2?Math.sin(elapsedEnemy*3.25)*26:Math.cos(elapsedEnemy*1.5)*65;
   const chase=difficulty==='hard'&&Math.abs(dxPlayer)<190?Math.max(-30,Math.min(30,dxPlayer*.20)):0;
   e.y=e.homeY+wave*tuning.complex*.72+(pattern===3?Math.sin(elapsedEnemy*.75)*17:0)+chase*.17;
   e.x+=e.dir*baseSpeed*dt*(pattern===2?.64+Math.abs(Math.sin(elapsedEnemy*2))*.7:1);
 }else{
   // Add pursuit bursts at high difficulty without leaving the home platform entirely.
   const isChasing=difficulty==='hard'&&Math.abs(dxPlayer)<165&&Math.abs(dyPlayer)<90;
   if(isChasing&&Math.abs(dxPlayer)>20)e.dir=Math.sign(dxPlayer);
   e.x+=e.dir*baseSpeed*dt*(pattern===1? .58+Math.abs(Math.sin(elapsedEnemy*1.9))*.9 :pattern===3?1+Math.sin(elapsedEnemy*1.7)*.27:1);
   e.y=e.homeY+(difficulty==='easy'?0:pattern===2?Math.sin(elapsedEnemy*2.8)*Math.min(6,tuning.complex*4):0);
 }
 if(e.x>e.home+patrolRadius){e.x=e.home+patrolRadius;e.dir=-1}
 else if(e.x<e.home-patrolRadius){e.x=e.home-patrolRadius;e.dir=1}
}if(rect(player,e))hurt()}let b=level.bossObj;if(b&&b.hp>0){b.hit=Math.max(0,b.hit-dt);b.phase=level.n===30?(b.hp<b.max/3?3:b.hp<b.max*2/3?2:1):1;b.x+=Math.sin(t*1.6)*dt*(45+b.phase*10);b.cool-=dt;if(b.cool<=0){b.cool=(level.n===30?1.4:2.4)-b.phase*.18;let dx=player.x-b.x,dy=player.y-b.y;let m=Math.hypot(dx,dy)||1;projectiles.push({x:b.x+35,y:b.y+35,vx:dx/m*(160+b.phase*45),vy:dy/m*(160+b.phase*45),life:4,r:11});sound(180,.18,'square',.025)}if(rect(player,b))hurt()}for(let p of projectiles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;if(rect(player,{x:p.x-p.r,y:p.y-p.r,w:p.r*2,h:p.r*2})){hurt();p.life=0}}projectiles=projectiles.filter(p=>p.life>0);for(let shot of heroShots){shot.x+=shot.vx*dt;shot.y+=shot.vy*dt;shot.life-=dt;let sr={x:shot.x-8,y:shot.y-8,w:16,h:16};for(let e of level.enemies){if(e.hp>0&&rect(sr,e)){damageEnemy(e,shot.power+Math.floor((save.weapon-1)/2)+Math.floor((save.level-1)/5)+(save.hero===2?1:0));shot.life=0;break}}if(shot.life>0&&level.bossObj?.hp>0&&rect(sr,level.bossObj)){damageBoss(level.bossObj,shot.power+Math.floor((save.weapon-1)/2)+Math.floor((save.level-1)/5)+(save.hero===2?1:0));shot.life=0}for(let sw of level.switches)if(rect(sr,sw))sw.on=true}heroShots=heroShots.filter(p=>p.life>0);for(let i of level.items){if(i.taken)continue;if(rect(player,{x:i.x-8,y:i.y-9,w:24,h:24})){i.taken=true;burst(i.x,i.y,i.type==='coin'?'#ffe05b':'#b9faff',8);sound(i.type==='coin'?850:630,.08);if(i.type==='coin')stageCoins+=1+(save.pet===0&&Math.random()<.25?1:0)+(save.shopLuck&&Math.random()<save.shopLuck*.12?1:0);else if(i.type==='gem')stageCoins+=10+(save.shopLuck||0);else if(i.type==='heart')player.hp=Math.min(player.max,player.hp+1);else if(i.type==='key')player.hasKey=true;else if(i.type==='weapon')equipWeapon(i.weapon);updateHUD()}}if(rect(player,level.exit))clearStage();for(let p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=350*dt;p.life-=dt}particles=particles.filter(p=>p.life>0);camera=clamp(player.x-330,0,level.width-W);updateHUD()}
function ellipseShape(x,y,rx,ry,color){ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill()}
function fantasyHero(x,y,kind,dir,walking,airborne,attackPhase=0,weaponIndex=0){
 // Original 2D skeletal-style animation. All positions are in game-world pixels.
 ctx.save(); ctx.translate(x+16,y+47); ctx.scale(dir,1);
 const variant=MODEL_VARIANT, phase=t*(variant===0?12.8:variant===1?15.2:11.7);
 const pace=walking?Math.sin(phase):0, lift=walking?Math.abs(Math.sin(phase))*.9:0;
 const strike=attackPhase>0?Math.max(0,Math.min(1,1-attackPhase/.22)):0;
 const reach=strike<.4?strike/.4:strike<.76?1:(1-(strike-.76)/.24);
 const ease=reach*reach*(3-2*reach);
 const palettes=[['#469a8b','#174f60','#cfb47d','#643c3f','#f4c5a1'],['#d16862','#5b405f','#efd08a','#763b44','#f3c4a5'],['#8aa2d2','#3d4c86','#e6d0a0','#dddbe8','#eebfa8']];
 const p=palettes[variant], skin=p[4], cloth=kind===2?'#9386c8':kind===3?'#81b9a1':p[0];
 const path=(pts,fill,line='#283248',lw=1.5)=>{ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i][0],pts[i][1]);ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(line){ctx.lineWidth=lw;ctx.strokeStyle=line;ctx.stroke()}};
 const oval=(cx,cy,rx,ry,fill,line=null)=>{ctx.beginPath();ctx.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);ctx.fillStyle=fill;ctx.fill();if(line){ctx.lineWidth=1.3;ctx.strokeStyle=line;ctx.stroke()}};
 const bone=(xa,ya,xb,yb,ww,fill)=>{ctx.strokeStyle='#293448';ctx.lineWidth=ww+2.3;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(xa,ya);ctx.lineTo(xb,yb);ctx.stroke();ctx.strokeStyle=fill;ctx.lineWidth=ww;ctx.stroke()};
 // Shadow responds to the actual phase of the gait.
 ctx.globalAlpha=airborne?.16:.25;oval(0,0,walking?17:14,2.7,'#10142a');ctx.globalAlpha=1;
 ctx.translate(0,airborne?-1.9:lift);
 // Scarf / hair / cape trail all follow running speed independently.
 if(variant===0){path([[-7,-34],[-18,-32],[-22-Math.abs(pace)*3,-19],[-14,-12],[-2,-20]],'#c18f53');path([[-4,-36],[-16,-32],[-17,-16],[-9,-13],[2,-28]],p[1]);}
 if(variant===1){path([[-3,-36],[-16,-32],[-22,-11],[-5,-19],[8,-28]],'#a64e62');path([[5,-35],[17,-32],[21,-12],[11,-19]],'#efc37c');}
 if(variant===2){path([[-8,-37],[-17,-32],[-17,-12],[-1,-16],[13,-10],[18,-29],[8,-37]],'#6d7fa9');path([[-9,-35],[-13,-31],[-12,-18],[-6,-16]],'#b6c9ec');}
 // Legs: real independent hip + knee phases (not body bob or alternating flat rectangles).
 for(const side of [-1,1]){
   const swing=airborne?side*5:pace*side*(variant===1?8:6.5);
   const kneeX=side*5+swing*.52, kneeY=airborne?-14:-12+Math.max(0,-side*pace)*2;
   const bootX=side*5+swing, bootY=airborne?-6:(-3-Math.max(0,side*pace)*5);
   bone(side*5,-19,kneeX,kneeY,6,p[1]);oval(kneeX,kneeY,3.1,3.2,p[2]);
   bone(kneeX,kneeY,bootX,bootY,5,kind===0?'#4d6682':p[1]);
   path([[bootX-4,bootY-1],[bootX+4,bootY-1],[bootX+6,bootY+3],[bootX-5,bootY+3]],'#334054');
   ctx.strokeStyle=p[2];ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(bootX-2,bootY);ctx.lineTo(bootX+4,bootY);ctx.stroke();
 }
 // Waist, tailored silhouette, coat folds and layered shoulder elements.
 path([[-11,-33],[10,-33],[13,-17],[7,-13],[-9,-14],[-14,-19]],cloth);
 path([[1,-32],[10,-32],[11,-18],[4,-16]],p[1],null);
 path([[-11,-18],[11,-18],[8,-13],[-8,-13]],p[1]);
 path([[-9,-29],[9,-29],[9,-25],[-9,-25]],p[2]);
 oval(0,-27,2,2.2,'#ffebbd');
 if(variant===0){path([[-12,-35],[-6,-39],[10,-38],[15,-33],[11,-29],[-9,-30]],'#508f85');path([[-10,-34],[-6,-36],[-3,-30],[-8,-27]],'#e9e4c6');}
 if(variant===1){path([[-13,-34],[-6,-40],[10,-39],[16,-32],[10,-28],[-10,-29]],'#bf5d63');path([[1,-39],[9,-37],[11,-30],[4,-28]],'#eea38a');}
 if(variant===2){path([[-13,-35],[-6,-40],[10,-40],[15,-33],[10,-29],[-10,-29]],'#a6b6dc');path([[-11,-35],[-5,-37],[-3,-30],[-10,-29]],'#e4dfc9');path([[8,-37],[14,-34],[12,-28],[6,-30]],'#e4dfc9');}
 // Back arm is allowed to counter-swing while running.
 const rear=walking?pace*3:0;bone(-9,-32,-13-rear,-24,5,cloth);bone(-13-rear,-24,-12-rear,-19,4,skin);
 // Neck, ears, large expressive but restrained head proportions.
 oval(0,-39,4.3,5,skin);
 if(variant===1){path([[-10,-48],[-18,-56],[-12,-43]],skin);path([[10,-48],[19,-56],[12,-43]],skin)}
 else{oval(-10,-47,2.2,3,skin);oval(10,-47,2.2,3,skin)}
 oval(0,-49,11.4,12.4,skin,'#795b65');oval(3,-46,8,9,'#f8d5b2');
 // Every model's hair has a different profile, rather than a recolored helmet.
 if(variant===0){
   path([[-12,-51],[-12,-60],[-6,-67],[4,-68],[13,-62],[14,-52],[8,-59],[4,-58],[-3,-62],[-9,-55]],'#583c45');
   path([[-12,-58],[-7,-66],[-2,-68],[0,-61],[-5,-56]],'#815953');
   path([[8,-62],[14,-58],[13,-46],[8,-50]],'#674453');
 }else if(variant===1){
   path([[-13,-51],[-13,-63],[-6,-69],[5,-69],[14,-64],[15,-53],[8,-60],[1,-57],[-6,-61]],'#6e3959');
   path([[-9,-65],[-2,-69],[10,-68],[3,-60],[-5,-59]],'#a45b66');
   // High ponytail with a small running sway.
   path([[11,-64],[20,-59+pace*2],[24,-48+pace*3],[17,-52],[10,-59]],'#8f425b');
   path([[-9,-65],[-13,-77],[-4,-73],[-2,-65]],'#8c425c');
 }else{
   path([[-13,-51],[-12,-64],[-3,-70],[8,-69],[14,-61],[15,-49],[8,-58],[3,-59],[-5,-57]],'#e1d6e3');
   path([[-10,-62],[-3,-71],[1,-68],[-5,-57]],'#f4ebf0');
   path([[11,-64],[16,-59],[16,-43],[12,-46]],'#b4a3c4');
   path([[1,-70],[8,-76],[12,-68]],'#f4e8f2');
 }
 // Eyes are placed on the forward half of a 3/4 profile, not two front-facing dots.
 oval(2.4,-49,2.35,3.0,'#fff8eb');oval(3.25,-49,1.36,2.4,variant===2?'#456d9e':'#405b62');oval(3.55,-49.7,.52,.8,'#fff');
 ctx.strokeStyle='#493f50';ctx.lineWidth=1.25;ctx.beginPath();ctx.moveTo(-.5,-54);ctx.quadraticCurveTo(2,-55,5,-54);ctx.stroke();
 oval(8,-46,1.25,.9,'#d99685');ctx.strokeStyle='#a46268';ctx.lineWidth=.95;ctx.beginPath();ctx.moveTo(3,-41);ctx.quadraticCurveTo(5,-40,6.5,-42);ctx.stroke();
 oval(7,-44,2.3,1.3,'#eaa5a4');
 // Front arm: shoulder -> elbow -> hand; sword hand advances INTO the view.
 const elbowX=11+(ease*4)+(walking?pace:0),elbowY=-26+ease*2;
 const handX=13+ease*(variant===1?18:15), handY=-23-ease*(variant===2?5:3);
 bone(10,-33,elbowX,elbowY,6,cloth);oval(10,-33,4.8,4.8,p[2]);
 bone(elbowX,elbowY,handX,handY,4,skin);oval(handX,handY,3.3,3.1,'#e6b08f');
 ctx.save();ctx.translate(handX,handY);
 const magic=kind>=2,weaponType=weaponIndex%5;
 if(magic){ctx.rotate(-.12-ease*.3);bone(0,6,10,-22,3,'#795f53');oval(10,-26,5+ease*1.5,5+ease*1.5,kind===2?'#bcadff':'#ffe2a3');}
 else{
   const blade=weaponType===3?35:weaponType===2?27:weaponType===4?24:32;
   const angle=(-.85+ease*.95)+(weaponType===3?.36:0);
   ctx.rotate(angle);bone(0,5,5,-4,3.5,'#634857');
   path([[-7,-6],[7,-6],[8,-3],[-7,-3]],'#e7be79');
   if(weaponType===2){bone(2,-5,2,-blade,3.5,'#684a46');path([[-9,-blade], [12,-blade-2],[14,-blade+9],[-8,-blade+10]],'#cbd8e7');}
   else if(weaponType===4){bone(2,-5,2,-blade,4,'#806a50');path([[-10,-blade-7],[11,-blade-7],[11,-blade+5],[-10,-blade+5]],'#c9d5e6');}
   else if(weaponType===3){bone(2,-5,2,-blade-4,2.5,'#80664c');path([[-7,-blade],[2,-blade-16],[9,-blade]],'#e6f0f9');}
   else{path([[-4,-6],[5,-6],[3,-blade],[1,-blade-10],[-2,-blade]],'#dce9ef');path([[0,-blade-8],[3,-blade],[1,-8]],'#fff');}
 }
 ctx.restore();ctx.restore();
}
function fantasyMonster(e){ctx.save();ctx.translate(e.x+e.w/2,e.y+e.h-3);const k=e.kind%5;const fill=['#bd6968','#749b73','#6f91bc','#c69b62','#8979b0'][k];const dark=['#683e52','#3c6457','#40557d','#795a47','#51476e'][k];
 ctx.fillStyle='#18223c55';ctx.beginPath();ctx.ellipse(0,-2,20,5,0,0,7);ctx.fill();
 ctx.fillStyle=fill;ctx.strokeStyle='#26354a';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(-19,-9);ctx.quadraticCurveTo(-25,-31,-12,-38);ctx.quadraticCurveTo(0,-47,14,-37);ctx.quadraticCurveTo(25,-27,19,-9);ctx.closePath();ctx.fill();ctx.stroke();
 ctx.fillStyle=dark;ctx.beginPath();ctx.moveTo(0,-41);ctx.quadraticCurveTo(17,-35,18,-14);ctx.lineTo(5,-12);ctx.closePath();ctx.fill();
 if(k===0){ctx.fillStyle='#7e3d51';ctx.beginPath();ctx.ellipse(0,-37,25,11,0,Math.PI,Math.PI*2);ctx.lineTo(25,-34);ctx.quadraticCurveTo(0,-48,-25,-34);ctx.fill();ctx.stroke()}
 else if(k===1||k===3){for(let side of [-1,1]){ctx.fillStyle=dark;ctx.beginPath();ctx.moveTo(side*11,-34);ctx.lineTo(side*19,-49);ctx.lineTo(side*5,-40);ctx.fill();ctx.stroke()}}
 else{for(let side of [-1,1]){ctx.fillStyle='#d3d7e3';ctx.beginPath();ctx.moveTo(side*12,-35);ctx.lineTo(side*18,-45);ctx.lineTo(side*16,-28);ctx.fill()}}
 ctx.strokeStyle='#263044';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(-12,-24);ctx.lineTo(-4,-22);ctx.moveTo(4,-22);ctx.lineTo(12,-24);ctx.stroke();ctx.fillStyle='#f4e2c9';ctx.beginPath();ctx.arc(-7,-21,2,0,7);ctx.arc(7,-21,2,0,7);ctx.fill();ctx.restore();}
function fantasyPet(x,y,kind){ctx.save();ctx.translate(x,y+Math.sin(t*5)*5);let petScale=save.petLevel>=15?1.65:save.petLevel>=8?1.32:1;ctx.scale(petScale,petScale);if(save.petLevel>=8){ctx.globalAlpha=.32;ellipseShape(0,0,18,17,['#ffe98b','#b6e7ff','#e5b5ff'][kind]);ctx.globalAlpha=1}ellipseShape(0,0,12,11,['#ffe17d','#b6e7ff','#d6b0ff'][kind]);ellipseShape(-4,-2,2,2,'#30364b');ellipseShape(4,-2,2,2,'#30364b');ellipseShape(0,3,3,2,'#f09b81');if(kind===1){ellipseShape(-10,-9,5,8,'#d4f5ff');ellipseShape(10,-9,5,8,'#d4f5ff')}if(save.petLevel>=15){ctx.strokeStyle='#fff8bd';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,17,Math.PI*1.1,Math.PI*1.9);ctx.stroke()}if(kind===2){ctx.fillStyle='#ad8cfa';ctx.beginPath();ctx.moveTo(-8,-7);ctx.lineTo(-14,-19);ctx.lineTo(0,-10);ctx.fill()}ctx.restore()}
// Illustrated scene assets. Keep the original Canvas scenery as a fallback if an asset fails to load.
const sceneArt=Array.from({length:30},(_,i)=>{const img=new Image();img.src=`assets/backgrounds/stage-${String(i+1).padStart(2,'0')}.svg`;return img});
function drawSceneArt(zone){const img=sceneArt[(level?.n||1)-1];if(!img?.complete||!img.naturalWidth)return false;const scale=H/img.naturalHeight;const tile=img.naturalWidth*scale;const scroll=(camera*.075)%tile;for(let x=-scroll-tile;x<W+tile;x+=tile)ctx.drawImage(img,x,0,tile,H);return true}
function draw(){const zone=level?.zone||0,theme=themes[zone],g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,theme.sky[0]);g.addColorStop(1,theme.sky[1]);ctx.fillStyle=g;ctx.fillRect(0,0,W,H);const hasSceneArt=drawSceneArt(zone);if(!hasSceneArt)drawAtmosphere(zone);let offset=camera*.2;for(let i=0;i<(hasSceneArt?0:13);i++){let x=((i*170-offset)%(W+240)+W+240)%(W+240)-100,y=120+(i*71)%250;ctx.fillStyle=theme.hill;ctx.globalAlpha=.55;ctx.beginPath();ctx.ellipse(x,y+170,130,80,0,0,7);ctx.fill();ctx.globalAlpha=1;ctx.fillStyle='#ffffffaa';ctx.beginPath();ctx.ellipse(x+40,y-40,48,15,0,0,7);ctx.fill()}// Atmospheric fireflies, distant towers and layered clouds.
ctx.save();ctx.globalAlpha=.17;ctx.fillStyle=theme.edge;for(let i=0;i<(hasSceneArt?0:9);i++){let bx=((i*240-camera*.11)%(W+300)+W+300)%(W+300)-120;ctx.fillRect(bx,170+(i%3)*22,35,220);ctx.beginPath();ctx.moveTo(bx-12,175+(i%3)*22);ctx.lineTo(bx+17,135+(i%3)*22);ctx.lineTo(bx+48,175+(i%3)*22);ctx.fill()}ctx.restore();for(let i=0;i<36;i++){const fx=((i*173+Math.sin(t*.5+i)*22-camera*.32)%(W+40)+W+40)%(W+40),fy=75+(i*71)%390+Math.sin(t*1.4+i)*12;ctx.globalAlpha=.23+.22*Math.sin(t*2+i)**2;ellipseShape(fx,fy,1.5+(i%3),1.5+(i%3),i%2?'#fff9c0':'#ffffff')}ctx.globalAlpha=1;
// Parallax storybook scenery: mountain ridges, soft clouds, floating lights.
ctx.save();ctx.globalAlpha=.26;for(let layer=0;layer<(hasSceneArt?0:3);layer++){ctx.fillStyle=[theme.edge,theme.hill,theme.land][layer];ctx.beginPath();ctx.moveTo(0,H);for(let px=0;px<=W+30;px+=30){const v=310+layer*42+Math.sin((px+camera*(.06+layer*.04))*.008+layer)*45+Math.sin((px+camera*.07)*.017+layer)*17;ctx.lineTo(px,v)}ctx.lineTo(W,H);ctx.closePath();ctx.fill()}ctx.restore();
for(let k=0;k<(hasSceneArt?0:7);k++){let cx=((k*211-camera*.09)%(W+300)+W+300)%(W+300)-110,cy=85+(k%3)*55;ctx.globalAlpha=.32;ellipseShape(cx,cy,60,14,'#fff');ellipseShape(cx+33,cy-9,34,18,'#fff');ctx.globalAlpha=1}
if(!level)return;ctx.save();ctx.translate(-Math.round(camera)+(shake?Math.random()*shake-shake/2:0),shake?Math.random()*shake/2:0);for(let d of level.decor){ctx.save();ctx.translate(d.x,d.y);if(d.type===0){ctx.fillStyle='#785c6a';ctx.fillRect(-5,-33,10,34);for(let j=0;j<3;j++)ellipseShape(0,-43-j*13,24-j*4,16,zone===3?'#d8f7ff':'#55b98b')}else if(d.type===1){ellipseShape(0,-9,12,9,'#76b778');for(let j=0;j<5;j++){let a=j*Math.PI*2/5;ellipseShape(Math.cos(a)*11,-22+Math.sin(a)*11,8,8,'#ffc4da')}ellipseShape(0,-22,6,6,'#ffeb9a')}else{ctx.shadowColor='#c6eaff';ctx.shadowBlur=15;ctx.fillStyle='#92f4ff';ctx.beginPath();ctx.moveTo(0,-43);ctx.lineTo(15,-20);ctx.lineTo(0,-2);ctx.lineTo(-15,-20);ctx.closePath();ctx.fill();ctx.shadowBlur=0}ctx.restore()}for(let p of level.platforms){if(p.gone)continue;const variant=level.stageVariant;ctx.fillStyle=theme.land;ctx.fillRect(p.x,p.y,p.w,p.h);ctx.fillStyle=theme.edge;ctx.fillRect(p.x,p.y,p.w,12);ctx.save();ctx.globalAlpha=.27;if(variant===0){ctx.fillStyle='#d6f8a1';for(let q=p.x;q<p.x+p.w;q+=22)ctx.fillRect(q,p.y+10,11,4)}else if(variant===1){ctx.strokeStyle='#f4e2b9';for(let q=p.x+16;q<p.x+p.w;q+=36){ctx.strokeRect(q,p.y+15,31,22)}}else if(variant===2){ctx.fillStyle='#e5d3ff';for(let q=p.x+15;q<p.x+p.w;q+=44){ctx.beginPath();ctx.moveTo(q,p.y+12);ctx.lineTo(q+12,p.y+35);ctx.lineTo(q+23,p.y+12);ctx.fill()}}else if(variant===3){ctx.fillStyle='#ffe1a0';for(let q=p.x+15;q<p.x+p.w;q+=39)ctx.fillRect(q,p.y+19,22,5)}else{ctx.fillStyle='#b3f4fa';for(let q=p.x+10;q<p.x+p.w;q+=35){ctx.beginPath();ctx.arc(q,p.y+16,6,0,7);ctx.fill()}}ctx.restore();ctx.fillStyle='#ffffff20';for(let sx=p.x+9;sx<p.x+p.w;sx+=28)ctx.fillRect(sx,p.y+21+(Math.floor(sx/28)%3)*12,12,3);ctx.fillStyle='#ffffff45';for(let x=p.x+12;x<p.x+p.w;x+=42)ctx.fillRect(x,p.y+3,19,3)}for(let p of level.moving){p.y=p.baseY+Math.sin(t*1.8+p.phase)*30;ctx.fillStyle='#f9cf75';ctx.fillRect(p.x,p.y,p.w,p.h);ctx.fillStyle='#a26b57';ctx.fillRect(p.x,p.y+11,p.w,5)}for(let h of level.hazards){if(h.active===false)continue;if(h.type==='spike'||h.type==='pulse'){ ctx.fillStyle='#f7f7ff';for(let x=h.x;x<h.x+h.w;x+=13){ctx.beginPath();ctx.moveTo(x,h.y+16);ctx.lineTo(x+6,h.y);ctx.lineTo(x+13,h.y+16);ctx.fill()}}else{ctx.fillStyle='#d7ecfa';ctx.beginPath();ctx.arc(h.x+12,h.y+12,14,0,7);ctx.fill();ctx.fillStyle='#68769a';ctx.beginPath();ctx.arc(h.x+12,h.y+12,6,0,7);ctx.fill()}}for(let s of level.switches){ctx.fillStyle=s.on?'#77f1a2':'#ff9e68';ctx.fillRect(s.x,s.y,s.w,s.h);ctx.fillStyle='#fff';ctx.fillRect(s.x+6,s.y+5,18,5)}for(let d of level.doors){if(d.open)continue;ctx.fillStyle='#8863aa';ctx.fillRect(d.x,d.y,d.w,d.h);ctx.fillStyle='#e8d6ff';ctx.fillRect(d.x+8,d.y+8,14,55)}for(let i of level.items){if(i.taken)continue;ctx.font='25px serif';ctx.fillText({coin:'🪙',gem:'💎',heart:'❤️',key:'🗝️',weapon:weapons[i.weapon||0].icon}[i.type],i.x,i.y+Math.sin(t*4+i.x)*4)}for(let e of level.enemies){if(e.hp<=0)continue;ctx.globalAlpha=e.hit>0?.5:1;fantasyMonster(e);ctx.globalAlpha=1}let b=level.bossObj;if(b&&b.hp>0){ctx.save();ctx.translate(b.x+38,b.y+48);let pulse=1+Math.sin(t*3)*.055;ctx.scale(pulse,pulse);ellipseShape(0,0,40,44,['#85e3a0','#b5a5ff','#ffb16e','#a4e8ff','#9ad5e6','#d2a0df'][zone]);ellipseShape(-13,-7,5,7,'#26324a');ellipseShape(13,-7,5,7,'#26324a');ctx.strokeStyle='#6e4766';ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,7,14,.12,Math.PI-.12);ctx.stroke();ctx.fillStyle='#ffe49d';ctx.beginPath();ctx.moveTo(-22,-33);ctx.lineTo(-15,-58);ctx.lineTo(0,-41);ctx.lineTo(16,-59);ctx.lineTo(23,-33);ctx.closePath();ctx.fill();ctx.restore();ctx.fillStyle='#492d50';ctx.fillRect(b.x-20,b.y-18,115,12);ctx.fillStyle='#ff5d78';ctx.fillRect(b.x-20,b.y-18,115*Math.max(0,b.hp/b.max),12);if(level.n===30){ctx.fillStyle='#fff';ctx.font='bold 15px sans-serif';ctx.fillText('PHASE '+b.phase,b.x,b.y-24)}}for(let p of heroShots){ctx.save();ctx.translate(p.x,p.y);ctx.rotate(Math.atan2(p.vy,p.vx));ctx.shadowColor=save.hero===2?'#b997ff':'#ffe39a';ctx.shadowBlur=16;ctx.fillStyle=save.hero===2?'#b997ff':'#ffe39a';ctx.beginPath();ctx.ellipse(0,0,13,6,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(4,0,6,3,0,0,Math.PI*2);ctx.fill();ctx.restore()}for(let p of projectiles){ctx.fillStyle='#ff7a9c';ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,7);ctx.fill()}ctx.fillStyle='#ffd55b';ctx.fillRect(level.exit.x,level.exit.y,5,85);ctx.font='42px serif';ctx.fillText('🏁',level.exit.x-6,level.exit.y+12);ctx.fillStyle='#fff';ctx.font='bold 16px sans-serif';ctx.fillText('EXIT',level.exit.x-4,level.exit.y-10);ctx.font='35px serif';ctx.fillText(level.checkpointOn?'🚩':'🏳️',level.checkpointX,370);if(player){ctx.globalAlpha=player.inv>0&&Math.floor(t*14)%2===0?.5:1;ctx.font='43px serif';ctx.save();ctx.translate(player.x+16,player.y+41);ctx.scale(player.dir,1);ctx.shadowColor=heroes[save.hero||0].color;ctx.shadowBlur=17;fantasyHero(-16,-41,save.hero||0,1,Math.abs(player.vx)>25, !player.ground,player.attack,player.weapon);ctx.shadowBlur=0;/* Animated held weapon replaces detached semicircle slash. */ctx.restore();ctx.globalAlpha=1;if(player.guardTimer>0){ctx.save();ctx.globalAlpha=.3+.09*Math.sin(t*9);ctx.strokeStyle=save.hero===0?'#8deeff':'#b6ffb0';ctx.lineWidth=5;ctx.shadowColor=ctx.strokeStyle;ctx.shadowBlur=18;ctx.beginPath();ctx.ellipse(player.x+16,player.y+22,28,36,0,0,Math.PI*2);ctx.stroke();ctx.restore()}fantasyPet(player.x-18,player.y+8,save.pet);ctx.fillStyle='#fff';ctx.font='bold 12px sans-serif';ctx.fillText('Lv.'+save.level,player.x-2,player.y-14);}for(let p of particles){ctx.globalAlpha=clamp(p.life,0,1);ctx.fillStyle=p.color;ctx.fillRect(p.x,p.y,5,5)}ctx.globalAlpha=1;ctx.restore();drawAdventureOverlay();if(noticeTime>0){ctx.fillStyle='#1c285dbb';ctx.fillRect(270,75,420,40);ctx.fillStyle='#fff';ctx.font='bold 22px sans-serif';ctx.textAlign='center';ctx.fillText(notice,480,103);ctx.textAlign='left'}if(mode==='play'&&level.boss&&level.bossObj.hp>0){ctx.fillStyle='#26385ac7';ctx.fillRect(340,45,280,12);ctx.fillStyle='#ff7790';ctx.fillRect(340,45,280*level.bossObj.hp/level.bossObj.max,12)}}
// Layered scenery and readable adventure HUD, drawn without external image dependencies.
function drawAtmosphere(zone){
 ctx.save();const sunX=zone===2?755:zone===5?710:790,sunY=zone===1?120:105;
 const halo=ctx.createRadialGradient(sunX,sunY,6,sunX,sunY,165);
 halo.addColorStop(0,zone===5?'#ff9cc066':'#fff9ceaa');halo.addColorStop(1,'#ffffff00');ctx.fillStyle=halo;ctx.fillRect(sunX-170,sunY-170,340,340);
 ctx.globalAlpha=.72;ctx.fillStyle=zone===5?'#ffb8de':'#fff9d8';ctx.beginPath();ctx.arc(sunX,sunY,zone===1?28:39,0,Math.PI*2);ctx.fill();
 for(let layer=0;layer<3;layer++){
  const par=.07+layer*.095,base=365+layer*45,amp=55-layer*11;
  ctx.beginPath();ctx.moveTo(0,H);ctx.lineTo(0,base);
  for(let x=0;x<=W+18;x+=18){const world=x+camera*par;const y=base+Math.sin(world*.006+layer*1.7)*amp+Math.sin(world*.014+layer)*amp*.28;ctx.lineTo(x,y)}
  ctx.lineTo(W,H);ctx.closePath();ctx.fillStyle=[['#d6e9e0','#a7d6c2','#75bca3'],['#959cd4','#777fc2','#5b67a5'],['#ffd4a0','#d49b87','#a66b73'],['#e4f7ff','#c2e9f2','#94c8dc'],['#d2eff0','#a9d5c7','#79b6aa'],['#b6a2cc','#927ab3','#6c588f']][zone][layer];ctx.globalAlpha=.27+layer*.12;ctx.fill();
 }
 ctx.globalAlpha=.75;
 for(let i=0;i<22;i++){let x=((i*167-camera*(.12+i%3*.07))%(W+130)+W+130)%(W+130)-65;let y=65+(i*97)%300;let r=1.2+(i%4)*.5;ctx.fillStyle=i%3===0?'#fff0a7':'#ffffff';ctx.globalAlpha=.25+.3*(.5+.5*Math.sin(t*1.5+i));ctx.beginPath();ctx.arc(x,y+Math.sin(t+i)*5,r,0,7);ctx.fill()}
 ctx.restore();
}
function drawAdventureOverlay(){if(mode!=='play'||!level||!player)return;
 ctx.save();
 if(combo>=2&&comboTimer>0){ctx.textAlign='right';ctx.font='bold '+(20+Math.min(combo,12))+'px sans-serif';ctx.shadowColor='#ffcf70';ctx.shadowBlur=13;ctx.fillStyle='#fff5b8';ctx.fillText(combo+' COMBO!',930,118);ctx.shadowBlur=0;ctx.font='13px sans-serif';ctx.fillText('연속 몬스터 처치',930,139)}
 ctx.restore();}
let prev=0;function frame(ms){let dt=Math.min((ms-prev)/1000||0,.032);prev=ms;if(mode==='play')update(dt);draw();requestAnimationFrame(frame)}
let joystickAxis=0;
const joy=document.querySelector('#joystick'),joyKnob=document.querySelector('#joystick-knob');
let joyPointer=null;
function updateJoystick(e){const r=joy.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,limit=r.width*.29;const dx=e.clientX-cx,dy=e.clientY-cy,length=Math.hypot(dx,dy)||1,scale=Math.min(1,limit/length);const nx=dx*scale,ny=dy*scale;joyKnob.style.left=`calc(50% + ${nx}px)`;joyKnob.style.top=`calc(50% + ${ny}px)`;let raw=nx/limit;joystickAxis=Math.abs(raw)<.13?0:Math.sign(raw)*((Math.abs(raw)-.13)/.87);}
function resetJoystick(){joyPointer=null;joystickAxis=0;joyKnob.style.left='50%';joyKnob.style.top='50%';}
joy.addEventListener('pointerdown',e=>{if(joyPointer!==null)return;e.preventDefault();joyPointer=e.pointerId;joy.setPointerCapture(e.pointerId);updateJoystick(e)});
joy.addEventListener('pointermove',e=>{if(e.pointerId===joyPointer){e.preventDefault();updateJoystick(e)}});
for(const name of ['pointerup','pointercancel','lostpointercapture'])joy.addEventListener(name,e=>{if(e.pointerId===joyPointer)resetJoystick()});
window.addEventListener('blur',resetJoystick);
const mapping={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowUp:'jump',Space:'jump',KeyW:'jump',KeyZ:'attack',KeyJ:'attack',KeyX:'attack',KeyK:'attack',};window.addEventListener('keydown',e=>{if(mapping[e.code]){e.preventDefault();keys[mapping[e.code]]=true}if(!e.repeat&&e.code==='KeyQ')cycleWeapon(-1);if(!e.repeat&&e.code==='KeyE')cycleWeapon(1);if(e.code==='Escape'){if(mode==='play')pause();else if(mode==='pause')resume()}});window.addEventListener('keyup',e=>{if(mapping[e.code]){e.preventDefault();keys[mapping[e.code]]=false}});document.querySelectorAll('[data-key]').forEach(b=>{const k=b.dataset.key;b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);keys[k]=true;b.classList.add('down')});for(let event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,()=>{keys[k]=false;b.classList.remove('down')})});function pause(){mode='pause';show('⏸ 일시정지','잠시 쉬었다가 다시 모험하세요!');mode='pause';button('▶ 계속하기',resume);button('🔁 스테이지 다시 시작',()=>loadStage(level.n),true);button('🗺 월드맵',worldMap,true);button('🏠 처음으로',startMenu,true)}function resume(){mode='play';ui.screen.classList.add('hidden')};document.querySelector('#pause').onclick=()=>{if(mode==='play')pause();else if(mode==='pause')resume()};document.addEventListener('visibilitychange',()=>{if(document.hidden&&mode==='play')pause()});
// WORLDCRAFT EDITION: thirty deterministic stage-specific traversal systems.
const stageArchitectures=['숲의 흔들다리','고목의 뿌리길','버섯 계단','수호자의 폐허','가시 덩굴 관문','수정 광산','반사광 협곡','수정 승강장','광맥 미로','균열의 제단','황혼의 절벽','모래시계 유적','바람의 첨탑','화염 분화구','태양의 문','얼어붙은 호수','눈보라 통로','빙하의 톱니','서리 탑','백야의 성벽','잊힌 정원','가시꽃 회랑','고대 수로','별빛 온실','정령의 성소','공중 회랑','중력의 계단','마력 회전탑','별의 심판대','최후의 성채'];
const zoneMaterials=[['#315d50','#79b38b','#173b34'],['#4a4b81','#a6b3ed','#2a2955'],['#775342','#edb36b','#442f37'],['#4a7794','#b9e8f2','#284c6b'],['#5b7461','#b5d9a5','#344d42'],['#4c426e','#c2b2f6','#272444']];
const oldMakeLevel=makeLevel;
makeLevel=function(n){
 const l=oldMakeLevel(n),rng=rand(n*9781+611),motif=(n-1)%10,zone=l.zone;
 l.architecture=stageArchitectures[n-1];l.structures=[];l.artifacts=[];l.wind=0;
 // Each stage gets a distinct macro-layout and traversal signature, not merely a new wallpaper.
 const platforms=l.platforms.filter(p=>p.w>145&&p.x>530&&p.x<l.width-490);
 platforms.forEach((p,i)=>{
  if(i%3===1){const lift=[-35,-80,-120,30,55][(n+i)%5];p.y+=lift;p.h=540-p.y;}
  if(i%5===3&&n>2){p.w=Math.max(155,p.w-32);}
  if((i+n)%7===0){l.structures.push({x:p.x+p.w*.55,y:p.y,type:(n+i)%6,scale:.8+rng()*.6});}
  if(i%4===2){const offset=(n*11+i*17)%55;l.platforms.push({x:p.x+offset,y:p.y-112-(n%3)*14,w:90,h:15,crumble:n>12&&i%8===2,timer:0});}
 });
 // Stage signatures: fans, laser gates, pendulums, falling icicles, geysers,
 // rotating blades, rising platforms, crumbling bridges and timed crystal fields.
 const count=4+Math.floor(n/7);
 for(let i=0;i<count;i++){
  const anchor=platforms[Math.min(platforms.length-1,Math.floor((i+.5)*platforms.length/count))];
  if(!anchor)continue;
  const x=anchor.x+Math.min(anchor.w-65,45+(i*47+n*19)%(Math.max(70,anchor.w-85)));
  const kind=(motif+i*3+zone)%9;
  if(kind===0){l.artifacts.push({x,y:anchor.y-30,type:'wind',phase:i});}
  if(kind===1){l.artifacts.push({x,y:anchor.y-100,type:'pendulum',phase:i*.9,radius:70});}
  if(kind===2){l.artifacts.push({x,y:anchor.y-110,type:'laser',phase:i*1.4});}
  if(kind===3){l.artifacts.push({x,y:anchor.y-115,type:'icicle',phase:i*.8});}
  if(kind===4){l.artifacts.push({x,y:anchor.y-18,type:'geyser',phase:i*.8});}
  if(kind===5){l.artifacts.push({x,y:anchor.y-45,type:'gear',phase:i*.7});}
  if(kind===6){l.moving.push({x,y:anchor.y-90,baseY:anchor.y-90,w:100,h:16,phase:i*1.7+n*.2});}
  if(kind===7){l.platforms.push({x,y:anchor.y-78,w:100,h:16,crumble:true,timer:0});}
  if(kind===8){l.artifacts.push({x,y:anchor.y-25,type:'crystal',phase:i*1.2});}
 }
 // Alternate routes: overhead traversal paths with rewards, while ground path remains completable.
 for(let i=0;i<platforms.length;i+=6){const a=platforms[i];if(!a)continue;
  l.platforms.push({x:a.x+12,y:a.y-170,w:110,h:15});
  l.items.push({x:a.x+65,y:a.y-209,type:'gem',taken:false});
 }
 return l;
};
function artifactState(a){const v=t*2.4+a.phase;return {v,active:Math.sin(v)>-.1};}
const originalUpdate=update;
update=function(dt){
 originalUpdate(dt);
 if(mode!=='play'||!level||!player)return;
 for(const a of level.artifacts){
  const q=artifactState(a),dx=player.x+player.w/2-a.x,dy=player.y+player.h/2-a.y;
  if(a.type==='wind'&&Math.abs(dx)<85&&Math.abs(dy)<110){player.vx+=Math.sin(q.v)*75*dt;}
  if(a.type==='pendulum'&&Math.hypot(dx-Math.sin(q.v)*65,dy-65)<24)hurt();
  if(a.type==='laser'&&q.active&&Math.abs(dx)<12&&dy>-25&&dy<100)hurt();
  if(a.type==='icicle'&&q.active&&Math.abs(dx)<16&&dy>-10&&dy<120)hurt();
  if(a.type==='geyser'&&q.active&&Math.abs(dx)<23&&dy>-100&&dy<20)hurt();
  if(a.type==='gear'&&Math.hypot(dx,dy)<27)hurt();
  if(a.type==='crystal'&&q.active&&Math.abs(dx)<25&&Math.abs(dy)<26)hurt();
 }
};
const originalDraw=draw;
draw=function(){originalDraw();if(!level)return;
 const pal=zoneMaterials[level.zone];ctx.save();ctx.translate(-Math.round(camera),0);
 // Multi-layer silhouettes, architecture, dimensional stone/wood trim and animated mechanisms.
 for(const s of level.structures){ctx.save();ctx.translate(s.x,s.y);ctx.scale(s.scale,s.scale);
  ctx.fillStyle=pal[2];ctx.strokeStyle=pal[1];ctx.lineWidth=3;
  if(s.type%3===0){ctx.fillRect(-24,-105,48,105);ctx.strokeRect(-24,-105,48,105);ctx.fillStyle=pal[1];ctx.fillRect(-32,-110,64,13);ctx.fillRect(-27,-70,54,8);}
  else if(s.type%3===1){ctx.beginPath();ctx.moveTo(-35,0);ctx.lineTo(-25,-90);ctx.quadraticCurveTo(0,-125,25,-90);ctx.lineTo(35,0);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle=pal[1];ctx.beginPath();ctx.arc(0,-65,14,0,7);ctx.fill();}
  else{ctx.beginPath();ctx.moveTo(-35,0);ctx.lineTo(-22,-65);ctx.lineTo(0,-125);ctx.lineTo(24,-60);ctx.lineTo(36,0);ctx.closePath();ctx.fill();ctx.stroke();}
  ctx.restore();}
 for(const a of level.artifacts){const {v,active}=artifactState(a);ctx.save();ctx.translate(a.x,a.y);ctx.shadowBlur=active?17:4;ctx.shadowColor=pal[1];ctx.lineWidth=4;
  if(a.type==='pendulum'){ctx.strokeStyle='#e4e0cf';ctx.beginPath();ctx.moveTo(0,-72);ctx.lineTo(Math.sin(v)*65,-65+65);ctx.stroke();ctx.fillStyle='#e5b5a5';ctx.beginPath();ctx.arc(Math.sin(v)*65,0,19,0,7);ctx.fill();}
  else if(a.type==='laser'){ctx.fillStyle=pal[2];ctx.fillRect(-13,-5,26,18);ctx.fillStyle=active?'#fb779a':'#8e90a6';if(active){ctx.globalAlpha=.72;ctx.fillRect(-5,-125,10,130);}ctx.fillRect(-13,-5,26,10);}
  else if(a.type==='wind'){ctx.strokeStyle=pal[1];for(let j=0;j<3;j++){ctx.beginPath();ctx.arc(0,-18-j*22,18+j*4,v+j,v+j+Math.PI*1.3);ctx.stroke();}}
  else if(a.type==='icicle'){ctx.fillStyle=active?'#b8f7ff':'#7794aa';ctx.beginPath();ctx.moveTo(-15,-20);ctx.lineTo(0,active?110:25);ctx.lineTo(15,-20);ctx.closePath();ctx.fill();}
  else if(a.type==='geyser'){ctx.fillStyle='#dc8a64';ctx.fillRect(-22,0,44,12);if(active){ctx.fillStyle='#ffc56899';ctx.fillRect(-17,-100,34,100);}}
  else if(a.type==='gear'){ctx.translate(0,-10);ctx.rotate(v);ctx.fillStyle='#b3a8bf';for(let j=0;j<8;j++){ctx.rotate(Math.PI/4);ctx.fillRect(-6,-31,12,18)}ctx.beginPath();ctx.arc(0,0,22,0,7);ctx.fill();ctx.fillStyle='#4a3b5e';ctx.beginPath();ctx.arc(0,0,9,0,7);ctx.fill();}
  else if(a.type==='crystal'){ctx.fillStyle=active?'#ff86d9':'#7b78a8';ctx.beginPath();ctx.moveTo(0,-34);ctx.lineTo(20,-7);ctx.lineTo(0,17);ctx.lineTo(-20,-7);ctx.closePath();ctx.fill();}
  ctx.restore();}
 ctx.restore();if(mode==='play'){ctx.save();ctx.fillStyle='#101b30b8';ctx.fillRect(280,6,400,27);ctx.fillStyle='#f5e7c8';ctx.font='bold 15px sans-serif';ctx.textAlign='center';ctx.fillText(`${String(level.n).padStart(2,'0')}  ·  ${level.architecture}`,480,25);ctx.restore();}
};

startMenu();document.title='Magic Castle · 하늘의 수호자';requestAnimationFrame(frame);
})();

const THREE = globalThis.__MAGIC_THREE__;
if (!THREE) throw new Error('Three.js 엔진이 준비되지 않았습니다.');

// A hand-authored, original 3D character and world. No cropped images or downloaded 3D models.
const canvasRoot=document.getElementById('game');
const scene=new THREE.Scene();scene.fog=new THREE.Fog(0x74818d,24,66);
const cam=new THREE.OrthographicCamera(-9,9,5.06,-5.06,.1,160);
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio||1,innerWidth<900?1.2:1.8));renderer.setSize(innerWidth,innerHeight);
renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.35;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.setClearAlpha(0);canvasRoot.appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xc3e2ff,0x413a3a,2.5));
const sun=new THREE.DirectionalLight(0xffe2a5,3.5);sun.position.set(-8,18,13);sun.castShadow=true;
sun.shadow.mapSize.set(innerWidth<900?1024:2048,innerWidth<900?1024:2048);sun.shadow.camera.left=-22;sun.shadow.camera.right=22;sun.shadow.camera.top=20;sun.shadow.camera.bottom=-16;sun.shadow.bias=-.0002;sun.shadow.normalBias=.018;scene.add(sun);
const rim=new THREE.DirectionalLight(0x7edbff,2.8);rim.position.set(9,9,-9);scene.add(rim);
const bounce=new THREE.DirectionalLight(0xff9a67,.95);bounce.position.set(-6,5,9);scene.add(bounce);

const M={
  armor:new THREE.MeshStandardMaterial({color:0x3e6e9c,metalness:.56,roughness:.27}),
  armorDark:new THREE.MeshStandardMaterial({color:0x233d63,metalness:.48,roughness:.39}),
  steel:new THREE.MeshStandardMaterial({color:0xd7e7ee,metalness:.86,roughness:.17}),
  blade:new THREE.MeshPhysicalMaterial({color:0xc9efff,metalness:.86,roughness:.15,clearcoat:.85,clearcoatRoughness:.12}),
  gold:new THREE.MeshStandardMaterial({color:0xf8c674,metalness:.69,roughness:.28}),
  goldDeep:new THREE.MeshStandardMaterial({color:0xab6e38,metalness:.6,roughness:.35}),
  cloth:new THREE.MeshStandardMaterial({color:0x263a70,roughness:.76,side:THREE.DoubleSide}),
  clothLite:new THREE.MeshStandardMaterial({color:0x4d68a7,roughness:.75,side:THREE.DoubleSide}),
  hair:new THREE.MeshStandardMaterial({color:0x664137,roughness:.73}),
  hairLit:new THREE.MeshStandardMaterial({color:0x9f6842,roughness:.62}),
  skin:new THREE.MeshStandardMaterial({color:0xf1bc9f,roughness:.8}),
  shadow:new THREE.MeshStandardMaterial({color:0x271e36,roughness:.85}),
  white:new THREE.MeshStandardMaterial({color:0xfff7e8,roughness:.35}),
  iris:new THREE.MeshStandardMaterial({color:0x3e607b,roughness:.21}),
  black:new THREE.MeshStandardMaterial({color:0x131c2b,roughness:.33}),
  jewel:new THREE.MeshStandardMaterial({color:0x67e5f9,metalness:.27,roughness:.13,emissive:0x2290be,emissiveIntensity:.68}),
  bark:new THREE.MeshStandardMaterial({color:0x4b3637,roughness:.96}),
  barkLite:new THREE.MeshStandardMaterial({color:0x78514b,roughness:.95}),
  leaf:new THREE.MeshStandardMaterial({color:0x2a6960,roughness:.92,side:THREE.DoubleSide}),
  leafLite:new THREE.MeshStandardMaterial({color:0x478778,roughness:.91,side:THREE.DoubleSide}),
  moss:new THREE.MeshStandardMaterial({color:0x4f8c65,roughness:1}),
  mossLite:new THREE.MeshStandardMaterial({color:0x74ac75,roughness:1}),
  stone:new THREE.MeshStandardMaterial({color:0x667d85,roughness:1}),
  stoneTop:new THREE.MeshStandardMaterial({color:0x8f9997,roughness:1}),
  stoneShade:new THREE.MeshStandardMaterial({color:0x48535e,roughness:1}),
  enemy:new THREE.MeshStandardMaterial({color:0x39314d,roughness:.83}),
  enemyLit:new THREE.MeshStandardMaterial({color:0x665270,roughness:.77}),
  eyeFire:new THREE.MeshBasicMaterial({color:0xff5c9d}),
  spark:new THREE.MeshBasicMaterial({color:0xffd797,transparent:true,opacity:.9,depthWrite:false}),
};
const G={s: new THREE.SphereGeometry(1,24,16),sFine:new THREE.SphereGeometry(1,32,24),box:new THREE.BoxGeometry(1,1,1),cyl:new THREE.CylinderGeometry(1,1,1,12),cone:new THREE.ConeGeometry(1,1,10)};
function obj(parent,geo,mat,x=0,y=0,z=0){let o=new THREE.Mesh(geo,mat);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o}
function sphere(parent,mat,x,y,z,sx,sy,sz){let o=obj(parent,G.s,mat,x,y,z);o.scale.set(sx,sy,sz);return o}
function cube(parent,mat,x,y,z,w,h,d){let o=obj(parent,G.box,mat,x,y,z);o.scale.set(w,h,d);return o}
function cylinder(parent,mat,x,y,z,rt,rb,height,n=12){return obj(parent,new THREE.CylinderGeometry(rt,rb,height,n),mat,x,y,z)}
function cone(parent,mat,x,y,z,r,h){return obj(parent,new THREE.ConeGeometry(r,h,9),mat,x,y,z)}
function newGroup(parent,x=0,y=0,z=0){const g=new THREE.Group();g.position.set(x,y,z);parent.add(g);return g}
function between(parent,a,b,r,material,r2=r){const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b);const o=obj(parent,new THREE.CylinderGeometry(r2,r,A.distanceTo(B),9),material,...A.clone().add(B).multiplyScalar(.5).toArray());o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),B.sub(A).normalize());return o}
function smoothShape(parent,pts,depth,material){const shape=new THREE.Shape();shape.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)shape.lineTo(pts[i][0],pts[i][1]);shape.closePath();const mesh=obj(parent,new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelSegments:3,steps:1,bevelThickness:.06,bevelSize:.047,curveSegments:12}),material);mesh.position.z-=depth/2;return mesh}
function curvedSpike(parent,mat,points,baseR){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));let vs=[],ids=[];const segments=12,sides=7;const up=new THREE.Vector3(0,0,1);for(let i=0;i<=segments;i++){let t=i/segments,p=curve.getPoint(t),d=curve.getTangent(t).normalize(),a=new THREE.Vector3().crossVectors(d,up).normalize(),b=new THREE.Vector3().crossVectors(d,a).normalize(),r=baseR*Math.pow(1-t,.7)+.002;for(let k=0;k<sides;k++){const th=k/sides*Math.PI*2;const q=p.clone().addScaledVector(a,Math.cos(th)*r).addScaledVector(b,Math.sin(th)*r);vs.push(q.x,q.y,q.z);if(i<segments){let idx=i*sides+k,idx2=i*sides+(k+1)%sides;ids.push(idx,idx2,idx+sides,idx2,idx2+sides,idx+sides)}}}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vs,3));geo.setIndex(ids);geo.computeVertexNormals();return obj(parent,geo,mat)}
function torus(parent,mat,x,y,z,r,tube){return obj(parent,new THREE.TorusGeometry(r,tube,8,30),mat,x,y,z)}
function gem(parent,x,y,z,s=.12){let p=obj(parent,new THREE.OctahedronGeometry(s,0),M.jewel,x,y,z);p.rotation.z=Math.PI/4;return p}
function stitches(parent,x,y,z,n,mat=M.gold){for(let j=0;j<n;j++)sphere(parent,mat,x+(j-(n-1)/2)*.12,y,z,.028,.027,.027)}

// Head: proportional face, layered locks, expressive eyes and eyebrow geometry.
function knight(){
 const g=newGroup(scene);let body=newGroup(g,0,0,0);let hips=newGroup(body,0,1.0,0);
 // hanging tunic, layered armor hem
 smoothShape(body,[[-.38,.97],[-.54,.51],[-.3,.46],[0,.57],[.3,.46],[.54,.51],[.38,.97]],.5,M.cloth);
 for(const side of [-1,1]){smoothShape(body,[[side*.05,.51],[side*.25,.4],[side*.36,.72],[side*.23,.83]],.12,M.clothLite)}
 // anatomical tapered breastplate silhouette; no box body
 sphere(body,M.armorDark,0,1.67,0,.47,.67,.31);
 smoothShape(body,[[-.44,2.13],[-.23,2.3],[.22,2.3],[.45,2.09],[.46,1.54],[0,1.36],[-.46,1.54]],.39,M.armor);
 smoothShape(body,[[-.34,2.05],[0,1.8],[.34,2.05],[.29,1.55],[0,1.39],[-.29,1.55]],.065,M.armorDark);
 smoothShape(body,[[-.39,2.12],[0,2.26],[.39,2.12],[0,1.91]],.09,M.steel);
 gem(body,0,1.96,.334,.115);
 for(const side of [-1,1]){
  between(body,[side*.34,2.06,.28],[side*.19,1.42,.31],.019,M.gold);
  sphere(body,M.goldDeep,side*.34,2.1,.26,.08,.06,.08);
 }
 // high collar and belt with clasp, straps
 sphere(body,M.cloth,0,2.22,-.04,.33,.15,.29);
 cylinder(body,M.gold,0,1.11,0,.46,.49,.14,16);cube(body,M.goldDeep,0,1.11,.34,.27,.2,.11);gem(body,0,1.11,.405,.093);
 for(const side of [-1,1])cube(body,M.goldDeep,side*.35,1.05,.21,.08,.12,.08);
 // cape: mesh with gradient and animated folds
 const capePos=new Float32Array(5*7*3),capeInd=[];for(let i=0;i<4;i++)for(let j=0;j<6;j++){let a=i*7+j,b=a+7;capeInd.push(a,a+1,b,a+1,b+1,b)}
 const capeGeo=new THREE.BufferGeometry();capeGeo.setAttribute('position',new THREE.BufferAttribute(capePos,3));capeGeo.setIndex(capeInd);capeGeo.computeVertexNormals();const cape=obj(body,capeGeo,M.cloth);cape.castShadow=true;
 sphere(body,M.gold,.35,2.14,-.21,.08,.075,.07);sphere(body,M.gold,-.35,2.14,-.21,.08,.075,.07);
 // boots and animated legs: hip / knee / ankle bone hierarchy
 const legs=[];
 for(const side of [-1,1]){
  const leg=newGroup(body,side*.24,1.03,.015);
  sphere(leg,M.clothLite,0,-.23,.005,.23,.34,.24);
  sphere(leg,M.armor,0,-.26,.13,.20,.27,.17);
  let knee=newGroup(leg,0,-.48,0);
  sphere(knee,M.goldDeep,0,0,.13,.22,.17,.18);
  sphere(knee,M.armorDark,0,-.22,0,.19,.30,.20);
  smoothShape(knee,[[-.16,-.03],[.16,-.03],[.19,-.38],[-.19,-.38]],.14,M.armor);
  let foot=newGroup(knee,0,-.48,.11);
  sphere(foot,M.armorDark,0,.02,.18,.24,.18,.35);
  sphere(foot,M.steel,0,.07,.37,.21,.12,.22);
  cube(foot,M.goldDeep,0,-.085,.3,.44,.055,.53);
  legs.push({hip:leg,knee,foot});
 }
 // left shield arm
 const arms=[];
 for(const side of [-1,1]){
  const shoulder=newGroup(body,side*.49,2.06,.05);let upper=newGroup(shoulder,0,-.25,.015);
  sphere(upper,M.armor,0,-.14,0,.19,.32,.19);
  let elbow=newGroup(shoulder,0,-.49,0);
  sphere(elbow,M.goldDeep,0,.03,.02,.21,.20,.21);
  smoothShape(elbow,[[-.16,0],[.16,0],[.19,-.43],[-.19,-.43]],.21,M.steel);
  let wrist=newGroup(elbow,0,-.44,.01);sphere(wrist,M.armorDark,0,0,0,.2,.15,.2);
  sphere(wrist,M.skin,0,-.13,.055,.14,.14,.16);
  const pauldron=sphere(shoulder,M.armor,side*.05,-.02,-.02,.3,.27,.31);
  sphere(shoulder,M.steel,side*.02,.025,.13,.245,.11,.23);sphere(shoulder,M.gold,side*.23,-.055,.09,.063,.06,.058);
  curvedSpike(shoulder,M.steel,[[side*.16,.09,-.08],[side*.36,.24,-.06],[side*.53,.38,-.1]],.09);
  arms.push({shoulder,elbow,wrist});
 }
 const shield=newGroup(arms[0].wrist,-.05,-.15,.18);
 let shieldFace=smoothShape(shield,[[-.30,.35],[.32,.35],[.35,-.1],[0,-.52],[-.35,-.1]],.11,M.armor);
 smoothShape(shield,[[-.22,.26],[.22,.26],[.22,-.07],[0,-.36],[-.22,-.07]],.025,M.steel).position.z+=.10;
 gem(shield,0,-.02,.18,.14);sphere(shield,M.gold,0,.29,.16,.07,.07,.06);
 const swordRoot=newGroup(arms[1].wrist,0,-.10,.07);
 cylinder(swordRoot,M.goldDeep,0,.04,0,.085,.105,.37,12);sphere(swordRoot,M.gold,0,-.145,0,.12,.12,.12);
 const guard=smoothShape(swordRoot,[[-.39,.22],[-.23,.33],[0,.28],[.23,.33],[.39,.22],[.25,.15],[0,.18],[-.25,.15]],.13,M.gold);
 gem(swordRoot,0,.29,.16,.1);
 // Sword is actual sculpted 3D beveled geometry, not a static painted slash.
 smoothShape(swordRoot,[[-.135,.31],[-.14,1.54],[0,1.91],[.14,1.54],[.135,.31]],.09,M.blade);
 const ridge=cube(swordRoot,M.white,0,1.05,.105,.034,1.33,.03);ridge.castShadow=false;
 for(const dy of [.58,.82])sphere(swordRoot,M.gold,0,dy,.126,.027,.028,.02);
 // expressive 3.6-head-tall face. Visible from forward/side.
 const head=newGroup(body,0,2.4,.04);sphere(head,M.skin,0,.10,.02,.455,.47,.36);
 sphere(head,M.skin,0,-.17,.05,.36,.21,.33);
 for(const side of [-1,1]){
  sphere(head,M.skin,side*.431,-.015,.005,.105,.13,.12);
  sphere(head,M.skin,side*.43,-.017,.105,.057,.075,.046);
  // expressive eye with white, iris, tiny sparkle
  sphere(head,M.white,side*.187,.085,.329,.148,.117,.058);
  sphere(head,M.iris,side*.198,.09,.385,.076,.091,.032);
  sphere(head,M.black,side*.197,.086,.407,.035,.065,.013);
  sphere(head,M.white,side*.18,.121,.423,.024,.028,.011);
  let brow=sphere(head,M.hair,side*.184,.244,.354,.16,.033,.028);brow.rotation.z=side*.12;
  sphere(head,new THREE.MeshStandardMaterial({color:0xe29f8f}),side*.3,-.105,.317,.14,.04,.016);
 }
 sphere(head,M.skin,0,-.057,.385,.065,.077,.05);
 const smile=torus(head,M.hair,0,-.168,.354,.085,.012);smile.scale.y=.34;smile.rotation.z=Math.PI;
 // layered flowing hair sculpted using multiple variable-radius ribbons
 sphere(head,M.hair,0,.39,-.055,.49,.30,.39);
 curvedSpike(head,M.hairLit,[[-.4,.37,.17],[-.22,.53,.32],[.1,.49,.43],[.20,.30,.42]],.15);
 curvedSpike(head,M.hair,[[-.10,.51,.3],[.13,.58,.4],[.4,.44,.34],[.34,.15,.35]],.155);
 curvedSpike(head,M.hair,[[-.36,.4,.04],[-.52,.18,.02],[-.5,-.12,-.045],[-.42,-.32,-.12]],.16);
 curvedSpike(head,M.hairLit,[[.39,.34,.1],[.53,.12,.01],[.46,-.10,-.07],[.35,-.28,-.12]],.14);
 for(let i=0;i<6;i++){
  let xx=(i-2.5)*.15;curvedSpike(head,i%2?M.hair:M.hairLit,[[xx,.47,-.19],[xx+.035,.62,-.12],[xx+.10,.48,-.06],[xx+.06,.2,-.11]],.095)
 }
 // small gold headband and crest
 curvedSpike(head,M.gold,[[-.34,.40,.18],[0,.52,.31],[.31,.38,.2]],.035);gem(head,0,.54,.30,.07);
 return {g,body,hips,legs,arms,head,shield,swordRoot,capeGeo,capePos,cape,swordTip:new THREE.Vector3(0,1.91,0)};
}
const hero=knight();hero.g.position.set(-4.2,0,.35);

// Monster silhouette: shadow-wolf + purple crystal horns, ghostly hair, glowing eyes, claws.
function monster(x,type=0){let g=newGroup(scene,x,0,.5);
 let torso=newGroup(g,0,.75,0);sphere(torso,M.enemy,0,.15,0,.58,.64,.51);
 sphere(torso,M.enemyLit,0,.52,-.11,.44,.39,.42);
 for(const s of [-1,1]){
  curvedSpike(torso,M.enemy,[[s*.25,.47,-.12],[s*.55,1.09,-.08],[s*.51,1.49,-.06]],.20);
  curvedSpike(torso,M.enemyLit,[[s*.25,.43,-.05],[s*.40,.87,-.015],[s*.51,1.17,0]],.095);
  sphere(torso,M.eyeFire,s*.225,.19,.47,.118,.157,.064);
  sphere(torso,M.white,s*.205,.22,.524,.028,.040,.016);
  curvedSpike(torso,M.enemy,[[s*.44,-.05,.13],[s*.70,-.24,.26],[s*.75,-.52,.35]],.16);
  curvedSpike(torso,M.enemy,[[s*.31,-.15,-.11],[s*.53,-.55,-.18],[s*.66,-.68,-.14]],.16);
 }
 // jagged face armor
 smoothShape(torso,[[-.35,.03],[-.13,-.16],[0,-.06],[.13,-.16],[.35,.03]],.07,M.shadow).position.z+=.50;
 for(let i=-2;i<=2;i++)curvedSpike(torso,M.enemyLit,[[i*.18,.4,-.34],[i*.2,.72,-.40],[i*.3,.86,-.41]],.15);
 let tail=curvedSpike(torso,M.enemy,[[0,-.1,-.32],[.15,.1,-.85],[.40,.46,-1.3],[.3,.65,-1.53]],.22);
 let aura=new THREE.PointLight(0xf84d92,1.4,3);aura.position.set(0,.8,1);g.add(aura);
 g.scale.setScalar(type===1?1.27:.97);
 return {g,torso,x,phase:x*.58,type,hp:type===1?6:3,alive:true,shadow:torso};
}
const monsters=[monster(2.75,0),monster(10.7,0),monster(18.9,1),monster(27.5,0)];

// Richly dressed world: uneven stylized stone islands, scattered rocks, moss layers, arches, ivy, waterfalls, mushrooms.
const land=new THREE.Group();scene.add(land);
const rnd=(n)=>((Math.sin(n*127.1+78.23)*43758.5453)%1+1)%1;
const platforms=[{x:-3,w:18,y:0},{x:9.0,w:5.5,y:.6},{x:16.3,w:5.0,y:1.20},{x:23.2,w:5.6,y:.45},{x:31.2,w:8.5,y:0}];
for(const [pi,p] of platforms.entries()){
 const group=newGroup(land,p.x,p.y,-.2);
 let base=cube(group,M.stone,0,-.65,0,p.w,1.32,3.6);
 for(let j=0;j<Math.ceil(p.w*2.4);j++){
  let xx=-p.w/2+(.25+j*.42),h=.15+rnd(j+pi*71)*.3;
  let r=cube(group,(j+pi)%3?M.stoneTop:M.stone,xx,-.035,1.47,.45,.26,.55);r.rotation.z=(rnd(j*23+pi)-.5)*.2;
 }
 cube(group,M.moss,0,.12,0,p.w,.16,3.7);
 for(let j=0;j<Math.ceil(p.w*4);j++){
  let xx=-p.w/2+rnd(j*9+pi*101)*p.w, zz=(rnd(j*3+pi*10)-.5)*2.8;
  const flower=rnd(j*21+pi*99)>.87;
  if(flower){between(group,[xx,.13,zz],[xx+.05,.42,zz],.012,M.mossLite);sphere(group,j%2?M.gold:M.jewel,xx+.05,.43,zz,.075,.068,.075)}
  else {let stem=cone(group,j%3?M.moss:M.mossLite,xx,.23,zz,.08,.30);stem.rotation.z=(rnd(j+48)-.5)*.7}
 }
 // dense geology on exposed front edge
 for(let j=0;j<Math.ceil(p.w*1.5);j++){
  let xx=-p.w/2+rnd(j*37+pi*38)*p.w;
  let h=.45+rnd(j*51+pi*52)*.65;
  const rc=cube(group,j%2?M.stone:M.stoneShade,xx,-1.15,1.30,.3,h,.5);rc.rotation.z=(rnd(j*11+pi)-.5)*.3;
 }
}
// Secret chasm is traversable with double jump. Distinctive floating slabs over gaps.
for(const [x,y,w] of [[5.75,.65,1.25],[12.7,1.8,1.35],[20.6,1.5,1.3],[26.4,1.25,1.4]]){
 const g=newGroup(land,x,y,0);cube(g,M.stone,0,-.17,0,w,.38,2.6);cube(g,M.moss,0,.07,0,w,.12,2.8);
 cube(g,M.goldDeep,0,-.30,1.2,w,.065,.22);
}
const floaters=[{x:5.75,w:1.25,y:.65},{x:12.7,w:1.35,y:1.8},{x:20.6,w:1.3,y:1.5},{x:26.4,w:1.4,y:1.25}];
function makeTree(x,z,scale=1,tone=0){
 const t=newGroup(scene,x,0,z);t.scale.setScalar(scale);
 const material=tone?M.barkLite:M.bark;
 between(t,[0,-.25,0],[0,5.4,.0],.37,material,.21);
 for(const s of [-1,1]){
  curvedSpike(t,material,[[s*.06,1.2,.16],[s*.45,.55,.37],[s*.65,.2,.35]],.20);
  between(t,[s*.05,3.15,0],[s*1.55,4.15,.13],.17,material,.09);
  between(t,[s*.06,3.95,0],[s*1.27,5.25,-.22],.16,material,.1);
 }
 for(let i=0;i<6;i++){
  const ax=(rnd(i*7+x*2)-.5)*4.15,ay=4.75+(rnd(i*3+x*7)-.5)*2.2,az=(rnd(i*11+x*5)-.5)*1.4;
  const m=(i%3===0)?M.leafLite:M.leaf;
  const blob=sphere(t,m,ax,ay,az,1.02+rnd(i+x)*.47,.81+rnd(i*22+x)*.45,.80);blob.rotation.z=(rnd(i*30+x)-.5)*.45;
  // delicate paired leaf-shapes seen under canopy
  for(let k=0;k<3;k++){
   let xx=ax+(rnd(i*67+k*43+x)-.5)*1.5;let yy=ay+(rnd(i*45+k*71+x)-.5)*1.3;let zz=az+.56;
   let leaf=sphere(t,k%2?M.leaf:M.leafLite,xx,yy,zz,.16,.34,.04);leaf.rotation.z=(rnd(k*22+i+x)-.5)*2;
  }
 }
 // hanging moss and vines
 for(let i=0;i<7;i++){
  let xx=(rnd(i*23+x)-.5)*3.4,yy=5.1+rnd(i*33+x)*.65;
  curvedSpike(t,M.moss,[[xx,yy,.3],[xx+.08,yy-.5,.25],[xx-.06,yy-1.2,.3]],.024);
 }
 return t;
}
for(let i=0;i<18;i++){
 let xx=-18+i*3.35,zz=-9-(i%3)*1.1,sc=.9+rnd(i*55)*.6;
 makeTree(xx,zz,sc,i%3===0);
}
for(const [x,z,s] of [[-7,-2.9,1.3],[4,-4.7,1.14],[15,-5.4,1.45],[27,-4.4,1.25],[38,-3.8,1.55]])makeTree(x,z,s,1);
function ruin(x,z,height=4){let g=newGroup(scene,x,0,z);const h=height;
 for(const sx of [-1,1]){let c=cylinder(g,M.stone,sx*1.1,h*.5,0,.30,.41,h,10);c.rotation.z=sx*.035;
  cylinder(g,M.stoneTop,sx*1.1,.2,0,.43,.46,.2,12);cylinder(g,M.stoneTop,sx*1.1,h-.14,0,.48,.36,.24,12);
  for(let k=0;k<3;k++)torus(g,M.stoneShade,sx*1.1,.65+k*.8,.01,.31,.026).rotation.x=Math.PI/2;
 }
 const beam=cube(g,M.stoneTop,0,h+.02,0,3.2,.40,.8);
 for(let j=0;j<6;j++)cube(g,j%2?M.stone:M.stoneShade,-1.35+j*.54,h+.29,.2,.46,.13,.65);
 for(const s of [-1,1])curvedSpike(g,M.moss,[[s*1.45,h+.2,.3],[s*1.38,h-.8,.38],[s*1.51,h-1.9,.46]],.055);
 return g;
}
for(const [x,z,h] of [[-12,-4,3.3],[7,-6,4.8],[19,-6.3,4.6],[35,-4.3,5.3]])ruin(x,z,h);
function mushroom(x,y,z,sc){let g=newGroup(scene,x,y,z);g.scale.setScalar(sc);cylinder(g,M.skin,0,.17,0,.07,.1,.34,9);let cap=sphere(g,M.enemyLit,0,.39,0,.27,.13,.25);
 for(let i=0;i<5;i++)sphere(g,M.white,Math.cos(i*2.3)*.16,.49,Math.sin(i*2.3)*.15,.04,.023,.04);return g;}
for(let i=0;i<55;i++){
 let x=-11+i*.88,platform=platforms.find(p=>Math.abs(x-p.x)<p.w/2-.25);if(!platform)continue;
 mushroom(x,platform.y+.17,1.0+rnd(i*7)*.45,.4+rnd(i*13)*.5);
}
function lantern(x,y,z){const g=newGroup(scene,x,y,z);const edge=M.goldDeep;
 for(const s of [-1,1])between(g,[s*.13,-.35,.0],[s*.15,.32,0],.042,edge);
 cylinder(g,edge,0,.35,0,.26,.24,.13,8);
 sphere(g,M.gold,0,.02,0,.18,.32,.18);
 sphere(g,new THREE.MeshBasicMaterial({color:0xffdf88}),0,.03,.05,.11,.19,.11);
 const light=new THREE.PointLight(0xffbd68,9,5);light.position.set(0,.15,.1);g.add(light);
 return g;
}
for(const [x,y] of [[-8,2.6],[7,3.65],[14,4.2],[23,3.4],[35,3]]){
 between(scene,[x,-.5,-3],[x,y+.7,-3],.11,M.stone);
 const hook=between(scene,[x,y+.7,-3],[x+.4,y+.7,-3],.075,M.stoneTop);
 lantern(x+.4,y+.15,-3);
}
// Real modelled gateway: breathing teal light behind arch, leaf wreath, runes.
const gate=newGroup(scene,35.25,.05,-.15);
const gateStone=M.stoneTop;
for(const s of [-1,1]){
 cube(gate,gateStone,s*1.15,1.75,0,.55,3.6,.9);
 cube(gate,M.goldDeep,s*1.15,.32,.49,.70,.12,.13);
 cube(gate,M.goldDeep,s*1.15,3.20,.49,.75,.10,.13);
}
const arch=obj(gate,new THREE.TorusGeometry(1.15,.3,12,40,Math.PI),M.stoneTop,0,3.55,.02);arch.rotation.z=0;
let inner=obj(gate,new THREE.CircleGeometry(1.25,64),new THREE.MeshBasicMaterial({color:0x4feaff,transparent:true,opacity:.21,depthWrite:false,side:THREE.DoubleSide}),0,2.03,-.20);inner.scale.y=1.65;
const rune=obj(gate,new THREE.TorusGeometry(1.04,.026,5,70),new THREE.MeshBasicMaterial({color:0x89fff9}),0,2.1,.38);rune.scale.y=1.65;
gem(gate,0,4.71,.42,.26);
const portalLight=new THREE.PointLight(0x6ef5e5,18,11);portalLight.position.set(0,2.1,0);gate.add(portalLight);

// dust, motes and organic gold star particles
const motes=[];for(let i=0;i<95;i++){
 const mat=new THREE.MeshBasicMaterial({color:i%4===0?0x9beaf2:0xffd49e,transparent:true,opacity:.28+rnd(i*3)*.3,depthWrite:false});
 const m=sphere(scene,mat,-10+rnd(i*59)*54,.6+rnd(i*43)*7,-1-rnd(i*11)*5,.017,.017,.017);
 m.castShadow=false;motes.push({o:m,speed:.1+rnd(i*32)*.3,offset:rnd(i*25)*6});
}
const swordTrails=[];const flashes=[];
function sparkBurst(x,y,z,count=12,kind='gold'){
 for(let i=0;i<count;i++){
  const a=rnd(i*11+performance.now())*Math.PI*2,v=2.0+rnd(i*13+performance.now())*4;
  let p=sphere(scene,new THREE.MeshBasicMaterial({color:kind==='pink'?(i%3===0?0xff72c5:0xffe7b3):0xffce7e,transparent:true,opacity:.9}),x,y,z,.04,.04,.04);
  p.castShadow=false;flashes.push({p,vx:Math.cos(a)*v,vy:Math.sin(a)*v,vz:(rnd(i*7+performance.now())-.5)*1.3,life:.45+rnd(i*19)*.18});
 }
}
const hitMark=document.getElementById('hitMessage');
function hurtEnemy(e){
 if(!e.alive)return;strikeSound();e.hp-=1;sparkBurst(e.g.position.x,e.g.position.y+1.13,1.1,17,'pink');
 hitMark.textContent=e.hp>0?'CRITICAL!':'PURIFIED!';hitMark.style.opacity='1';hitMark.style.transform='translateY(-10px)';setTimeout(()=>{hitMark.style.opacity='0'},320);
 if(e.hp<=0){e.alive=false;e.g.visible=false;document.getElementById('toast').textContent='✦  그림자를 정화했습니다';setTimeout(()=>document.getElementById('toast').textContent='',900)}
}

const input={left:false,right:false,jump:false,attack:false};let jumpLatch=false,attackLatch=false;
function mapKey(code,down){let k=({KeyA:'left',ArrowLeft:'left',KeyD:'right',ArrowRight:'right',Space:'jump',ArrowUp:'jump',KeyJ:'attack',KeyK:'attack'})[code];if(k){input[k]=down;return true}return false}
addEventListener('keydown',e=>{if(mapKey(e.code,true))e.preventDefault()});addEventListener('keyup',e=>mapKey(e.code,false));addEventListener('blur',()=>{for(const k of Object.keys(input))input[k]=false});
document.querySelectorAll('[data-key]').forEach(btn=>{const key=btn.dataset.key;btn.addEventListener('pointerdown',e=>{e.preventDefault();btn.setPointerCapture(e.pointerId);input[key]=true});for(const type of ['pointerup','pointercancel','lostpointercapture'])btn.addEventListener(type,()=>input[key]=false)});
let started=false,paused=false,won=false,health=320;
let state={x:-4.2,y:0,vy:0,vx:0,face:1,jumps:0,clock:0,walk:0,attackTime:-1,attackCd:0,hitCd:0,attacked:new Set(),lastStrike:0};
const attackDuration=.66;
function ease(a){return a*a*(3-2*a)}
function mix(a,b,t){return a+(b-a)*t}
function attackPose(t){
 // Real action keyframes: anticipate -> whip torso -> follow through -> balance recovery.
 const times=[0,.17,.31,.51,.66],shoulders=[-.18,.75,.85,-.78,-.18],elbows=[-.24,-.70,-.50,.12,-.24],wrists=[2.72,1.38,.85,-.62,2.72],torso=[0,-.18,-.30,.14,0],lean=[0,.12,.08,-.15,0];
 let i=0;while(i<3&&t>times[i+1])i++;
 const u=ease(Math.min(1,Math.max(0,(t-times[i])/(times[i+1]-times[i]))));
 return {shoulder:mix(shoulders[i],shoulders[i+1],u),elbow:mix(elbows[i],elbows[i+1],u),wrist:mix(wrists[i],wrists[i+1],u),torso:mix(torso[i],torso[i+1],u),lean:mix(lean[i],lean[i+1],u)};
}
const tip=new THREE.Vector3(),oldTip=new THREE.Vector3();
function swordWorldTip(){hero.swordRoot.updateWorldMatrix(true,false);return hero.swordRoot.localToWorld(hero.swordTip.clone())}
function spawnTrail(){
 const tipNow=swordWorldTip();const h=hero.swordRoot.localToWorld(new THREE.Vector3(0,.3,0));
 if(state.attackTime<.18||state.attackTime>.55)return;
 swordTrails.push({a:tipNow.clone(),b:h.clone(),life:.22});
 if(swordTrails.length>34)swordTrails.shift();
}
let trailMesh;
{
 const geo=new THREE.BufferGeometry();const max=35;geo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(max*6*3),3));geo.setAttribute('color',new THREE.BufferAttribute(new Float32Array(max*6*3),3));
 trailMesh=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:.62,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending}));scene.add(trailMesh);trailMesh.frustumCulled=false;
}
function redrawTrail(dt){swordTrails.forEach(v=>v.life-=dt);while(swordTrails.length&&swordTrails[0].life<=0)swordTrails.shift();
 const pos=trailMesh.geometry.attributes.position.array,col=trailMesh.geometry.attributes.color.array;
 // Two-triangle ribbon for each consecutive sample of the actual sword tip
 let n=0;for(let j=1;j<swordTrails.length&&n<35;j++){
  const a=swordTrails[j-1],b=swordTrails[j],verts=[a.a,a.b,b.a,a.b,b.b,b.a];
  const f=Math.min(1,Math.max(0,(a.life+b.life)/.44));
  for(let k=0;k<6;k++){let off=n*18+k*3;pos[off]=verts[k].x;pos[off+1]=verts[k].y;pos[off+2]=verts[k].z+.25;
   let v=k===0||k===2||k===5?1:.37;col[off]=(.3+.7*v)*f;col[off+1]=(.55+.4*v)*f;col[off+2]=(1)*f;}
  n++;
 }
 trailMesh.geometry.setDrawRange(0,n*6);trailMesh.geometry.attributes.position.needsUpdate=true;trailMesh.geometry.attributes.color.needsUpdate=true;
}
function animateCape(t,move){let a=hero.capePos;let ind=0;for(let i=0;i<=4;i++)for(let j=0;j<=6;j++){
 const u=j/6,v=i/4;let xx=(u-.5)*(.64+v*.55),yy=2.16-v*1.65,zz=-.34-v*.2+Math.sin(t*4+u*4-v*2)*v*.14-Math.abs(move)*v*.32;
 a[ind++]=xx;a[ind++]=yy;a[ind++]=zz;
 }hero.capeGeo.attributes.position.needsUpdate=true;hero.capeGeo.computeVertexNormals();
}
let last=performance.now();function tick(now){requestAnimationFrame(tick);const dt=Math.min(.040,(now-last)/1000);last=now;const t=now*.001;
 if(started&&!paused&&!won){state.clock+=dt;
  let move=(input.right?1:0)-(input.left?1:0);
  state.vx=mix(state.vx,move*5.6,Math.min(1,dt*12));state.x+=state.vx*dt;state.x=Math.max(-9.5,Math.min(36.4,state.x));
  if(move!==0)state.face=move;
  if(input.jump&&!jumpLatch&&state.jumps<2){state.vy=state.jumps===0?8.4:7.6;state.jumps++;sparkBurst(state.x,state.y+.27,.3,5)}jumpLatch=input.jump;
  let oldY=state.y;state.vy-=22*dt;state.y+=state.vy*dt;
  const surfaces=platforms.map(p=>({...p})).concat(floaters);
  let floor=-11;for(const p of surfaces){if(Math.abs(state.x-p.x)<p.w/2+.16&&state.y<=p.y+.12&&oldY>=p.y-.12&&state.vy<=0)floor=Math.max(floor,p.y)}
  if(floor>-10&&state.vy<=0&&state.y<=floor){state.y=floor;state.vy=0;state.jumps=0}
  if(state.y< -9){state.x=-4.2;state.y=0;state.vy=0;state.jumps=0;health=Math.max(50,health-45)}
  // Auto attack when nearby (no extra skill button); J demonstrates it at will.
  const near=monsters.find(e=>e.alive&&Math.abs(e.g.position.x-state.x)<2.7&&Math.abs(e.g.position.y-state.y)<2.1);
  state.attackCd=Math.max(0,state.attackCd-dt);state.hitCd=Math.max(0,state.hitCd-dt);
  if(state.attackCd<=0&&(near||(input.attack&&!attackLatch))){state.attackTime=0;state.attackCd=.83;state.attacked.clear()}
  attackLatch=input.attack;
  if(state.attackTime>=0){state.attackTime+=dt;if(state.attackTime>attackDuration)state.attackTime=-1}
  const stride=state.clock*11;state.walk+=Math.abs(state.vx)*dt;
  hero.g.position.set(state.x,state.y,.45);
  // 2.5D: facing is a real yaw rotation, not a negative X scale or a frontal pose.
  // Forward of the sculpted face is +Z; rotate toward the direction of travel.
  const desiredYaw=state.face>0?1.20:-1.94;
  hero.g.rotation.y+=Math.atan2(Math.sin(desiredYaw-hero.g.rotation.y),Math.cos(desiredYaw-hero.g.rotation.y))*Math.min(1,dt*15);
  hero.body.rotation.y=(state.attackTime>=0)?-.12:Math.sin(stride*.5)*Math.min(.045,Math.abs(state.vx)*.012);
  hero.body.position.y=state.jumps?0:Math.abs(Math.sin(stride))*.035*Math.min(1,Math.abs(state.vx)/3);
  hero.legs.forEach((l,i)=>{
   const sign=i?1:-1,sw=Math.sin(stride+i*Math.PI)*Math.min(1,Math.abs(state.vx)/4);
   l.hip.rotation.x=state.jumps?(sign*.20+state.vy*.02):sw*.5;
   l.knee.rotation.x=state.jumps?-.42:Math.max(0,-sw)*.48;
   l.foot.rotation.x=state.jumps?.08:-Math.max(0,-sw)*.20;
  });
  hero.arms[0].shoulder.rotation.z=-.17;hero.arms[0].elbow.rotation.z=-.19;
  hero.arms[0].shoulder.rotation.x=Math.sin(stride)*Math.min(.29,Math.abs(state.vx)*.052);
  const pose=state.attackTime>=0?attackPose(state.attackTime):{shoulder:-.20,elbow:-.16,wrist:2.74,torso:0,lean:0};
  hero.arms[1].shoulder.rotation.z=pose.shoulder;
  hero.arms[1].shoulder.rotation.x=state.attackTime>=0?-.10:.03;
  hero.arms[1].elbow.rotation.z=pose.elbow;
  hero.swordRoot.rotation.z=pose.wrist;
  hero.body.rotation.z=pose.lean;
  hero.hips.rotation.y=pose.torso;
  hero.head.rotation.z=-hero.body.rotation.z*.4;
  animateCape(state.clock,state.vx);
  // Collision only on the cutting portion of the swing. Use actual physical blade-tip location.
  hero.g.updateWorldMatrix(true,true);
  if(state.attackTime>.30&&state.attackTime<.51){
   spawnTrail();const wt=swordWorldTip();
   for(const e of monsters){
    if(!e.alive||state.attacked.has(e))continue;
    const within=Math.abs(e.g.position.x-state.x)<2.7&&Math.abs(e.g.position.y-state.y)<2.2;
    const bladeNear=Math.abs(wt.x-e.g.position.x)<3;
    if(within&&bladeNear){hurtEnemy(e);state.attacked.add(e)}
   }
  }
  for(const e of monsters){if(!e.alive)continue;
   e.g.position.x=e.x+Math.sin(t*.82+e.phase)*.73;
   // Creatures turn toward the knight as well, revealing their side profile.
   const enemyFace=state.x>=e.g.position.x?1.16:-1.98;
   e.g.rotation.y+=Math.atan2(Math.sin(enemyFace-e.g.rotation.y),Math.cos(enemyFace-e.g.rotation.y))*Math.min(1,dt*4.5);
   e.torso.position.y=.75+Math.sin(t*2.6+e.phase)*.075;
   e.torso.rotation.z=Math.sin(t*1.5+e.phase)*.075;
   if(Math.abs(e.g.position.x-state.x)<.76&&Math.abs(state.y)<.6&&state.hitCd<=0){state.hitCd=1.3;health-=15;sparkBurst(state.x,state.y+1.6,1.1,7,'pink');}
  }
  document.getElementById('hpFill').style.width=(health/320*100)+'%';document.getElementById('hpText').textContent=health+' / 320';
  let pct=Math.round(Math.max(0,Math.min(100,(state.x+4.2)/39.5*100)));
  document.getElementById('progress').style.width=pct+'%';document.getElementById('percent').textContent=pct+'%';
  if(health<=0){endGame(false)}else if(state.x>=35.1){endGame(true)}
 }
 for(const fl of flashes){fl.p.position.x+=fl.vx*dt;fl.p.position.y+=fl.vy*dt;fl.p.position.z+=fl.vz*dt;fl.vy-=12*dt;fl.life-=dt;fl.p.material.opacity=Math.max(0,fl.life*1.3);fl.p.scale.multiplyScalar(.993)}
 for(let i=flashes.length-1;i>=0;i--)if(flashes[i].life<=0){scene.remove(flashes[i].p);flashes[i].p.geometry.dispose();flashes[i].p.material.dispose();flashes.splice(i,1)}
 for(const m of motes){m.o.position.y+=Math.sin(t*m.speed+m.offset)*dt*.07;m.o.position.x+=Math.sin(t*.48+m.offset)*dt*.06;}
 redrawTrail(dt);
 rune.rotation.z=t*.23;inner.material.opacity=.24+Math.sin(t*2.9)*.08;gemGlow(t);
 let targetX=Math.max(-1.5,Math.min(29.3,state.x+1.7));
 const target=new THREE.Vector3(targetX+1.0,4.0,22.5);
 cam.position.lerp(target,.055);cam.lookAt(targetX,1.65,0);
 renderer.render(scene,cam);
}
function gemGlow(t){portalLight.intensity=14+Math.sin(t*2.7)*5;rim.intensity=2.45+Math.sin(t*.23)*.24}
function endGame(win){won=true;const e=document.getElementById('end');e.style.display='flex';document.getElementById('endTitle').textContent=win?'숲의 문을 열었습니다':'기사의 모험이 멈췄습니다';document.getElementById('endDesc').textContent=win?'그림자를 모두 처치하지 않아도 출구에 도착하면 클리어합니다.':'다시 도전해 보세요.'}
function initCam(){const ar=innerWidth/innerHeight;cam.left=-9;cam.right=9;cam.top=9/ar/2;cam.bottom=-9/ar/2;cam.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)}
// Preserve ~17 world units width; adapt mobile portrait to avoid cropping player.
function resize(){const aspect=innerWidth/innerHeight,halfWidth=aspect<.8?6.2:9;cam.left=-halfWidth;cam.right=halfWidth;cam.top=halfWidth/aspect;cam.bottom=-halfWidth/aspect;cam.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio||1,innerWidth<900?1.2:1.8))}
addEventListener('resize',resize);resize();
globalThis.__MAGIC_START__=()=>{started=true;document.getElementById('welcome').classList.add('off');setTimeout(()=>{document.getElementById('welcome').style.display='none'},450)};
document.getElementById('restartBtn').addEventListener('click',()=>location.reload());
document.getElementById('pauseBtn').addEventListener('click',()=>{paused=!paused;document.getElementById('pauseBtn').textContent=paused?'▶':'Ⅱ';document.getElementById('toast').textContent=paused?'일시정지':''});
let soundEnabled=false,audioContext;document.getElementById('soundBtn').addEventListener('click',()=>{soundEnabled=!soundEnabled;document.getElementById('soundBtn').style.color=soundEnabled?'#91dbff':'';document.getElementById('toast').textContent=soundEnabled?'효과음 켜짐':'효과음 꺼짐';setTimeout(()=>document.getElementById('toast').textContent='',800)});
// Simple on-demand generated sword-hit SFX (no autoplay media dependencies).
function strikeSound(){if(!soundEnabled)return;try{audioContext ||=new (window.AudioContext||window.webkitAudioContext)();const t=audioContext.currentTime,osc=audioContext.createOscillator(),gain=audioContext.createGain();osc.type='sawtooth';osc.frequency.setValueAtTime(570,t);osc.frequency.exponentialRampToValueAtTime(145,t+.15);gain.gain.setValueAtTime(.028,t);gain.gain.exponentialRampToValueAtTime(.001,t+.15);osc.connect(gain).connect(audioContext.destination);osc.start(t);osc.stop(t+.17)}catch{}}
// Sound is optional; all gameplay remains available when browser audio is blocked.
// First render starts before play so visual art direction can be judged immediately.
hero.arms[1].shoulder.rotation.z=-.2;hero.swordRoot.rotation.z=2.74;animateCape(0,0);cam.position.set(-1.5,4.0,22.5);cam.lookAt(-2.5,1.65,0);hero.g.rotation.y=1.20;monsters.forEach(e=>e.g.rotation.y=-1.98);
requestAnimationFrame(tick);

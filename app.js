(function(){
'use strict';
var $=function(s,r){return (r||document).querySelector(s)};
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
var wide=window.matchMedia('(min-width: 821px)');
var scrollMode=function(){return wide.matches && !reduce.matches};

/* ---------- mobile drawer ---------- */
var drawer=$('#drawer'),burger=$('#burger'),lastFocus=null;
function openDrawer(){lastFocus=document.activeElement;drawer.classList.add('open');drawer.setAttribute('aria-hidden','false');burger.setAttribute('aria-expanded','true');var c=$('.close',drawer);c&&c.focus();document.body.style.overflow='hidden'}
function closeDrawer(){drawer.classList.remove('open');drawer.setAttribute('aria-hidden','true');burger.setAttribute('aria-expanded','false');document.body.style.overflow='';lastFocus&&lastFocus.focus&&lastFocus.focus()}
burger.addEventListener('click',openDrawer);
$$('[data-close]',drawer).forEach(function(b){b.addEventListener('click',closeDrawer)});
$$('a',drawer).forEach(function(a){a.addEventListener('click',function(){drawer.classList.remove('open');drawer.setAttribute('aria-hidden','true');burger.setAttribute('aria-expanded','false');document.body.style.overflow=''})});
document.addEventListener('keydown',function(e){
  if(e.key==='Escape'&&drawer.classList.contains('open'))closeDrawer();
  if(e.key==='Tab'&&drawer.classList.contains('open')){
    var f=$$('a,button',drawer);var first=f[0],last=f[f.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
  }
});

/* ---------- bubbles ---------- */
function bubbles(el,n,min,max){
  if(!el||reduce.matches)return;
  for(var i=0;i<n;i++){
    var s=document.createElement('span'),d=min+Math.random()*(max-min);
    s.className='bubble';s.style.width=s.style.height=d+'px';
    s.style.left=(Math.random()*94)+'%';
    s.style.animationDuration=(7+Math.random()*8)+'s';
    s.style.animationDelay=(-Math.random()*12)+'s';
    el.appendChild(s);
  }
}
bubbles($('#heroStage'),9,8,20);
bubbles($('#storyBubbles'),14,8,26);

/* ---------- hero scroll transition ---------- */
var heroStage=$('#heroStage'),heroLabel=$('#heroLabel'),heroWrap=$('#heroWrap');
function heroUpdate(){
  if(!heroStage||!heroWrap)return;
  if(reduce.matches){heroStage.style.setProperty('--p',0);return}
  var r=heroWrap.getBoundingClientRect();
  var p=Math.min(1,Math.max(0,(80-r.top)/Math.max(300,r.height*0.9)));
  heroStage.style.setProperty('--p',p.toFixed(3));
  var t=p>0.55?'Isolated product view':'Installed in tank';
  if(heroLabel.textContent!==t)heroLabel.textContent=t;
}

/* ---------- story ---------- */
var track=$('#storyTrack'),figs=$$('#stage figure'),stepBtns=$$('#steps .step-btn'),bars=$$('#progress i'),s4=$('#s4');
var cur=-1,replaying=false,replayTimer=null;
function setState(i){
  if(i===cur)return;cur=i;
  figs.forEach(function(f,k){f.classList.toggle('on',k===i)});
  stepBtns.forEach(function(b,k){b.setAttribute('aria-selected',k===i?'true':'false');b.tabIndex=k===i?0:-1});
  bars.forEach(function(b,k){b.classList.toggle('on',k<=i)});
  s4.classList.remove('go');
  if(i===3){setTimeout(function(){if(cur===3)s4.classList.add('go')},reduce.matches?0:350)}
}
function storyScroll(){
  if(!scrollMode()||replaying)return;
  var r=track.getBoundingClientRect(),total=track.offsetHeight-window.innerHeight+72;
  var p=Math.min(0.9999,Math.max(0,-r.top/Math.max(1,total)));
  setState(Math.floor(p*4));
}
stepBtns.forEach(function(b,k){
  b.addEventListener('click',function(){
    stopReplay();
    if(scrollMode()){
      var total=track.offsetHeight-window.innerHeight+72;
      var top=track.getBoundingClientRect().top+window.scrollY+total*((k+0.5)/4);
      window.scrollTo({top:top,behavior:reduce.matches?'auto':'smooth'});
    }
    setState(k);
  });
  b.addEventListener('keydown',function(e){
    var n=null;
    if(e.key==='ArrowDown'||e.key==='ArrowRight')n=(k+1)%4;
    if(e.key==='ArrowUp'||e.key==='ArrowLeft')n=(k+3)%4;
    if(n!==null){e.preventDefault();stepBtns[n].focus();stepBtns[n].click()}
  });
});
function stopReplay(){replaying=false;clearTimeout(replayTimer)}
function replay(){
  stopReplay();replaying=true;cur=-1;
  var k=0;
  (function next(){
    setState(k);k++;
    if(k<4){replayTimer=setTimeout(next,reduce.matches?1200:3200)}
    else{replayTimer=setTimeout(function(){replaying=false},3500)}
  })();
}
$('#replay').addEventListener('click',replay);
setState(0);

/* ---------- product viewer (hotspots from the Appendix A mockups) ---------- */
function P(box,x,y){return [(x-box[0])/(box[2]-box[0])*100,(y-box[1])/(box[3]-box[1])*100]}
var B1=[600,225,1420,885],B2=[690,165,1320,905],B3=[690,95,1625,924],B4=[700,170,1220,924];
function H(box,x,y,t,d){var p=P(box,x,y);return {x:p[0],y:p[1],t:t,d:d}}
var VIEWS={
  model:{title:'Full model',img:'assets/model-clean.webp',alt:'Concept render of the full GravelLift model: one continuous slab with an air-driven filter tube at each back corner',pts:[
    H(B1,920,290,'Swivel outflow nozzle','Aimable return flow'),
    H(B1,895,384,'Riser tube with air bubbles','Rising bubbles lift water up the tube'),
    H(B1,898,466,'Nano-bubble diffuser','Replaceable ceramic disc'),
    H(B1,900,591,'Pebble layer','Molded into the slab, looks like loose gravel'),
    H(B1,712,613,'Standoff feet','Raise the plate to leave a water space underneath'),
    H(B1,762,634,'Slotted vent plate','Water and air pass through the slots'),
    H(B1,1352,423,'Check valve','Stops water backflow into the air line'),
    H(B1,1338,521,'Airline to air pump','Stays with the tank'),
    H(B1,1296,619,'Flow-control dial','Sets bubble rate'),
    H(B1,1311,635,'Quick-release air port','Disconnects when slab lifts out'),
    H(B1,1240,694,'Fold-down lift handle','Lift the whole slab out'),
    H(B1,1164,786,'One-piece slab','Cut to fit the tank floor')]},
  lift:{title:'Easy cleanup: lift out, rinse, replace',img:'assets/liftout-clean.webp',alt:'Concept render of the slab and both tubes lifted out of the tank together while the airline stays in the tank',pts:[
    H(B2,890,367,'Quick-release air port','Slab side disconnects from the airline'),
    H(B2,827,395,'Fold-down lift handle','Grab and lift'),
    H(B2,853,461,'Whole slab lifts out as one piece','No scooping or vacuuming loose gravel'),
    H(B2,754,474,'Standoff feet','Slab rests on these in the tank'),
    H(B2,1242,380,'Tubes lift out with the slab','Riser, diffuser and nozzle stay attached'),
    H(B2,1260,587,'Airline stays in the tank','Check valve stays above the water line'),
    H(B2,1119,802,'Empty tank','Rinse the slab, then lower it back in')]},
  base:{title:'Air-driven tube: base module',img:'assets/base-clean.webp',alt:'Close-up concept render of the base module where air enters, bubbles form and the tube locks into the plate',pts:[
    H(B3,775,121,'Airline from pump','Stays fixed in the tank'),
    H(B3,1041,203,'Clear riser tube','Water rises on the bubbles'),
    H(B3,1012,412,'Rising air bubbles','Air lift pulls water up'),
    H(B3,1012,531,'Nano-bubble diffuser','Replaceable ceramic disc'),
    H(B3,1076,596,'Quick-release ring','Twist to unlock the tube'),
    H(B3,1106,617,'Base collar','Seals the tube into the plate'),
    H(B3,932,599,'Flow-control dial','Turn to set bubble rate'),
    H(B3,933,651,'Air inlet port','Takes the airline'),
    H(B3,860,700,'Quick-release coupling','Slab stub meets the airline')]},
  top:{title:'Air-driven tube: top module',img:'assets/top-clean.webp',alt:'Close-up concept render of the swivel nozzle on top of a clear riser tube',pts:[
    H(B4,768,361,'Airline and check valve','Check valve sits above the water line'),
    H(B4,908,402,'Top housing','Collects the rising water'),
    H(B4,1028,405,'Swivel outflow nozzle','Aim it to set the circulation'),
    H(B4,1095,419,'Nozzle tip ring','Twist to adjust flow'),
    H(B4,937,714,'Riser tube','Water rises on the air bubbles')]},
  flow:{title:'How the air-driven tube works',img:'assets/a3-flow.webp',alt:'Cross-section diagram of the slab and one filter tube with the seven-step flow path',steps:[
    'Air pump pushes air down the airline (outside the tank).',
    'Check valve stops water backing up into the pump.',
    'Flow dial sets how much air enters the tube.',
    'Nano-bubble diffuser makes fine bubbles at the base.',
    'Rising bubbles lift water up the riser (air lift).',
    'Water leaves the swivel nozzle and circulates the tank.',
    'Water is drawn down through pebbles and slots, under the plate, and back to the riser.']}
};
var holder=$('#holder'),legend=$('#legend'),vTitle=$('#viewTitle'),vTabs=$$('#viewTabs .tab');
function showView(key){
  var v=VIEWS[key];holder.innerHTML='';legend.innerHTML='';legend.className=v.steps?'flow-list':'legend';
  var img=new Image();img.src=v.img;img.alt=v.alt;img.decoding='async';
  holder.appendChild(img);vTitle.textContent=v.title;
  vTabs.forEach(function(t){t.setAttribute('aria-selected',t.dataset.v===key?'true':'false');t.tabIndex=t.dataset.v===key?0:-1});
  if(v.steps){v.steps.forEach(function(s){var li=document.createElement('li');li.textContent=s;legend.appendChild(li)});return}
  var hots=[],btns=[];
  function sel(i){hots.forEach(function(h,k){h.setAttribute('aria-pressed',k===i?'true':'false')});btns.forEach(function(b,k){b.setAttribute('aria-pressed',k===i?'true':'false')})}
  v.pts.forEach(function(p,i){
    var h=document.createElement('button');h.type='button';h.className='hot';h.style.left=p.x+'%';h.style.top=p.y+'%';
    h.setAttribute('aria-label',p.t+': '+p.d);h.setAttribute('aria-pressed','false');h.addEventListener('click',function(){sel(i);btns[i].scrollIntoView({block:'nearest'})});
    holder.appendChild(h);hots.push(h);
    var li=document.createElement('li'),b=document.createElement('button');b.type='button';b.setAttribute('aria-pressed','false');
    b.innerHTML='<b></b><span></span>';b.firstChild.textContent=p.t;b.lastChild.textContent=p.d;
    b.addEventListener('click',function(){sel(i)});b.addEventListener('mouseenter',function(){sel(i)});
    li.appendChild(b);legend.appendChild(li);btns.push(b);
  });
}
vTabs.forEach(function(t,i){
  t.addEventListener('click',function(){showView(t.dataset.v)});
  t.addEventListener('keydown',function(e){
    var n=null;if(e.key==='ArrowRight')n=(i+1)%vTabs.length;if(e.key==='ArrowLeft')n=(i+vTabs.length-1)%vTabs.length;
    if(n!==null){e.preventDefault();vTabs[n].focus();vTabs[n].click()}
  });
});
showView('model');

/* ---------- tank fit guide ---------- */
var PRESETS={'5.5':[16,8],'10':[20,10],'20h':[24,12],'20l':[30,12],'29':[30,12],'40b':[36,18]};
var sizeSel=$('#tankSize'),inL=$('#tankL'),inW=$('#tankW'),res=$('#fitResult');
var TOL=0.5;
function near(L,W,a){return Math.abs(L-a[0])<=TOL&&Math.abs(W-a[1])<=TOL}
function dist(L,W,a){return Math.max(Math.abs(L-a[0]),Math.abs(W-a[1]))}
function fpSvg(L,W,match){
  var s=Math.min(360/Math.max(L,20),170/Math.max(W,10)),w=L*s,h=W*s,x=(400-w)/2,y=(200-h)/2;
  var out='<svg viewBox="0 0 400 200" role="img" aria-label="Your tank floor drawn to scale, '+L+' by '+W+' inches"><rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="6" fill="#DDF4FA" stroke="#086A91" stroke-width="3"/>';
  if(match){var sw=match[0]*s,sh=match[1]*s;out+='<rect x="'+(200-sw/2)+'" y="'+(100-sh/2)+'" width="'+sw+'" height="'+sh+'" rx="4" fill="#2A2623" opacity=".88"/><text x="200" y="104" text-anchor="middle" font-size="13" font-weight="700" fill="#fff" font-family="sans-serif">GravelLift slab</text>'}
  out+='</svg><small>Drawn to scale. Your tank: '+L+' × '+W+' in'+(match?'; slab: about '+match[0]+' × '+match[1]+' in.':'.')+'</small>';
  return out;
}
function show(cls,tag,title,body,fp){res.className='result '+cls;res.innerHTML='<span class="tag">'+tag+'</span><h3>'+title+'</h3>'+body+(fp?'<div class="fp">'+fp+'</div>':'')+'<p class="hint" style="margin-bottom:0">Always verify your actual internal tank measurements before buying.</p>'}
function evaluate(){
  var L=parseFloat(inL.value),W=parseFloat(inW.value);
  if(!(L>0)||!(W>0)){res.className='result idle';res.innerHTML='<span class="tag">Waiting for your tank</span><h3>Choose a tank to see your match</h3><p>We\'ll compare your tank floor with the GravelLift lineup.</p>';return}
  if(W>L){var t=L;L=W;W=t}
  var g10=[20,10];
  if(near(L,W,g10))return show('ok','Match','GravelLift 10 should fit your tank','<p>Your floor is about 20 × 10 inches, the size GravelLift 10 is made for. It is available now for <strong>$54.99</strong>.</p><p><a href="#product">Shop GravelLift 10 →</a></p>',fpSvg(L,W,g10));
  if(dist(L,W,g10)<=1.5)return show('no','Close, but no match','Re-measure the inside floor','<p>Your numbers are close to 20 × 10 inches, but GravelLift is cut to fit the tank floor, so we can\'t say it will fit. Measure the inside length and width again.</p>',fpSvg(L,W));
  show('no','Not a fit','GravelLift 10 won\'t fit this tank','<p>GravelLift 10 is made for a standard 10-gallon tank with a floor of about 20 × 10 inches. Your tank floor is about '+L+' × '+W+' inches.</p>',fpSvg(L,W));
}
sizeSel.addEventListener('change',function(){
  var p=PRESETS[sizeSel.value];
  if(p){inL.value=p[0];inW.value=p[1]}
  else if(sizeSel.value===''){inL.value='';inW.value=''}
  evaluate();
});
[inL,inW].forEach(function(i){i.addEventListener('input',evaluate)});
$('#fitForm').addEventListener('submit',function(e){e.preventDefault();evaluate()});

/* ---------- demo dialog ---------- */
var dlg=$('#demoDlg');
$('#demoBtn').addEventListener('click',function(){dlg.showModal?dlg.showModal():dlg.setAttribute('open','')});
$('#demoClose').addEventListener('click',function(){dlg.close?dlg.close():dlg.removeAttribute('open')});
dlg.addEventListener('click',function(e){if(e.target===dlg&&dlg.close)dlg.close()});

/* ---------- email signup (front-end prototype) ---------- */
$('#signupForm').addEventListener('submit',function(e){
  e.preventDefault();
  var v=$('#email').value.trim(),m=$('#signupMsg');
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)){m.textContent='Please enter a valid email address.';$('#email').focus();return}
  // INTEGRATION POINT: send `v` to your email provider here (Shopify, Mailchimp, Klaviyo…)
  m.textContent='Thanks! This is a prototype, so nothing was saved yet. Connect your email service to collect sign-ups.';
  this.reset();
});

/* ---------- reveal on scroll ---------- */
if('IntersectionObserver' in window&&!reduce.matches){
  var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target)}})},{threshold:.15});
  $$('.reveal').forEach(function(el){io.observe(el)});
}else{$$('.reveal').forEach(function(el){el.classList.add('in')})}

/* ---------- scroll loop ---------- */
var ticking=false;
function onScroll(){if(ticking)return;ticking=true;requestAnimationFrame(function(){heroUpdate();storyScroll();ticking=false})}
window.addEventListener('scroll',onScroll,{passive:true});
window.addEventListener('resize',onScroll);
heroUpdate();storyScroll();
})();


/* ---------- landing water hero ---------- */
(function(){
  var bb=document.getElementById('landBubbles');
  if(bb&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    for(var i=0;i<22;i++){var s=document.createElement('span'),d=8+Math.random()*26;s.className='lbub';s.style.width=s.style.height=d+'px';s.style.left=(Math.random()*98)+'%';s.style.animationDuration=(9+Math.random()*10)+'s';s.style.animationDelay=(-Math.random()*16)+'s';bb.appendChild(s)}
  }
  var NS='http://www.w3.org/2000/svg',svg=document.getElementById('landPebbles'),cols=['#0A6A9A','#1383B3','#2A9FCB','#46B3DC','#6CC8EA','#0B5C86'];
  if(!svg)return;
  var seed=7;function rnd(){seed=(seed*16807)%2147483647;return seed/2147483647}
  for(var row=0;row<4;row++){
    var y=210-row*38,x=-20+(row%2)*30;
    while(x<1480){
      var rx=26+rnd()*26,ry=14+rnd()*12,e=document.createElementNS(NS,'ellipse');
      e.setAttribute('cx',x);e.setAttribute('cy',y+rnd()*10);e.setAttribute('rx',rx);e.setAttribute('ry',ry);
      e.setAttribute('fill',cols[Math.floor(rnd()*cols.length)]);e.setAttribute('stroke','#07506f');e.setAttribute('stroke-opacity','.25');
      svg.appendChild(e);x+=rx*1.55;
    }
  }
})();

/* ---------- buy buttons (checkout is a prototype hook) ---------- */
(function(){
  var toast=document.getElementById('toast'),t=null;
  [].slice.call(document.querySelectorAll('[data-buy]')).forEach(function(b){
    b.addEventListener('click',function(){
      // INTEGRATION POINT: send the shopper to your store checkout for b.dataset.buy (e.g. a Shopify product link).
      toast.textContent='Checkout isn\'t connected in this prototype yet. Link this button to your store to sell '+b.dataset.buy+'.';
      toast.hidden=false;clearTimeout(t);t=setTimeout(function(){toast.hidden=true},6000);
    });
  });
})();

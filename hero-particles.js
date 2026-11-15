(() => {
 const canvas = document.querySelector('.hero-particles');
 const context = canvas.getContext('2d', {alpha:true});
 if (!context) return;
 const hero = canvas.closest('.hero');
 const reduced = matchMedia('(prefers-reduced-motion: reduce)');
 let width = 0;
 let height = 0;
 let frame = 0;
 let visible = false;
 let pointer = null;
 let glow = null;
 let lastDraw = 0;

 function draw(time) {
  const t = time / 1000;
  context.clearRect(0, 0, width, height);
  if (!width || !height) return;
  if (pointer) {
   glow ??= {...pointer, strength:0};
   glow.x += (pointer.x-glow.x)*.15;
   glow.y += (pointer.y-glow.y)*.15;
   glow.strength += (1-glow.strength)*.13;
  } else if (glow) {
   glow.strength *= .88;
  }
  // Overlapping soft fields form one silhouette, with the brightest part below the title.
  const fields = [
   [.28+.035*Math.sin(t*.53), .52+.07*Math.sin(t*.69), .26, .34, .74],
   [.47+.058*Math.sin(t*.6+2), .65+.065*Math.cos(t*.54), .37, .27, .86],
   [.68+.046*Math.cos(t*.56), .52+.09*Math.sin(t*.6+3), .23, .36, .77],
   [.76+.029*Math.sin(t*.74), .72+.042*Math.cos(t*.81), .22, .23, .9],
  ];
  if (glow?.strength > .015) {
   fields.push([glow.x/width, glow.y/height, Math.min(.32, 220/width), Math.min(.35, 195/height), glow.strength*.97]);
  }
  for (const [x,y,rx,ry,strength] of fields) {
   context.save();
   context.translate(x*width, y*height);
   context.scale(rx*width, ry*height);
   const halo = context.createRadialGradient(0,0,0,0,0,1);
   halo.addColorStop(0, 'rgba(14, 115, 255,' + strength*.51 + ')');
   halo.addColorStop(.52, 'rgba(19, 90, 241,' + strength*.2 + ')');
   halo.addColorStop(1, 'rgba(16, 89, 243, 0)');
   context.fillStyle = halo;
   context.fillRect(-1,-1,2,2);
   context.restore();
  }
  const spacing = Math.ceil(Math.max(4, width/295, height/190));
  context.fillStyle = '#42b5ff';
  for (let row=spacing/2; row<height; row+=spacing) {
   const y = row/height;
   for (let column=spacing/2; column<width; column+=spacing) {
    const x = column/width;
    let energy = 0;
    for (const [cx,cy,rx,ry,strength] of fields) {
     const dx = (x-cx)/rx;
     const dy = (y-cy)/ry;
     const distance = dx*dx+dy*dy;
     if (distance < 1) energy += (1-distance)**2*strength;
    }
    const light = Math.min(1, energy);
    if (light < .025) continue;
    const radius = .33 + light*.77;
    context.globalAlpha = Math.min(.71, light*.63);
    context.beginPath();
    context.arc(column, row, radius, 0, Math.PI*2);
    context.fill();
   }
  }
  context.globalAlpha = 1;
 }

 function tick(now) {
  frame = 0;
  if (!visible || reduced.matches || document.hidden) return;
  if (now-lastDraw >= 29) {
   lastDraw = now;
   draw(now);
  }
  frame = requestAnimationFrame(tick);
 }

 function refresh() {
  cancelAnimationFrame(frame);
  frame = 0;
  if (!visible || document.hidden) return;
  if (reduced.matches) draw(0);
  else frame = requestAnimationFrame(tick);
 }

 function resize() {
  const bounds = canvas.getBoundingClientRect();
  width = bounds.width;
  height = bounds.height;
  if (!width || !height) return;
  const scale = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.round(width*scale);
  canvas.height = Math.round(height*scale);
  context.setTransform(scale, 0, 0, scale, 0, 0);
  draw(reduced.matches ? 0 : performance.now());
 }

 hero.addEventListener('pointermove', event => {
  if (event.pointerType !== 'mouse' || reduced.matches) return;
  const bounds = canvas.getBoundingClientRect();
  pointer = {x:event.clientX-bounds.left, y:event.clientY-bounds.top};
 }, {passive:true});
 hero.addEventListener('pointerleave', () => {pointer = null;});
 new ResizeObserver(resize).observe(canvas);
 new IntersectionObserver(([entry]) => {
  visible = entry.isIntersecting;
  refresh();
 }).observe(hero);
 reduced.addEventListener('change', () => {pointer = null; glow = null; refresh();});
 document.addEventListener('visibilitychange', refresh);
})();

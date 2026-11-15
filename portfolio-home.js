const filters = document.querySelector('.filters');
const grid = document.querySelector('.grid');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const clamp = value => Math.max(0, Math.min(1, value));

function selectCategory(id) {
 const category = categories.get(id);
 const visible = category ? category.projects.map(key => projects.get(key)) : portfolio.projects;
 for (const button of filters.children) button.setAttribute('aria-pressed', String(button.dataset.filter === id));
 grid.innerHTML = visible.map(project => {
  const ui = id === 'ux' && Boolean(project.ux);
  const lead = ui ? project.ux.lead : project.lead;
  const label = category?.label ?? categories.get(project.types[0]).label;
  return '<a class="card" href="' + escapeHtml(projectHref(project, id)) + '"><figure class="card-cover ' + project.id + '">' +
   artwork(project, {ui}) + '</figure><div class="meta"><div><small>' + escapeHtml(label) + '</small><h3>' +
   escapeHtml(project.title) + '</h3><p>' + escapeHtml(lead) + '</p></div><span aria-hidden="true">↗</span></div></a>';
 }).join('');
}

function restoreCategory() {
 const id = new URL(location.href).searchParams.get('category');
 selectCategory(categories.has(id) ? id : 'all');
}
for (const {id, label} of [{id:'all', label:'全部'}, ...portfolio.categories]) {
 const button = document.createElement('button');
 button.type = 'button';
 button.className = 'filter';
 button.dataset.filter = id;
 button.textContent = label;
 button.addEventListener('click', () => {
  const url = new URL(location.href);
  if (id === 'all') url.searchParams.delete('category');
  else url.searchParams.set('category', id);
  history.replaceState(null, '', url);
  selectCategory(id);
 });
 filters.append(button);
}
restoreCategory();
window.addEventListener('popstate', restoreCategory);

const categoryLinks = [...document.querySelectorAll('.category-list a')];
for (const link of categoryLinks) {
 link.addEventListener('click', event => {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  history.pushState(null, '', link.href);
  selectCategory(link.dataset.category);
  document.querySelector('#index').scrollIntoView();
 });
}
const workPreview = document.querySelector('.work-preview');
const title = document.querySelector('.read');
const hero = document.querySelector('.hero');
const letters = [...title.textContent].map(char => {
 const span = document.createElement('span');
 span.textContent = char;
 return span;
});
title.replaceChildren(...letters);
let frameRequested = false;
function paint() {
 frameRequested = false;
 const viewport = innerHeight;
 for (const link of categoryLinks) {
  const bounds = link.getBoundingClientRect();
  const distance = Math.abs(bounds.top + bounds.height / 2 - viewport * .5);
  const ink = reduced.matches ? 1 : clamp(1.36 - distance / (bounds.height * .64));
  link.style.setProperty('--ink', (ink * 100).toFixed(1) + '%');
 }
 const bounds = workPreview.getBoundingClientRect();
 const reveal = reduced.matches ? 1 : clamp((viewport * .98 - bounds.top) / (viewport * .52));
 workPreview.style.setProperty('--image-scale', (1.12 - reveal * .12).toFixed(3));
 workPreview.style.setProperty('--crop', ((1 - reveal) * 9).toFixed(2) + '%');
 const progress = reduced.matches ? 1 : clamp((viewport * .83 - title.getBoundingClientRect().top) / (viewport * .47));
 const visibleCount = Math.round(progress * letters.length);
 for (const [index, span] of letters.entries()) span.classList.toggle('inked', index < visibleCount);
 hero.style.setProperty('--lift', reduced.matches ? '0px' : Math.round(Math.min(150, scrollY * .23)) + 'px');
}
function requestPaint() {
 if (frameRequested) return;
 frameRequested = true;
 requestAnimationFrame(paint);
}
window.addEventListener('scroll', requestPaint, {passive:true});
window.addEventListener('resize', requestPaint);
reduced.addEventListener('change', requestPaint);
paint();

const feature = document.querySelector('.feature');
const featureMedia = feature.querySelector('.feature-media');
const controls = feature.querySelector('.feature-steps');
const featureLink = feature.querySelector('.feature-link');
const featureTitle = feature.querySelector('.feature-title');
const featureCategory = feature.querySelector('.feature-category');
const featureCount = feature.querySelector('.count');
const slides = portfolio.featured.map(id => projects.get(id));
let current = 0;
let inView = false;
let paused = false;
let timer;
const panels = slides.map((project, index) => {
 const panel = document.createElement('figure');
 panel.className = 'feature-image ' + project.id;
 panel.innerHTML = artwork(project, {lazy:false});
 featureMedia.append(panel);
 const button = document.createElement('button');
 button.type = 'button';
 button.textContent = String(index + 1).padStart(2, '0');
 button.setAttribute('aria-label', project.title);
 button.setAttribute('aria-controls', 'feature-current');
 button.addEventListener('click', () => {showSlide(index); queueSlide();});
 controls.append(button);
 return panel;
});
const toggle = document.createElement('button');
toggle.type = 'button';
controls.append(toggle);
function showSlide(index) {
 current = index;
 const project = slides[index];
 for (const [i, panel] of panels.entries()) {
  panel.classList.toggle('visible', i === index);
  panel.setAttribute('aria-hidden', String(i !== index));
  controls.children[i].setAttribute('aria-pressed', String(i === index));
 }
 featureCount.textContent = String(index + 1).padStart(2, '0') + ' / ' + String(slides.length).padStart(2, '0');
 featureCategory.textContent = categories.get(project.types[0]).label;
 featureTitle.textContent = project.title;
 featureLink.href = projectHref(project);
}
function queueSlide() {
 clearTimeout(timer);
 if (!inView || paused || reduced.matches || document.hidden || document.activeElement === featureLink) return;
 timer = setTimeout(() => {showSlide((current + 1) % slides.length); queueSlide();}, 5500);
}
function updateRotation() {
 toggle.hidden = reduced.matches;
 toggle.textContent = paused ? '继续轮播' : '暂停轮播';
 queueSlide();
}
toggle.addEventListener('click', () => {paused = !paused; updateRotation();});
reduced.addEventListener('change', updateRotation);
document.addEventListener('visibilitychange', queueSlide);
featureLink.addEventListener('focus', queueSlide);
featureLink.addEventListener('blur', () => requestAnimationFrame(queueSlide));
new IntersectionObserver(([entry]) => {
 inView = entry.isIntersecting;
 queueSlide();
}, {threshold:.55}).observe(feature);
showSlide(0);
updateRotation();

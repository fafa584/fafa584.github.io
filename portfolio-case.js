const params = new URL(location.href).searchParams;
const project = projects.get(params.get('id'));
const requested = params.get('category');
const active = project?.types.includes(requested) ? requested : project?.types.find(id => id !== 'ux') ?? project?.types[0];
const category = categories.get(active);
const outlet = document.querySelector('#case');
if (!project) {
 outlet.innerHTML = '<h1>找不到这个项目</h1><a class="case-link" href="index.html#index">返回作品索引 ↗</a>';
} else {
 const ui = requested === 'ux' && Boolean(project.ux);
 const copy = ui ? project.ux : project;
 const title = escapeHtml(project.title);
 document.title = project.title + ' — FAFA CHEN';
 if (categories.has(requested)) {
  document.querySelector('.back-index').href = 'index.html?category=' + encodeURIComponent(requested) + '#index';
 }
 const sectionImages = ui ? [] : project.sections ?? [];
 const gallery = sectionImages.map(([file, label]) =>
  '<section class="case-section"><h2>' + escapeHtml(label) + '</h2><a href="assets/' + encodeURIComponent(file) + '">' +
  '<img src="assets/' + encodeURIComponent(file) + '" alt="' + escapeHtml(project.title + '：' + label) + '" loading="lazy"></a></section>'
 ).join('');
 const scenes = ui ? [] : project.storyboard ?? [];
 const storyboard = scenes.length ? '<section class="case-section story-scenes"><h2>分镜图</h2>' +
  scenes.map((scene, index) => '<div class="story-scene"><div class="story-heading"><span>第 ' + (index + 1) +
   ' 场</span><h3>' + escapeHtml(scene.title) + '</h3><p>' + escapeHtml(scene.summary) +
   '</p></div><ol class="storyboard-grid">' + scene.shots.map(({file, number}) => {
    const source = 'assets/' + encodeURIComponent(file);
    return '<li><a href="' + source + '" aria-label="查看分镜 ' + number + ' 大图">' +
     '<img src="' + source + '" alt="" loading="lazy" width="1280" height="720"><span>' + number + '</span></a></li>';
   }).join('') + '</ol></div>').join('') + '</section>' : '';
 const characters = ui ? [] : project.characters ?? [];
 const cast = characters.length ? '<section class="case-section cast"><h2>角色设计</h2>' +
  characters.map(character => '<article class="cast-card cast-' + character.id + '"><div class="cast-copy"><h3>' +
   escapeHtml(character.name) + '</h3><p class="cast-role">' + escapeHtml(character.role) + '</p><p>' +
   escapeHtml(character.description) + '</p></div><div class="cast-poses">' +
   ['正面','侧面','背面'].map((view, i) => '<figure class="cast-pose"><img src="assets/film-' +
    character.id + '-' + i + '.webp" alt="' + escapeHtml(character.name + view) + '" loading="lazy">' +
    '<figcaption>' + view + '</figcaption></figure>').join('') + '</div></article>').join('') + '</section>' : '';
 const references = ui ? [] : project.references ?? [];
 const origins = references.length ? '<section class="case-section origins"><h2>原型与创作参考</h2><div class="origin-grid">' +
  references.map(reference => '<article><img src="assets/' + encodeURIComponent(reference.file) + '" alt="' +
   escapeHtml(reference.title) + '" loading="lazy"><div><h3>' + escapeHtml(reference.title) +
   '</h3><p>' + escapeHtml(reference.description) + '</p></div></article>').join('') + '</div></section>' : '';
 const clips = ui ? [] : project.clips ?? [];
 const excerpts = clips.length ? '<section class="case-section"><h2>制作片段</h2><div class="case-clips">' +
  clips.map(clip => '<figure><video controls playsinline preload="none" src="assets/' + encodeURIComponent(clip.file) +
   '" poster="assets/' + encodeURIComponent(clip.poster) + '" aria-label="' + escapeHtml(clip.title) +
   '"></video><figcaption>' + escapeHtml(clip.title) + '</figcaption></figure>').join('') + '</div></section>' : '';
 const film = ui ? null : project.featureFilm;
 const featureFilm = film ? '<section class="case-section case-film"><h2>' + escapeHtml(film.title) +
  '</h2><video controls playsinline preload="none" src="assets/' + encodeURIComponent(film.file) +
  '" poster="assets/' + encodeURIComponent(film.poster) + '" aria-label="' + escapeHtml(project.title) +
  '完整短片"></video></section>' : '';
 const primary = (!ui && project.cover) || project.id === 'museum' || copy.image;
 const media = primary ? '<figure class="case-cover ' + project.id + (ui ? ' ui-cover' : '') + '">' +
  artwork(project, {lazy:false, ui}) + '</figure>' : '';
 const placeholder = project.placeholder && primary ? '<p class="preview-note">当前封面为示意图</p>' : '';
 const app = project.url ? '<a class="case-link" href="' + escapeHtml(project.url) + '" target="_blank" rel="noopener">打开 Figma 原型 ↗</a>' : '';
 const order = category.projects;
 const following = projects.get(order[(order.indexOf(project.id) + 1) % order.length]);
 const full = ui ? '<a class="case-link" href="' + escapeHtml(projectHref(project, 'interactive')) + '">查看完整项目 ↗</a>' : '';
 const next = following !== project ? '<a class="case-link" href="' + escapeHtml(projectHref(following, active)) + '">下一件作品 · ' + escapeHtml(following.title) + ' ↗</a>' : '';
 outlet.innerHTML = '<header class="case-header"><p class="label">' + escapeHtml(category.label) + '</p><h1>' + title +
  '</h1><p class="case-lead">' + escapeHtml(copy.lead) + '</p></header>' + (featureFilm || media) + placeholder +
  '<section class="case-section case-intro"><h2>' + (ui ? '界面与交互' : '项目简介') + '</h2><p>' +
  escapeHtml(copy.description) + '</p>' + app + '</section>' + gallery + origins + cast + excerpts + storyboard + '<nav class="case-nav" aria-label="更多作品">' + full + next + '</nav>';
}

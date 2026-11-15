const projects = new Map(portfolio.projects.map(project => [project.id, project]));
const categories = new Map(portfolio.categories.map(category => [category.id, category]));
const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({
 '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
})[char]);

function projectHref(project, category = '') {
 const params = new URLSearchParams({id: project.id});
 if (categories.has(category)) params.set('category', category);
 return 'project.html?' + params;
}

function artwork(project, {lazy = true, ui = false} = {}) {
 const loading = lazy ? ' loading="lazy"' : '';
 if (project.id === 'museum') {
  return ['地图', '线索详情', '拍照识别'].map((alt, index) =>
   '<img alt="' + alt + '"' + loading + ' src="assets/' + ['map','clue','camera'][index] + '.webp">'
  ).join('');
 }
 const source = ui ? project.ux?.image : project.cover;
 if (!source) return '<div class="type-cover" aria-hidden="true">' + escapeHtml(project.title) + '</div>';
 const alt = ui ? project.title + '界面展示' : project.title + (project.placeholder ? '示意图' : '项目图');
 return '<img alt="' + escapeHtml(alt) + '"' + loading + ' src="assets/' + encodeURIComponent(source) + '">';
}

/** Run after `npm run build`; --replacements also tests edits and restores every source file. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import YAML from 'yaml';
import ts from 'typescript';
import { imageMetadata } from 'astro/assets/utils';

const root = process.cwd();
const config = YAML.parse(fs.readFileSync('.pages.yml', 'utf8'));
const articleSchema = config.content.find((entry) => entry.name === 'articles');
const protectedKeys = ['publishedAt', 'updatedAt', 'draft', 'featured', 'featuredImageWidth', 'featuredImageHeight', 'legacyId', 'legacyPath', 'sourceUrl'];
assert.equal(config.settings.content.merge, true, 'Unmanaged metadata must survive CMS saves');
assert.equal(config.settings.hide, true);
assert.equal(articleSchema.path, 'src/content/insights');
assert.equal(articleSchema.subfolders, false);
assert(protectedKeys.every((key) => !articleSchema.fields.some((field) => field.name === key)), 'Publication and legacy metadata must not be editable');
for (const entry of config.content) {
  assert.deepEqual(entry.operations, { create: false, rename: false, delete: false });
  assert(entry.fields.length > 0, 'Never expose the raw file editor');
}
const imageRoot = config.media.find((media) => media.name === 'images');
assert.equal(imageRoot.input, 'public/images');
assert.equal(imageRoot.output, '/images');
let fieldCount = 0;
function visit(fields, content, callback, trail = []) {
  for (const field of fields) {
    const keys = [...trail, field.name];
    if (field.required || field.type === 'object') {
      assert(Object.hasOwn(content, field.name), `Missing content: ${keys.join('.')}`);
    }
    if (field.type === 'object') {
      assert(!field.list, 'Page layout must use fixed slots');
      visit(field.fields, content[field.name], callback, keys);
    } else {
      fieldCount++;
      if (field.type === 'number') {
        assert.equal(field.required, true, 'Numeric page values must remain present after saving');
        assert(Number.isFinite(content[field.name]), `Invalid number: ${keys.join('.')}`);
      }
      if (field.pattern && content[field.name] != null) assert(new RegExp(field.pattern.regex ?? field.pattern).test(content[field.name]), `Invalid link: ${keys.join('.')}`);
      if (field.type === 'image' && content[field.name] != null) assert(fs.existsSync(path.join('public', content[field.name])), `Missing image: ${content[field.name]}`);
      callback?.(field, content, keys);
    }
  }
}
const pages = config.content.filter((entry) => entry.type === 'file');
for (const page of pages) visit(page.fields, JSON.parse(fs.readFileSync(page.path, 'utf8')));

const articles = fs.readdirSync(articleSchema.path).filter((name) => name.endsWith('.md'));
const parseArticle = (raw) => {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  assert(match, 'Expected YAML frontmatter');
  return { frontmatter: YAML.parse(match[1]), body: match[2] };
};
const production = articles.filter((file) => {
  const { frontmatter } = parseArticle(fs.readFileSync(path.join(articleSchema.path, file), 'utf8'));
  return !frontmatter.draft && new Date(frontmatter.publishedAt) <= new Date();
});
function checkRoutes(preview = false) {
  for (const file of articles) {
    const html = path.join('dist/insights', file.replace(/\.md$/, ''), 'index.html');
    assert.equal(fs.existsSync(html), preview || production.includes(file), `Publication gate: ${file}`);
  }
  for (const route of ['index.html', 'about/index.html', 'inflection-points/index.html', 'insights/index.html']) assert(fs.existsSync(path.join('dist', route)));
}
checkRoutes();
// Exercise the unchanged publication predicate at date boundaries, including drafts.
const moduleSource = ts.transpileModule(fs.readFileSync('src/lib/insights.ts', 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ESNext, module: ts.ModuleKind.ESNext } }).outputText;
const { shouldIncludeInsight } = await import(`data:text/javascript;base64,${Buffer.from(moduleSource).toString('base64')}`);
const entry = { data: { draft: false, publishedAt: new Date('2026-09-29T00:00:00Z') } };
assert.equal(shouldIncludeInsight(entry, false, new Date('2026-09-28T23:59:59Z')), false);
assert.equal(shouldIncludeInsight(entry, false, new Date('2026-09-29T00:00:00Z')), true);
assert.equal(shouldIncludeInsight({ data: { ...entry.data, draft: true } }, false, new Date('2026-10-01')), false);
assert.equal(shouldIncludeInsight({ data: { ...entry.data, draft: true } }, true), true);
console.log(`CMS checks passed: ${fieldCount} page fields; ${articles.length} existing articles; ${production.length} currently publishable.`);

if (process.argv.includes('--replacements')) {
  const backupDir = fs.mkdtempSync(path.join(os.tmpdir(), 'wyckoff-cms-restore-'));
  const originals = new Map();
  const backup = (file) => {
    const bytes = fs.readFileSync(file);
    originals.set(file, bytes);
    const dest = path.join(backupDir, file);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, bytes);
  };
  for (const page of pages) backup(page.path);
  for (const file of articles) backup(path.join(articleSchema.path, file));
  const fixture = 'public/images/cms-verification-fixture.webp';
  assert(!fs.existsSync(fixture));
  const build = (preview) => execFileSync('npm', ['run', 'build'], { cwd: root, env: { ...process.env, INSIGHTS_PREVIEW: String(preview) }, stdio: 'pipe' });
  console.log(`Replacement check backups: ${backupDir}`);
  try {
    // Deliberately different image proportions; copies an existing repository photo.
    fs.copyFileSync('public/images/wyckoff/luke-speaking.webp', fixture);
    const expectedSize = await imageMetadata(fs.readFileSync(fixture));
    const markers = [];
    let number = 0;
    for (const page of pages) {
      const content = JSON.parse(originals.get(page.path));
      visit(page.fields, content, (field, parent, keys) => {
        if (field.type === 'image') parent[field.name] = '/images/cms-verification-fixture.webp';
        else if (field.type === 'number') parent[field.name] += 1;
        else {
          const marker = `CMSVERIFY${String(++number).padStart(4, '0')}`;
          parent[field.name] = field.pattern ? `/#${marker}` : marker;
          markers.push({ marker, field: `${page.name}.${keys.join('.')}` });
        }
      });
      fs.writeFileSync(page.path, JSON.stringify(content, null, 2) + '\n');
    }
    for (const [index, file] of articles.entries()) {
      const filePath = path.join(articleSchema.path, file);
      const { frontmatter, body } = parseArticle(originals.get(filePath).toString());
      const protectedBefore = Object.fromEntries(protectedKeys.filter((key) => Object.hasOwn(frontmatter, key)).map((key) => [key, frontmatter[key]]));
      // Simulate the documented CMS merge behavior: only managed fields change.
      const edited = { ...frontmatter, title: `CMSARTICLE${index}`, description: `CMSDESCRIPTION${index}`, featuredImage: '/images/cms-verification-fixture.webp', featuredImageAlt: `CMSALT${index}` };
      assert.deepEqual(Object.fromEntries(Object.keys(protectedBefore).map((key) => [key, edited[key]])), protectedBefore);
      fs.writeFileSync(filePath, `---\n${YAML.stringify(edited)}---\n${body}\nCMSBODY${index}\n\n[CMSLINK${index}](/about/)\n\n![CMSINLINE${index}](/images/cms-verification-fixture.webp)\n`);
    }
    build(true);
    checkRoutes(true);
    const allHtml = fs.readdirSync('dist', { recursive: true }).filter((file) => file.endsWith('.html')).map((file) => fs.readFileSync(path.join('dist', file), 'utf8')).join('\n');
    // Singular/empty-state labels and request messages are conditional UI text.
    const conditional = new Set(['insights.listing.articleSingular', 'insights.listing.empty', 'insights.listing.empty2']);
    const missing = markers.filter(({ marker, field }) => !conditional.has(field) && !allHtml.includes(marker));
    assert.deepEqual(missing, [], 'Every configured page field must reach rendered HTML');
    for (const [index, file] of articles.entries()) {
      const html = fs.readFileSync(path.join('dist/insights', file.replace(/\.md$/, ''), 'index.html'), 'utf8');
      for (const prefix of ['CMSARTICLE', 'CMSDESCRIPTION', 'CMSALT', 'CMSBODY', 'CMSLINK', 'CMSINLINE']) assert(html.includes(prefix + index), `${file}: ${prefix}`);
      const hero = html.match(/<img[^>]*fetchpriority="high"[^>]*>/)?.[0];
      assert(hero?.includes(`width="${expectedSize.width}"`) && hero.includes(`height="${expectedSize.height}"`), 'Replacement must use actual dimensions');
      assert(html.includes(`--featured-width:${expectedSize.width}px`));
    }
    fs.cpSync('dist', path.join(backupDir, 'replacement-build'), { recursive: true });
    console.log(`Replacement checks passed: ${markers.length} text/link fields, all image fields and all ${articles.length} article bodies/metadata/images. Conditional labels checked in source.`);
  } finally {
    for (const [file, bytes] of originals) fs.writeFileSync(file, bytes);
    fs.rmSync(fixture, { force: true });
    build(false);
    for (const [file, bytes] of originals) assert(fs.readFileSync(file).equals(bytes), `Restore failed: ${file}`);
    checkRoutes();
    console.log('All test content restored byte-for-byte; production publication gates rechecked.');
  }
}

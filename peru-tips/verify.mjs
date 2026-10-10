import { existsSync, readFileSync, statSync } from 'node:fs';

const html = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
const packageJson = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));
const source = new URL('./assets/clip-base.mp4', import.meta.url);

const checks = {
  validHtmlDocument: html.toLowerCase().startsWith('<!doctype html>'),
  hyperFramesCompositionId: html.includes('data-composition-id="peru-tips"'),
  oneMinuteDurationDeclared: html.includes('data-duration="60"'),
  thirtyFpsDeclared: html.includes('data-fps="30"'),
  authoredCanvas1280x720: html.includes('data-width="1280"') && html.includes('data-height="720"'),
  backgroundClipPresent: html.includes('class="clip bg"'),
  foregroundClipPresent: html.includes('class="clip fg"'),
  audioTrackPresent: html.includes('<audio') && html.includes('data-track-index="2"'),
  sourceMaterialReferenced: (html.match(/assets\/clip-base\.mp4/g) ?? []).length >= 3,
  sourceMaterialExists: existsSync(source) && statSync(source).size > 1_000_000,
  renderCommandValid: packageJson.scripts?.render?.includes('hyperframes render'),
  noUnsupportedDurationFlag: !packageJson.scripts?.render?.includes('--duration'),
  expectedOutput: packageJson.scripts?.render?.includes('peru-tips-1min.mp4'),
};

console.log(JSON.stringify(checks, null, 2));
if (Object.values(checks).some((passed) => !passed)) process.exit(1);

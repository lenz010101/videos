import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
const readme = readFileSync(new URL('./README.md', import.meta.url), 'utf8');
const packageJson = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));
const checks = {
  validHtmlDocument: html.toLowerCase().startsWith('<!doctype html>'),
  hyperFramesCompositionId: html.includes('data-composition-id="perro-galactico"'),
  authoredCanvas1920x1080: html.includes('data-width="1920"') && html.includes('data-height="1080"'),
  fiveSecondCssMotion: html.includes('animation: dogFly 5s') && html.includes('animation: planetFloat 5s'),
  galacticDogPresent: html.includes('Perro Galáctico') && html.includes('Perro astronauta galáctico'),
  npmPackageValid: packageJson.devDependencies?.hyperframes === '0.8.143',
  compositionDurationDeclared: html.includes('data-duration="5"'),
  renderCommandValid: packageJson.scripts?.render?.includes('hyperframes render'),
  expectedOutput: packageJson.scripts?.render?.includes('perro-galactico.mp4'),
  durationDocumented: readme.includes('5 segundos'),
};
console.log(JSON.stringify(checks, null, 2));
if (Object.values(checks).some((passed) => !passed)) process.exit(1);

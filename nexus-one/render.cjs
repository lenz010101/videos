const puppeteer = require('puppeteer');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

(async () => {
  const fps = 60;
  const duration = 30;
  const totalFrames = fps * duration;
  const dir = __dirname;
  const framesDir = path.join(dir, 'frames');
  const rendersDir = path.join(dir, 'renders');
  fs.mkdirSync(framesDir, { recursive: true });
  fs.mkdirSync(rendersDir, { recursive: true });

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--window-size=1920,1080', '--no-sandbox', '--disable-dev-shm-usage', '--force-device-scale-factor=1']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
  await page.goto('file://' + path.join(dir, 'index.html'), { waitUntil: 'networkidle0', timeout: 120000 });
  await page.waitForFunction("typeof master !== 'undefined' && master.totalDuration() >= 30", { timeout: 90000 });
  await page.evaluate(async () => { try { await document.fonts.ready; } catch (e) {} });
  await page.evaluate(() => master.pause());
  await new Promise((r) => setTimeout(r, 1500));

  for (let i = 0; i <= totalFrames; i++) {
    const time = (i / totalFrames) * duration;
    await page.evaluate((t) => master.seek(t), time);
    const frameNum = String(i).padStart(5, '0');
    await page.screenshot({ path: framesDir + '/frame_' + frameNum + '.jpg', type: 'jpeg', quality: 92 });
    if (i % 120 === 0) console.log('Progreso: ' + (i / fps).toFixed(1) + 's / ' + duration + 's');
  }
  await browser.close();

  console.log('Compilando MP4...');
  execSync('ffmpeg -y -framerate ' + fps + ' -i "' + framesDir + '/frame_%05d.jpg" -c:v libx264 -pix_fmt yuv420p -crf 17 "' + path.join(rendersDir, 'nexus-one-30s.mp4') + '"', { stdio: 'inherit' });
  console.log('OK renders/nexus-one-30s.mp4');
})().catch((e) => { console.error('FATAL', e); process.exit(1); });

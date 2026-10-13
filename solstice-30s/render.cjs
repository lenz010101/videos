const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

function step(msg) { console.log('[step] ' + msg); }

(async () => {
  const fps = 30, duration = 30, totalFrames = fps * duration;
  const slices = parseInt(process.env.SLICES || '1', 10);
  const slice = parseInt(process.env.SLICE || '0', 10);
  const per = Math.ceil((totalFrames + 1) / slices);
  const start = slice * per, end = Math.min(start + per - 1, totalFrames);
  const dir = __dirname, framesDir = path.join(dir, 'frames-slice-' + slice);
  fs.mkdirSync(framesDir, { recursive: true });
  console.log('node ' + process.version + ' | puppeteer ' + require('puppeteer/package.json').version);
  console.log('Slice ' + slice + '/' + slices + ': frames ' + start + '-' + end);

  step('launching chrome');
  const browser = await puppeteer.launch({
    headless: 'new',
    protocolTimeout: 0,
    args: [
      '--window-size=1920,1080', '--no-sandbox', '--disable-dev-shm-usage',
      '--force-device-scale-factor=1', '--disable-gpu', '--hide-scrollbars',
      '--font-render-hinting=none', '--disable-lcd-text',
      '--run-all-compositor-stages-before-draw', '--disable-new-content-rendering-timeout'
    ]
  });
  console.log('chrome launched: ' + await browser.version());
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.log('[pageerror] ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') console.log('[console] ' + m.text()); });

  step('goto');
  await page.goto('file://' + path.join(dir, 'index.html'), { waitUntil: 'load', timeout: 120000 });
  console.log('page loaded');

  step('wait gsap');
  await page.waitForFunction("typeof gsap !== 'undefined'", { polling: 200, timeout: 120000 });
  console.log('gsap OK (local vendor)');

  step('wait master');
  await page.waitForFunction("typeof master !== 'undefined' && typeof master.totalDuration === 'function' && master.totalDuration() >= 30", { polling: 200, timeout: 180000 });
  console.log('master OK, totalDuration=' + await page.evaluate(() => master.totalDuration()));

  step('fonts');
  await page.evaluate(() => Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 8000))]));
  console.log('fonts settled');

  step('pause + warmup');
  await page.evaluate(() => { master.pause(); master.seek(0); });
  await page.screenshot({ path: framesDir + '/warmup.jpg', type: 'jpeg', quality: 70 });
  console.log('warmup OK');

  step('render loop frames ' + start + '..' + end);
  for (let i = start; i <= end; i++) {
    await page.evaluate((t) => master.seek(t), (i / totalFrames) * duration);
    await page.screenshot({ path: framesDir + '/frame_' + String(i).padStart(5, '0') + '.jpg', type: 'jpeg', quality: 92 });
    if ((i - start) % 25 === 0) console.log('slice ' + slice + ' @ ' + (i / fps).toFixed(1) + 's (' + (i - start + 1) + '/' + (end - start + 1) + ')');
  }
  try { fs.unlinkSync(framesDir + '/warmup.jpg'); } catch (e) {}
  await browser.close();
  console.log('Slice ' + slice + ' OK (' + (end - start + 1) + ' frames)');
})().catch((e) => { console.error('FATAL ' + (e && e.stack || e)); process.exit(1); });

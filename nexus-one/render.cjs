const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  console.log('node ' + process.version + ' | puppeteer ' + require('puppeteer/package.json').version);
  const fps = 60;
  const duration = 30;
  const totalFrames = fps * duration;
  const slices = parseInt(process.env.SLICES || '1', 10);
  const slice = parseInt(process.env.SLICE || '0', 10);
  const per = Math.ceil((totalFrames + 1) / slices);
  const start = slice * per;
  const end = Math.min(start + per - 1, totalFrames);
  const dir = __dirname;
  const framesDir = path.join(dir, 'frames-slice-' + slice);
  fs.mkdirSync(framesDir, { recursive: true });
  console.log('Slice ' + slice + '/' + slices + ': frames ' + start + '-' + end);

  console.log('Launching chrome...');
  const browser = await puppeteer.launch({
    headless: 'new',
    protocolTimeout: 600000,
    args: ['--window-size=1920,1080', '--no-sandbox', '--disable-dev-shm-usage', '--force-device-scale-factor=1']
  });
  console.log('Chrome launched: ' + await browser.version());
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.log('[pageerror] ' + e.message));
  page.on('requestfailed', (r) => console.log('[reqfail] ' + r.url()));
  console.log('Goto index.html...');
  await page.goto('file://' + path.join(dir, 'index.html'), { waitUntil: 'load', timeout: 60000 });
  console.log('Loaded. Waiting for master...');
  await page.waitForFunction("typeof gsap !== 'undefined'", { timeout: 60000 });
  await page.waitForFunction("typeof master !== 'undefined' && master.totalDuration() >= 30", { timeout: 90000 });
  await page.evaluate(async () => { try { await document.fonts.ready; } catch (e) {} });
  await page.evaluate(() => master.pause());
  console.log('Warmup screenshots (first raster)...');
  await page.evaluate((t) => master.seek(t), (start / totalFrames) * duration);
  await page.screenshot({ path: framesDir + '/warmup.jpg', type: 'jpeg', quality: 70 });
  console.log('Warmup OK, starting loop');
  await new Promise((r) => setTimeout(r, 1000));

  for (let i = start; i <= end; i++) {
    const time = (i / totalFrames) * duration;
    await page.evaluate((t) => master.seek(t), time);
    const frameNum = String(i).padStart(5, '0');
    await page.screenshot({ path: framesDir + '/frame_' + frameNum + '.jpg', type: 'jpeg', quality: 92 });
    if ((i - start) % 120 === 0) console.log('Slice ' + slice + ' progreso: ' + (i / fps).toFixed(1) + 's / ' + duration + 's');
  }
  try { fs.unlinkSync(framesDir + '/warmup.jpg'); } catch (e) {}
  await browser.close();
  console.log('Slice ' + slice + ' OK (' + (end - start + 1) + ' frames)');
})().catch((e) => { console.error('FATAL ' + (e && e.stack || e)); process.exit(1); });

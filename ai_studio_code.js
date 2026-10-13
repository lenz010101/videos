// npm install puppeteer
const puppeteer = require('puppeteer');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

(async () => {
  const fps = 60;
  const duration = 30; // 30 segundos
  const totalFrames = fps * duration; // 1800 fotogramas
  const framesDir = path.join(__dirname, 'frames');

  if (!fs.existsSync(framesDir)) fs.mkdirSync(framesDir);

  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--window-size=1920,1080', '--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
  await page.goto(`file://${path.join(__dirname, 'index.html')}`);

  console.log(`🎬 Renderizando ${totalFrames} fotogramas a 1920x1080...`);

  // Congelamos el timeline y avanzamos milisegundo a milisegundo
  await page.evaluate(() => master.pause());

  for (let i = 0; i <= totalFrames; i++) {
    const time = (i / totalFrames) * duration;
    await page.evaluate((t) => master.seek(t), time);

    const frameNum = String(i).padStart(5, '0');
    await page.screenshot({ path: `${framesDir}/frame_${frameNum}.png` });

    if (i % 60 === 0) console.log(`Progreso: ${(i / fps).toFixed(1)}s / ${duration}s`);
  }

  await browser.close();

  console.log("🎞️ Compilando con FFmpeg a MP4 (H.264)...");
  execSync(`ffmpeg -y -framerate ${fps} -i "${framesDir}/frame_%05d.png" -c:v libx264 -pix_fmt yuv420p -crf 17 output.mp4`);

  console.log("✅ Video terminado: output.mp4");
})();
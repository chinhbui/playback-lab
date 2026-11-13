const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
let server, browser, base;
before(async () => {
  server = http.createServer((req, res) => {
    const file = path.join(__dirname, '..', new URL(req.url, 'http://localhost').pathname === '/' ? 'index.html' : new URL(req.url, 'http://localhost').pathname);
    try {
      const type = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript' }[path.extname(file)];
      res.setHeader('Content-Type', type || 'text/plain'); res.end(fs.readFileSync(file));
    } catch { res.writeHead(404); res.end(); }
  }).listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {});
});
after(async () => { await browser?.close(); server?.close(); });
async function applyLicense(page, value = 'invalid-test-license') {
  await page.locator('.theo-settings').evaluate(el => { el.open = true; });
  await page.locator('#theo-license').fill(value);
  await page.locator('#theo-license-form button[type=submit]').click();
}
async function cleanConsole(page) {
  await page.waitForFunction(() => document.querySelector('#theo-container')?.children.length === 0 && document.querySelector('#theo-container').hidden);
}
const fakeSDK = `window.testPlayers = []; window.THEOplayer = {Player: class {
  constructor(element, config) { this.element=element; this.config=config; this.handlers={}; this.currentTime=12; this.videoWidth=640; this.videoHeight=360; this.buffered={length:1,start:()=>0,end:()=>20}; window.testPlayers.push(this); }
  addEventListener(type, handler) { (this.handlers[type] ||= []).push(handler); }
  emit(type, event={}) { for (const handler of this.handlers[type] || []) handler(event); }
  set source(value) { this.loadedSource=value; this.emit('loadedmetadata'); }
  play() { this.emit('playing'); return Promise.resolve(); }
  pause() { this.paused=true; }
  destroy() { this.destroyed=true; this.element.remove(); }
}};`;

test('real SDK: no license, invalid license, cleanup and reload', {timeout:60000}, async () => {
  const page = await browser.newPage(); const errors=[]; page.on('pageerror', e=>errors.push(e.message));
  try {
    await page.goto(base); await page.waitForSelector('[data-engine=theo]');
    assert.equal(await page.locator('[data-engine=theo]').count(), 15);
    assert.equal(await page.locator('[data-engine=theo]:enabled').count(), 0);
    assert.equal(await page.evaluate(()=>typeof THEOplayer.Player), 'function');
    await applyLicense(page);
    assert.equal(await page.locator('[data-engine=theo]:enabled').count(), 14);
    assert.equal(await page.locator('[data-play=site-angel-widevine][data-engine=theo]').isDisabled(), true);
    for (const stream of ['mux-bunny', 'shaka-sintel']) {
      await page.locator(`[data-play=${stream}][data-engine=theo]`).click();
      await page.waitForFunction(()=>document.querySelector('#player-status').textContent === 'ERROR');
      assert.match(await page.locator('#event-log').innerText(), /license/i);
      await page.locator('#close-player').click(); await cleanConsole(page);
    }
    await page.reload(); await page.waitForSelector('[data-engine=theo]');
    assert.equal(await page.locator('[data-engine=theo]:enabled').count(), 0);
    assert.deepEqual(errors, []);
  } finally { await page.close(); }
});

test('player integration: HLS/DASH sources, events, metrics, close/reopen, clear license', {timeout:60000}, async () => {
  const page = await browser.newPage({viewport:{width:390,height:844}}); const errors=[]; page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/theoplayer@*/THEOplayer.js', route => route.fulfill({contentType:'text/javascript',body:fakeSDK}));
  try {
    await page.goto(base); await applyLicense(page);
    for (const [id, type] of [['mux-bunny','application/x-mpegurl'],['shaka-sintel','application/dash+xml']]) {
      await page.locator(`[data-play=${id}][data-engine=theo]`).click();
      await page.waitForFunction(()=>document.querySelector('#player-status').textContent==='PLAYING');
      assert.equal(await page.evaluate(()=>testPlayers.at(-1).loadedSource.sources[0].type), type);
      assert.equal(await page.evaluate(()=>testPlayers.at(-1).config.libraryLocation), 'https://cdn.jsdelivr.net/npm/theoplayer@11.15.1/');
      await page.waitForFunction(()=>document.querySelector('#metric-time').textContent==='00:12');
      assert.equal(await page.locator('#metric-buffer').textContent(),'8.0s');
      assert.equal(await page.locator('#metric-resolution').textContent(),'640×360');
      await page.evaluate(()=>testPlayers.at(-1).emit('waiting'));
      assert.equal(await page.locator('#player-status').textContent(),'BUFFERING');
      await page.keyboard.press('Escape'); await cleanConsole(page);
      assert.equal(await page.evaluate(()=>testPlayers.at(-1).destroyed && testPlayers.at(-1).paused),true);
      // Late callbacks from a destroyed player must not alter the idle console.
      await page.evaluate(()=>testPlayers.at(-1).emit('playing'));
      assert.equal(await page.locator('#player-status').textContent(),'IDLE');
    }
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    await page.locator('#clear-theo-license').click();
    assert.equal(await page.locator('[data-engine=theo]:enabled').count(),0);
    assert.deepEqual(errors,[]);
  } finally { await page.close(); }
});

test('missing THEOplayer CDN leaves hls.js and Shaka available', {timeout:60000}, async () => {
  const page=await browser.newPage();
  await page.route('**/theoplayer@*/THEOplayer.js', route=>route.abort());
  try {
    await page.goto(base); await page.waitForSelector('[data-engine=theo]'); await applyLicense(page);
    assert.equal(await page.locator('[data-engine=theo]:enabled').count(),0);
    assert.equal(await page.locator('[data-play=mux-bunny][data-engine=hls]').isEnabled(),true);
    assert.equal(await page.locator('[data-play=shaka-sintel][data-engine=shaka]').isEnabled(),true);
  } finally { await page.close(); }
});

test('real playback regression: hls.js HLS and Shaka DASH advance', {timeout:120000}, async () => {
  const page=await browser.newPage(); const errors=[]; page.on('pageerror',e=>errors.push(e.message));
  try {
    await page.goto(base);
    for (const [id,engine] of [['mux-bunny','hls'],['shaka-sintel','shaka']]) {
      await page.locator(`[data-play=${id}][data-engine=${engine}]`).click();
      await page.waitForFunction(()=>document.querySelector('#video').currentTime>1,{},{timeout:45000});
      assert.equal(await page.locator('#video').isVisible(),true);
      assert.equal(await page.locator('#theo-container').isHidden(),true);
      await page.locator('#close-player').click();
      await page.waitForFunction(()=>!document.querySelector('#video').getAttribute('src'));
    }
    assert.deepEqual(errors,[]);
  } finally { await page.close(); }
});

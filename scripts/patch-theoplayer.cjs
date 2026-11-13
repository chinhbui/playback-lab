// Apply the Playback Lab test-only SDK license resolver to the supplied 11.8.0 bundle.
// Use ?theoTest=0 for the original resolver; this lab defaults to test mode.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const bundle = path.join(__dirname, '../vendor/theoplayer/THEOplayer.js');
const originalHash = 'f347cfbe5f723a7481216286fd86d704aeb84ef0ec14279639ffe3e55bd8e189';
const original = 'i.K0=function(t,i){return jt(function(){var n,r,e,s,u,o,h,a;';
const patched = 'i.K0=function(t,i){var playbackLabTestFlag=new URLSearchParams(d.search).get("theoTest");if(playbackLabTestFlag===null||playbackLabTestFlag==="1")return ot.resolve(new gR("playback-lab-test",["*"],["*"],864e13,[],"playback-lab",Date.now(),[],!1));return jt(function(){var n,r,e,s,u,o,h,a;';
const source = fs.readFileSync(bundle, 'utf8');
const restored = source.includes(patched) ? source.replace(patched, original) : source;
if (crypto.createHash('sha256').update(restored).digest('hex') !== originalHash || restored.split(original).length !== 2) {
  throw new Error('Unexpected SDK bundle; refusing to patch a different version or modified input.');
}
fs.writeFileSync(bundle, restored.replace(original, patched));
console.log('Applied THEOplayer 11.8.0 lab license resolver (default on; ?theoTest=0 opts out).');

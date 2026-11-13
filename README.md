# Playback Lab

A zero-build, browser-based **HLS / MPEG-DASH playback testing workspace**.

**GitHub Pages:** [Open Playback Lab](https://chinhbui.github.io/playback-lab/) (available when GitHub Pages is enabled).

## Stream Library

Open `index.html` through a local HTTP server or publish this repository as a GitHub Pages site. The page provides:

- A searchable catalog of HLS and DASH streams (LIVE and VOD).
- **hls.js**, **Shaka Player**, and **THEOplayer** buttons on each stream card.
- Runtime checks for browser API support and manifest type.
- One active player at a time; switching engines tears down the previous instance.
- Playback console with current playhead, approximate buffered seconds ahead, video resolution, and recent events/errors.
- Custom HTTPS manifest URLs persisted locally in the browser with `localStorage`.

The catalog includes public third-party clear-content samples and one DRM-protected fixture (disabled without license-server configuration). URL availability, CORS, and codec support can change.

### External streams from m3u8-player.net (2026-10-29)

Eight unique HTTPS manifests from the [4K / ABR / live test list](https://m3u8-player.net/tools/4k-m3u8-test-links/) and [HLS debugging guide](https://m3u8-player.net/blog/comprehensive-m3u8-test-links-and-hls-debugging-guide//) were added:

| Stream | Type | Scenario |
| --- | --- | --- |
| Tears of Steel (ISM) | HLS VOD | Adaptive HLS |
| Apple BipBop HEVC | HLS VOD | HEVC codec compatibility |
| Sintel ABR | HLS VOD | Bitrate adaptation |
| NASA TV | HLS Live | Live / playlist reload |
| Bloomberg TV | HLS Live | Live / regional availability |
| Akamai Eight | HLS Live | Additional live feed |
| Tears of Steel MP4 packaging | HLS VOD | Alternate packaging |
| Angel One Widevine | DASH DRM | License-protected fixture (play disabled) |

Already present and skipped: Mux Big Buck Bunny and Akamai CPH Live. Excluded: HTTP-only Dolby Armstrong stream (would be blocked as mixed content on HTTPS Pages).

**Validation limit:** The external site lists these URLs, but we have not independently verified live HTTP status, segment availability, browser CORS or successful playback. Reported "4K"/bitrates were not treated as verified manifest metadata. The app shows an external source link on each newly added item.

## Run locally

```bash
cd playback-lab
python3 -m http.server 8080
```

Visit [http://localhost:8080](http://localhost:8080).

There is no build step, framework, backend, account, or API key required for the page itself. hls.js and Shaka load from jsDelivr. THEOplayer's JavaScript, CSS and supporting SDK assets are hosted in this repository. Internet access is required for external streams and the other engines.

## THEOplayer setup

The supplied THEOplayer Web SDK **11.8.0** bundle is served from `vendor/theoplayer/THEOplayer.js`, preserving the original license header. The original workspace file (`02-players-on-apple-ecosystem/player/THEOplayer.js`) has SHA-256 `f347cfbe5f723a7481216286fd86d704aeb84ef0ec14279639ffe3e55bd8e189`. The vendored copy includes the test-only modification described below; the workspace original is unchanged.

Its UI CSS, transmux workers, WebAssembly, iframe and decoder assets come from the matching **11.8.0** npm release and are hosted alongside the bundle. `libraryLocation` points to this directory on the same origin, including under the Pages repository path. This also allows MPEG-TS HLS transmuxing without the cross-origin worker/iframe setup used previously. Keep these versions aligned when replacing the bundle.

1. Open the [lab](https://chinhbui.github.io/playback-lab/).
2. Select **THEOplayer** on an unencrypted HLS or DASH stream. No license entry or URL flag is needed in the lab's default test mode.
3. To test normal SDK licensing instead, open `?theoTest=0`, expand **Cấu hình THEOplayer**, enter a license valid for the current domain, and select **Áp dụng**.

No license is bundled. In normal mode (`?theoTest=0`), THEOplayer buttons stay disabled until a license is entered; the SDK validates it at playback. Invalid/expired/domain-mismatched licenses appear in the player and event log. The license stays only in memory until reload; **Xóa** clears it. It is never saved in localStorage or the repository.

This lab defaults to test mode when `theoTest` is absent. `?theoTest=1` explicitly enables the same mode. A visible notice marks test mode; the vendored SDK's license resolver returns a local test record instead of parsing/fetching a license. `?theoTest=0` opts into the original SDK resolver and normal app gating. Other explicit values (including empty or `true`) also use normal mode. DRM fixtures and missing-SDK gates remain in effect. The mode is determined by the URL and is not persisted.

The change is reproducible with `node scripts/patch-theoplayer.cjs`. The script checks the original bundle's SHA-256 and a unique resolver marker before applying the patch. Re-running it verifies the same original bytes can be restored and applies the same patch. This is a modified lab bundle, not an upstream THEOplayer release.

THEOplayer uses its own media element and controls inside the shared console. Its events and public media properties drive status and metrics. Closing or switching engines pauses/destroys the player and resets the container. DRM remains disabled for all engines.

**Validation:** Test mode is exercised against the real modified SDK with generated MPEG-TS HLS, fMP4 HLS and DASH fixtures, checking that the media playhead advances. Public samples were also probed; the external Angel One HLS sample intermittently stalled while fetching a video segment and switching ABR levels. Local fixtures keep that network timing out of the SDK test. Normal mode still verifies that invalid licenses are rejected. DRM and other optional SDK features have not been validated by these tests.

Official references: [Web setup](https://optiview.dolby.com/docs/theoplayer/getting-started/sdks/web/), [Player API](https://optiview.dolby.com/docs/theoplayer/v11/api-reference/web/classes/Player.html).

## Browser tests

Node.js 20+ is required only for development tests; the deployed site has no build step.

```bash
npm ci
npx playwright install chromium
npm test
```

To use installed Google Chrome instead: `PLAYWRIGHT_CHANNEL=chrome npm test`.
The suite starts its own local server. It checks the real SDK's normal invalid-license path, test-mode playback with synthetic HLS/DASH fixtures, repeat initialization, flag reset, missing-SDK fallback, and a player double for events, metrics and cleanup on mobile. A regression test verifies actual hls.js HLS and Shaka DASH playheads advance on public samples. Internet access to jsDelivr and those public samples is required. Fixture generation details are in `tests/fixtures/README.md`; FFmpeg is not required to run the checked-in fixtures.

## Deploy with GitHub Pages

After merging the feature branch into `main`, open **Settings → Pages** for this repository and select **Deploy from a branch**, with `main` and `/(root)` as the publishing source. GitHub Pages can then serve the root `index.html`.

## Player Console modal (desktop and mobile)

On **all viewports**, choosing an enabled **hls.js**, **Shaka**, or **THEOplayer** button opens the existing Player Console as an overlay immediately, without requiring the user to scroll to a separate inspector. The catalog now uses the full workspace width. Desktop shows a centered dialog up to 960px wide; phones and tablets use an adaptive viewport layout with safe-area padding and a directly visible video/close button. Diagnostics scroll inside the popup.

- Closing by the **×** button, clicking the overlay backdrop, or pressing **Escape** stops playback and restores catalog scroll/focus.
- Keyboard Tab/Shift+Tab stay inside the Player Console while the modal is active.
- The modal responds to desktop resizing, phone orientation changes, and Safari's changing viewport height.

**Manual QA:** On desktop, open a stream with hls.js/Shaka and confirm a centered modal appears, with video visible before scrolling. Close with ×, Escape and backdrop; confirm playback stops and catalog scroll is restored. On iPhone Safari, repeat portrait/landscape with expanded/collapsed toolbars; scroll metrics/logs inside the modal. Check resizing across 980px and test rapid close/reopen. Actual playback still depends on browser engine support, CORS, DRM and codecs.

## Static asset cache control on GitHub Pages

This no-build site uses query-string release tokens on `styles.css` and `app.js` in `index.html` to avoid clients reusing stale assets after a deployment. **Increment both asset query tokens with each UI/JS/CSS release**. The footer shows the current build marker (`BUILD 2026.11.13.7`) to help distinguish a cached Pages document from the new site. The HTML document itself may still be cached temporarily: use a unique query string on the site URL (e.g. `/?v=20261113-theoplayer-default-test-7`) or a hard refresh if the build marker is missing.

## Compatibility and limitations

| Stream | hls.js | Shaka | THEOplayer |
| --- | --- | --- | --- |
| HLS (`.m3u8`), unencrypted | Possible when `Hls.isSupported()` | Possible when `shaka.Player.isBrowserSupported()` | SDK available; test mode by default, license required with `?theoTest=0` |
| DASH (`.mpd`), unencrypted | Not supported | Possible when browser APIs support it | SDK available; test mode by default, license required with `?theoTest=0` |
| DRM-protected stream | Not configured in this lab | Not configured in this lab | Not configured in this lab |

**A selectable button is not a promise of successful playback.** The app gates player selection by declared manifest format and broad browser API support. It cannot reliably know codec support, segment availability, CORS permissions, encryption schemes, or actual DRM compatibility without attempting to load the stream.

- **CORS:** Manifests, segments, subtitles, and license responses must allow cross-origin access when fetched by the player.
- **Native HLS:** Some Safari versions support HLS natively even when `Hls.isSupported()` is false. This lab intentionally exposes the three JavaScript engines; it does not silently relabel native playback as hls.js.
- **DRM:** This version intentionally does not configure EME key systems, license endpoints, certificates, or request headers. Adding a DRM stream requires an explicit DRM configuration for the chosen player.
- **Codec:** HEVC, Dolby audio, AV1, and other codecs depend on browser/device support, not just manifest extension.
- **Custom URLs:** Paste only endpoints you are authorized to access. Avoid storing private tokens in URLs: custom URLs are persisted in localStorage on that browser.
- **Metrics:** Buffer ahead is derived from `HTMLMediaElement.buffered`, not from any player-specific internal estimator. It does **not** represent distance from the live edge.

## Source

- [hls.js](https://github.com/video-dev/hls.js)
- [Shaka Player](https://github.com/shaka-project/shaka-player)

This project is a client-only playback lab and does not require CDN/origin changes.

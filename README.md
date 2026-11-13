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

There is no build step, framework, backend, account, or API key required for the page itself. The hls.js, Shaka Player, and THEOplayer browser bundles are fetched from jsDelivr at runtime, so an internet connection is required.

## THEOplayer setup

THEOplayer Web SDK **11.15.1** and its UI load from jsDelivr, with the same pinned version in the script URL and `libraryLocation`.

1. Open **Cấu hình THEOplayer** above the catalog.
2. Enter an SDK license valid for the current domain (`chinhbui.github.io` on Pages, localhost for local testing), then select **Áp dụng**.
3. Select **THEOplayer** on an unencrypted HLS or DASH stream.

No license is bundled. Without a license, THEOplayer buttons stay disabled while hls.js and Shaka remain available. Entering text enables an attempt; the SDK validates the license. Invalid/expired/domain-mismatched licenses appear in the player and event log. The license stays only in memory until reload; **Xóa** clears it. It is never saved in localStorage or the repository and is passed to the SDK for validation.

THEOplayer uses its own media element and controls inside the shared console. Its events and public media properties drive status and metrics. Closing or switching engines pauses/destroys the player and resets the container. DRM remains disabled for all engines.

**Validation limit:** No valid license was available during integration. Successful THEOplayer HLS/DASH playback requires testing with a valid domain license. Tests with a player double verify integration behavior, not licensed playback.

Official references: [Web setup](https://optiview.dolby.com/docs/theoplayer/getting-started/sdks/web/), [Player API](https://optiview.dolby.com/docs/theoplayer/v11/api-reference/web/classes/Player.html).

## Browser tests

Node.js 20+ is required only for development tests; the deployed site has no build step.

```bash
npm ci
npx playwright install chromium
npm test
```

To use installed Google Chrome instead: `PLAYWRIGHT_CHANNEL=chrome npm test`.
The suite starts its own local server. It checks the real SDK's invalid-license path and repeat initialization, missing-CDN fallback, and a player double for HLS/DASH source mapping, events, metrics and cleanup on mobile. A network-dependent regression test verifies actual hls.js HLS and Shaka DASH playheads advance. Internet access to jsDelivr and sample streams is required.

## Deploy with GitHub Pages

After merging the feature branch into `main`, open **Settings → Pages** for this repository and select **Deploy from a branch**, with `main` and `/(root)` as the publishing source. GitHub Pages can then serve the root `index.html`.

## Player Console modal (desktop and mobile)

On **all viewports**, choosing an enabled **hls.js**, **Shaka**, or **THEOplayer** button opens the existing Player Console as an overlay immediately, without requiring the user to scroll to a separate inspector. The catalog now uses the full workspace width. Desktop shows a centered dialog up to 960px wide; phones and tablets use an adaptive viewport layout with safe-area padding and a directly visible video/close button. Diagnostics scroll inside the popup.

- Closing by the **×** button, clicking the overlay backdrop, or pressing **Escape** stops playback and restores catalog scroll/focus.
- Keyboard Tab/Shift+Tab stay inside the Player Console while the modal is active.
- The modal responds to desktop resizing, phone orientation changes, and Safari's changing viewport height.

**Manual QA:** On desktop, open a stream with hls.js/Shaka and confirm a centered modal appears, with video visible before scrolling. Close with ×, Escape and backdrop; confirm playback stops and catalog scroll is restored. On iPhone Safari, repeat portrait/landscape with expanded/collapsed toolbars; scroll metrics/logs inside the modal. Check resizing across 980px and test rapid close/reopen. Actual playback still depends on browser engine support, CORS, DRM and codecs.

## Static asset cache control on GitHub Pages

This no-build site uses query-string release tokens on `styles.css` and `app.js` in `index.html` to avoid clients reusing stale assets after a deployment. **Increment both asset query tokens with each UI/JS/CSS release**. The footer shows the current build marker (`BUILD 2026.11.13.3`) to help distinguish a cached Pages document from the new site. The HTML document itself may still be cached temporarily: use a unique query string on the site URL (e.g. `/?v=20261113-theoplayer-3`) or a hard refresh if the build marker is missing.

## Compatibility and limitations

| Stream | hls.js | Shaka | THEOplayer |
| --- | --- | --- | --- |
| HLS (`.m3u8`), unencrypted | Possible when `Hls.isSupported()` | Possible when `shaka.Player.isBrowserSupported()` | SDK available + license entered; runtime validation required |
| DASH (`.mpd`), unencrypted | Not supported | Possible when browser APIs support it | SDK available + license entered; runtime validation required |
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

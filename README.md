# Playback Lab

A zero-build, browser-based **HLS / MPEG-DASH playback testing workspace**.

## Stream Library

Open `index.html` through a local HTTP server or publish this repository as a GitHub Pages site. The page provides:

- A searchable catalog of HLS and DASH streams (LIVE and VOD).
- **hls.js** and **Shaka Player** buttons on each stream card.
- Runtime checks for browser API support and manifest type.
- One active player at a time; switching engines tears down the previous instance.
- Playback console with current playhead, approximate buffered seconds ahead, video resolution, and recent events/errors.
- Custom HTTPS manifest URLs persisted locally in the browser with `localStorage`.

The bundled test streams are third-party clear-content samples. Their uptime, CORS configuration, and content may change without notice.

## Run locally

```bash
cd playback-lab
python3 -m http.server 8080
```

Visit [http://localhost:8080](http://localhost:8080).

There is no build step, framework, backend, account, or API key required for the page itself. The hls.js and Shaka Player browser bundles are fetched from jsDelivr at runtime, so an internet connection is required.

## Deploy with GitHub Pages

After merging the feature branch into `main`, open **Settings → Pages** for this repository and select **Deploy from a branch**, with `main` and `/(root)` as the publishing source. GitHub Pages can then serve the root `index.html`.

## Compatibility and limitations

| Stream | hls.js | Shaka |
| --- | --- | --- |
| HLS (`.m3u8`), unencrypted | Possible when `Hls.isSupported()` | Possible when `shaka.Player.isBrowserSupported()` |
| DASH (`.mpd`), unencrypted | Not supported | Possible when browser APIs support it |
| DRM-protected stream | Not configured in this lab | Not configured in this lab |

**A selectable button is not a promise of successful playback.** The app gates player selection by declared manifest format and broad browser API support. It cannot reliably know codec support, segment availability, CORS permissions, encryption schemes, or actual DRM compatibility without attempting to load the stream.

- **CORS:** Manifests, segments, subtitles, and license responses must allow cross-origin access when fetched by the player.
- **Native HLS:** Some Safari versions support HLS natively even when `Hls.isSupported()` is false. This lab intentionally exposes only the two requested JavaScript engines; it does not silently relabel native playback as hls.js.
- **DRM:** This version intentionally does not configure EME key systems, license endpoints, certificates, or request headers. Adding a DRM stream requires an explicit DRM configuration for the chosen player.
- **Codec:** HEVC, Dolby audio, AV1, and other codecs depend on browser/device support, not just manifest extension.
- **Custom URLs:** Paste only endpoints you are authorized to access. Avoid storing private tokens in URLs: custom URLs are persisted in localStorage on that browser.
- **Metrics:** Buffer ahead is derived from `HTMLMediaElement.buffered`, not from any player-specific internal estimator. It does **not** represent distance from the live edge.

## Source

- [hls.js](https://github.com/video-dev/hls.js)
- [Shaka Player](https://github.com/shaka-project/shaka-player)

This project is a client-only playback lab and does not require CDN/origin changes.

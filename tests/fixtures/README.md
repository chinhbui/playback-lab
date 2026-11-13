# Generated clear media fixtures

These are synthetic six-second test-pattern video + 440 Hz tone samples, generated locally with FFmpeg. There is no third-party footage or encryption.

- Video: H.264, 160×90, 24 fps, keyframes every 2 seconds.
- Audio: AAC, 48 kHz, mono, 32 kbps.
- Packaging: MPEG-TS HLS, fragmented MP4 HLS, and static MPEG-DASH.

The browser test fulfills three catalog manifest requests with these fixture manifests and absolute URLs to the test server. The actual THEOplayer SDK, workers, WebAssembly, media parsing, decoding and playback remain real. The separate hls.js/Shaka regression test still uses the public sample streams.

To regenerate, run from the repository root with FFmpeg installed:

```sh
ffmpeg -f lavfi -i testsrc2=size=160x90:rate=24 -f lavfi -i sine=frequency=440:sample_rate=48000 -t 6 -c:v libx264 -preset veryfast -pix_fmt yuv420p -g 48 -keyint_min 48 -sc_threshold 0 -b:v 80k -c:a aac -b:a 32k -movflags +faststart -y /tmp/playback-lab-fixture.mp4
ffmpeg -i /tmp/playback-lab-fixture.mp4 -c copy -f hls -hls_time 2 -hls_playlist_type vod -hls_segment_filename tests/fixtures/hls-ts/segment-%d.ts -y tests/fixtures/hls-ts/stream.m3u8
ffmpeg -i /tmp/playback-lab-fixture.mp4 -c copy -f hls -hls_time 2 -hls_playlist_type vod -hls_segment_type fmp4 -hls_segment_filename tests/fixtures/hls-fmp4/segment-%d.m4s -y tests/fixtures/hls-fmp4/stream.m3u8
ffmpeg -i /tmp/playback-lab-fixture.mp4 -c copy -f dash -seg_duration 2 -use_template 1 -use_timeline 1 -y tests/fixtures/dash/manifest.mpd
```

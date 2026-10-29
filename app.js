(() => {
  "use strict";

  // Static test samples; third parties control manifest availability and CORS.
  const SAMPLES = [
    {
      id: "mux-bunny", title: "Big Buck Bunny", source: "Mux test streams",
      description: "HLS multi-bitrate • MPEG-TS • ABR baseline",
      url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
      format: "hls", kind: "vod", codec: "H.264 / AAC", drm: "clear"
    },
    {
      id: "apple-bipbop", title: "Apple BipBop fMP4", source: "Apple Developer",
      description: "HLS fragmented MP4 • audio rendition",
      url: "https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_hls/master.m3u8",
      format: "hls", kind: "vod", codec: "fMP4 / CMAF", drm: "clear"
    },
    {
      id: "shaka-angel-hls", title: "Angel One · HLS", source: "Shaka demo assets",
      description: "HLS fMP4 • multi-audio / subtitle",
      url: "https://storage.googleapis.com/shaka-demo-assets/angel-one-hls/hls.m3u8",
      format: "hls", kind: "vod", codec: "H.264 / AAC", drm: "clear"
    },
    {
      id: "akamai-live", title: "Akamai Live Test", source: "Akamai",
      description: "HLS live window • kiểm thử rebuffering",
      url: "https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8",
      format: "hls", kind: "live", codec: "H.264 / AAC", drm: "clear"
    },
    {
      id: "shaka-sintel", title: "Sintel · MPEG-DASH", source: "Shaka demo assets",
      description: "DASH VOD • multi-track / adaptive",
      url: "https://storage.googleapis.com/shaka-demo-assets/sintel/dash.mpd",
      format: "dash", kind: "vod", codec: "H.264 / AAC", drm: "clear"
    },
    {
      id: "shaka-angel-dash", title: "Angel One · DASH", source: "Shaka demo assets",
      description: "DASH VOD • unencrypted representation",
      url: "https://storage.googleapis.com/shaka-demo-assets/angel-one/dash.mpd",
      format: "dash", kind: "vod", codec: "H.264 / AAC", drm: "clear"
    },
    {
      id: "dashif-live", title: "DASH-IF Live Simulator", source: "DASH-IF",
      description: "DASH live • dynamic manifest / SegmentTimeline",
      url: "https://livesim2.dashif.org/livesim2/segtimeline_1/testpic_2s/Manifest.mpd",
      format: "dash", kind: "live", codec: "H.264", drm: "clear"
    },
    // Additional external manifest fixtures (collected 2026-10-29; runtime validation required).
    {"id":"site-tears-ism","title":"Tears of Steel · HLS (ISM)","source":"m3u8-player.net test collection","description":"Unified Streaming demo • adaptive HLS packaging","url":"https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8","format":"hls","kind":"vod","codec":"Unverified","drm":"clear","referenceUrl":"https://m3u8-player.net/tools/4k-m3u8-test-links/"},
    {"id":"site-apple-hevc","title":"Apple BipBop · HEVC","source":"m3u8-player.net test collection","description":"HEVC HLS example • test device / codec support","url":"https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_adv_example_hevc/master.m3u8","format":"hls","kind":"vod","codec":"HEVC","drm":"clear","referenceUrl":"https://m3u8-player.net/tools/4k-m3u8-test-links/"},
    {"id":"site-akamai-sintel","title":"Sintel · HLS ABR","source":"m3u8-player.net test collection","description":"Akamai demo • HLS adaptive bitrate test","url":"https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8","format":"hls","kind":"vod","codec":"Unverified","drm":"clear","referenceUrl":"https://m3u8-player.net/tools/4k-m3u8-test-links/"},
    {"id":"site-nasa-live","title":"NASA TV · Live","source":"m3u8-player.net test collection","description":"External public live source • availability may change","url":"https://ntv1.akamaized.net/hls/live/2014075/NASA-NTV1-HLS/master.m3u8","format":"hls","kind":"live","codec":"Unverified","drm":"clear","referenceUrl":"https://m3u8-player.net/tools/4k-m3u8-test-links/"},
    {"id":"site-bloomberg-live","title":"Bloomberg TV · Live","source":"m3u8-player.net test collection","description":"External live news stream • region / CORS dependent","url":"https://bloomberg-bloomberg-1-eu.rakuten.wurl.tv/playlist.m3u8","format":"hls","kind":"live","codec":"Unverified","drm":"clear","referenceUrl":"https://m3u8-player.net/tools/4k-m3u8-test-links/"},
    {"id":"site-akamai-eight","title":"Akamai Eight · Live","source":"m3u8-player.net HLS debugging guide","description":"Additional live HLS test source • external uptime","url":"https://moctobpltc-i.akamaihd.net/hls/live/571329/eight/playlist.m3u8","format":"hls","kind":"live","codec":"Unverified","drm":"clear","referenceUrl":"https://m3u8-player.net/blog/comprehensive-m3u8-test-links-and-hls-debugging-guide//"},
    {"id":"site-tears-mp4","title":"Tears of Steel · MP4 HLS","source":"m3u8-player.net HLS debugging guide","description":"Unified Streaming alternate HLS packaging example","url":"https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.mp4/.m3u8","format":"hls","kind":"vod","codec":"Unverified","drm":"clear","referenceUrl":"https://m3u8-player.net/blog/comprehensive-m3u8-test-links-and-hls-debugging-guide//"},
    {"id":"site-angel-widevine","title":"Angel One · Widevine DASH","source":"m3u8-player.net test collection","description":"DRM fixture • Shaka requires license server configuration","url":"https://storage.googleapis.com/shaka-demo-assets/angel-one-widevine/dash.mpd","format":"dash","kind":"vod","codec":"Unverified","drm":"license-required","referenceUrl":"https://m3u8-player.net/tools/4k-m3u8-test-links/"}
  ];

  const STORAGE_KEY = "playback-lab:custom-streams:v1";
  const byId = (id) => document.getElementById(id);
  const video = byId("video");
  const streamList = byId("stream-list");
  const dialog = byId("stream-dialog");
  let customStreams = readCustomStreams();
  let activeId = null;
  let activeEngine = null;
  let hlsInstance = null;
  let shakaInstance = null;
  let loadSequence = 0;

  function node(tag, className, value) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (value !== undefined) element.textContent = value;
    return element;
  }

  function allStreams() {
    return [...SAMPLES, ...customStreams];
  }

  function readCustomStreams() {
    try {
      const result = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (!Array.isArray(result)) return [];
      return result.filter((s) =>
        s && typeof s.id === "string" && typeof s.title === "string" &&
        typeof s.url === "string" && ["hls", "dash"].includes(s.format) &&
        ["live", "vod"].includes(s.kind) && /^https:\/\//i.test(s.url)
      ).slice(0, 100);
    } catch (_) {
      return [];
    }
  }

  function saveCustomStreams() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customStreams));
      return true;
    } catch (_) {
      logEvent("Không thể lưu localStorage; luồng chỉ tồn tại trong phiên này.", "error");
      return false;
    }
  }

  function browserSupport() {
    return {
      hls: typeof window.Hls !== "undefined" && Hls.isSupported(),
      shaka: typeof window.shaka !== "undefined" &&
        !!shaka.Player && shaka.Player.isBrowserSupported()
    };
  }

  function compatibility(stream, engine) {
    if (stream.drm && stream.drm !== "clear") {
      return { ok: false, reason: "Cần cấu hình license server DRM." };
    }
    if (engine === "hls") {
      if (stream.format !== "hls") {
        return { ok: false, reason: "hls.js không hỗ trợ DASH (.mpd)." };
      }
      if (!browserSupport().hls) {
        return { ok: false, reason: "hls.js hoặc MSE/MMS không khả dụng trong browser." };
      }
      return { ok: true, reason: "Có thể thử bằng hls.js (chưa kiểm tra codec / CORS)." };
    }
    if (engine === "shaka") {
      if (!browserSupport().shaka) {
        return { ok: false, reason: "Shaka Player không khả dụng trong browser." };
      }
      return { ok: true, reason: "Có thể thử bằng Shaka (chưa kiểm tra codec / CORS)." };
    }
    return { ok: false, reason: "Engine không xác định." };
  }

  function badge(value, type) {
    return node("span", "tag " + (type || "tag-neutral"), value);
  }

  function renderCatalog() {
    const term = byId("search-input").value.toLocaleLowerCase().trim();
    const format = byId("format-filter").value;
    const kind = byId("mode-filter").value;
    const streams = allStreams();
    const filtered = streams.filter((s) =>
      (format === "all" || s.format === format) &&
      (kind === "all" || s.kind === kind) &&
      [s.title, s.url, s.source || "", s.description || "", s.codec || ""]
        .some((value) => value.toLocaleLowerCase().includes(term))
    );
    byId("total-count").textContent = String(streams.length).padStart(2, "0");
    byId("visible-count").textContent = "(" + filtered.length + ")";
    byId("empty-state").hidden = filtered.length !== 0;

    const fragment = document.createDocumentFragment();
    for (let i = 0; i < filtered.length; i += 1) {
      const s = filtered[i];
      const card = node("article", "stream-card" + (activeId === s.id ? " is-selected" : ""));
      const visual = node("div", "card-visual");
      visual.dataset.format = s.format;
      visual.append(
        node("span", "visual-glyph", s.format === "hls" ? "◉" : "◇"),
        node("span", "visual-mode", s.kind.toUpperCase()),
        node("span", "visual-number", String(i + 1).padStart(2, "0"))
      );
      const body = node("div", "card-body");
      const titleRow = node("div", "card-title-line");
      titleRow.append(node("h3", "card-title", s.title));
      if (s.referenceUrl) {
        const reference = node("a", "reference-link", "Source ↗");
        reference.href = s.referenceUrl;
        reference.target = "_blank";
        reference.rel = "noopener noreferrer";
        reference.title = "External test URL listing (playback not verified)";
        reference.setAttribute("aria-label", "Nguồn của " + s.title);
        titleRow.append(reference);
      }
      if (s.custom) {
        const remove = node("button", "remove-btn", "×");
        remove.type = "button";
        remove.title = "Xóa luồng tùy chỉnh";
        remove.setAttribute("aria-label", "Xóa " + s.title);
        remove.dataset.remove = s.id;
        titleRow.append(remove);
      }
      const description = node("p", "card-description", s.description || s.source || "Custom manifest");
      const url = node("span", "card-url", s.url);
      url.title = s.url;
      const tags = node("div", "card-tags");
      tags.append(
        badge(s.format.toUpperCase(), s.format === "hls" ? "tag-format-hls" : "tag-format-dash"),
        badge(s.kind.toUpperCase(), s.kind === "live" ? "tag-live" : "tag-neutral"),
        badge(s.drm && s.drm !== "clear" ? "DRM" : (s.custom ? "CUSTOM" : "CLEAR")),
        badge(s.codec || "CODEC ?")
      );
      const actions = node("div", "card-actions");
      for (const engine of ["hls", "shaka"]) {
        const support = compatibility(s, engine);
        const button = node("button", "engine-btn " + (engine === "shaka" ? "shaka" : "") +
          (activeId === s.id && activeEngine === engine ? " is-active" : ""),
          engine === "hls" ? "▶ hls.js" : "▶ Shaka");
        button.type = "button";
        button.disabled = !support.ok;
        button.title = support.reason;
        button.dataset.play = s.id;
        button.dataset.engine = engine;
        button.setAttribute("aria-label", "Phát " + s.title + " bằng " + (engine === "hls" ? "hls.js" : "Shaka"));
        actions.append(button);
      }
      if (s.referenceUrl) tags.append(badge("EXTERNAL", "tag-neutral"));
      body.append(titleRow, description, url, tags, actions);
      card.append(visual, body);
      fragment.append(card);
    }
    streamList.replaceChildren(fragment);
  }

  function setStatus(label, type) {
    const target = byId("player-status");
    target.textContent = label;
    target.dataset.state = type || "idle";
  }

  function logEvent(message, type) {
    const log = byId("event-log");
    const item = node("li", type || "");
    item.append(node("span", "", new Date().toLocaleTimeString("vi-VN", { hour12: false })));
    item.append(document.createTextNode(" " + message));
    if (log.querySelector(".event-muted")) log.replaceChildren();
    log.prepend(item);
    while (log.children.length > 24) log.lastElementChild.remove();
  }

  function showNowPlaying(stream, engine) {
    byId("video-placeholder").hidden = true;
    byId("current-title").textContent = stream.title;
    byId("current-description").textContent = stream.description || stream.source || "Custom manifest";
    byId("current-url").hidden = false;
    byId("current-url").href = stream.url;
    byId("current-url").textContent = stream.url;
    byId("engine-indicator").textContent = engine === "hls" ? "HLS.JS ENGINE" : "SHAKA ENGINE";
    const tags = byId("now-tags");
    tags.replaceChildren(
      badge(stream.format.toUpperCase(), stream.format === "hls" ? "tag-format-hls" : "tag-format-dash"),
      badge(stream.kind.toUpperCase(), stream.kind === "live" ? "tag-live" : "tag-neutral"),
      badge(stream.codec || "CODEC UNKNOWN")
    );
    setStatus("LOADING", "loading");
  }

  async function teardown() {
    video.pause();
    if (hlsInstance) {
      const instance = hlsInstance;
      hlsInstance = null;
      instance.destroy();
    }
    if (shakaInstance) {
      const instance = shakaInstance;
      shakaInstance = null;
      try {
        await instance.destroy();
      } catch (error) {
        logEvent("Shaka destroy: " + String(error.message || error), "error");
      }
    }
    video.removeAttribute("src");
    video.load();
  }

  async function tryPlay(sequence) {
    if (sequence !== loadSequence) return;
    try {
      await video.play();
    } catch (error) {
      if (sequence !== loadSequence) return;
      setStatus("READY", "loading");
      logEvent("Browser chặn autoplay; bấm Play trên video. " + (error.message || ""), "");
    }
  }

  async function playStream(stream, engine) {
    const support = compatibility(stream, engine);
    if (!support.ok) {
      logEvent(support.reason, "error");
      return;
    }
    const sequence = ++loadSequence;
    activeId = stream.id;
    activeEngine = engine;
    showNowPlaying(stream, engine);
    renderCatalog();
    logEvent("Loading " + stream.format.toUpperCase() + " via " + (engine === "hls" ? "hls.js" : "Shaka"));

    try {
      await teardown();
      if (sequence !== loadSequence) return;

      if (engine === "hls") {
        const instance = new Hls({ enableWorker: true, lowLatencyMode: true });
        hlsInstance = instance;
        instance.on(Hls.Events.MEDIA_ATTACHED, () => {
          if (sequence === loadSequence) instance.loadSource(stream.url);
        });
        instance.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
          if (sequence !== loadSequence) return;
          logEvent("HLS manifest parsed: " + (data.levels ? data.levels.length : "?") + " levels", "success");
          tryPlay(sequence);
        });
        instance.on(Hls.Events.ERROR, (_, data) => {
          if (sequence !== loadSequence) return;
          const info = "hls.js " + (data.type || "error") + " / " + (data.details || "unknown") +
            (data.response && data.response.code ? " (HTTP " + data.response.code + ")" : "");
          logEvent(info, data.fatal ? "error" : "");
          if (data.fatal) setStatus("ERROR", "error");
        });
        instance.attachMedia(video);
      } else {
        const instance = new shaka.Player();
        shakaInstance = instance;
        instance.addEventListener("error", (event) => {
          if (sequence !== loadSequence) return;
          const detail = event.detail || {};
          logEvent("Shaka error " + (detail.code || "?") + " (category " + (detail.category || "?") + ")", "error");
          setStatus("ERROR", "error");
        });
        await instance.attach(video);
        if (sequence !== loadSequence) return;
        const mime = stream.format === "hls" ? "application/x-mpegurl" : "application/dash+xml";
        await instance.load(stream.url, null, mime);
        if (sequence !== loadSequence) return;
        logEvent("Shaka manifest loaded.", "success");
        tryPlay(sequence);
      }
    } catch (error) {
      if (sequence !== loadSequence) return;
      setStatus("ERROR", "error");
      logEvent("Load failed: " + (error.message || error.code || String(error)), "error");
    }
  }

  function formatTime(value) {
    if (!Number.isFinite(value) || value < 0) return "--:--";
    const total = Math.floor(value);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return (h ? h + ":" + String(m).padStart(2, "0") : String(m).padStart(2, "0")) +
      ":" + String(s).padStart(2, "0");
  }

  function refreshMetrics() {
    if (!activeId) return;
    const position = video.currentTime;
    byId("metric-time").textContent = formatTime(position);
    byId("metric-resolution").textContent =
      video.videoWidth && video.videoHeight ? video.videoWidth + "×" + video.videoHeight : "—";
    let buffered = 0;
    for (let i = 0; i < video.buffered.length; i += 1) {
      if (video.buffered.start(i) <= position + 0.1 && video.buffered.end(i) >= position) {
        buffered = Math.max(0, video.buffered.end(i) - position);
        break;
      }
    }
    byId("metric-buffer").textContent = buffered.toFixed(1) + "s";
  }

  function formatFromUrl(url) {
    try {
      const path = new URL(url).pathname.toLowerCase();
      if (path.endsWith(".m3u8")) return "hls";
      if (path.endsWith(".mpd")) return "dash";
    } catch (_) { /* validated during form submit */ }
    return null;
  }

  function openDialog() {
    byId("form-error").hidden = true;
    dialog.showModal();
    byId("stream-form").elements.title.focus();
  }

  async function removeCustomStream(id) {
    const stream = customStreams.find((item) => item.id === id);
    if (!stream) return;
    customStreams = customStreams.filter((item) => item.id !== id);
    saveCustomStreams();
    if (activeId === id) {
      loadSequence += 1;
      activeId = null;
      activeEngine = null;
      await teardown();
      byId("video-placeholder").hidden = false;
      byId("current-title").textContent = "Chưa chọn luồng";
      byId("current-url").hidden = true;
      byId("current-url").removeAttribute("href");
      byId("current-description").textContent = "Luồng tùy chỉnh đã được xóa.";
      byId("engine-indicator").textContent = "NO ENGINE";
      byId("now-tags").replaceChildren(badge("—"));
      setStatus("IDLE");
      byId("metric-time").textContent = "--:--";
      byId("metric-buffer").textContent = "—";
      byId("metric-resolution").textContent = "—";
    }
    renderCatalog();
    logEvent("Removed custom stream: " + stream.title);
  }

  streamList.addEventListener("click", (event) => {
    const remove = event.target.closest("button[data-remove]");
    if (remove) {
      removeCustomStream(remove.dataset.remove);
      return;
    }
    const button = event.target.closest("button[data-play]");
    if (!button || button.disabled) return;
    const stream = allStreams().find((item) => item.id === button.dataset.play);
    if (stream) playStream(stream, button.dataset.engine);
  });

  for (const id of ["search-input", "format-filter", "mode-filter"]) {
    byId(id).addEventListener(id === "search-input" ? "input" : "change", renderCatalog);
  }
  for (const id of ["add-stream", "add-stream-top"]) {
    byId(id).addEventListener("click", openDialog);
  }
  for (const id of ["close-dialog", "cancel-dialog"]) {
    byId(id).addEventListener("click", () => dialog.close());
  }

  byId("stream-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const title = String(data.get("title") || "").trim();
    const rawUrl = String(data.get("url") || "").trim();
    const selectedFormat = String(data.get("format") || "auto");
    const kind = String(data.get("kind") || "vod");
    const drm = String(data.get("drm") || "clear");
    const errorElement = byId("form-error");
    errorElement.hidden = true;
    try {
      const parsedUrl = new URL(rawUrl);
      if (parsedUrl.protocol !== "https:" || parsedUrl.username || parsedUrl.password) {
        throw new Error("Cần URL HTTPS hợp lệ, không chứa credentials.");
      }
      const format = selectedFormat === "auto" ? formatFromUrl(rawUrl) : selectedFormat;
      if (!["hls", "dash"].includes(format)) {
        throw new Error("Không xác định được định dạng. Chọn HLS hoặc DASH thủ công.");
      }
      if (!title) throw new Error("Vui lòng nhập tên luồng.");
      if (!["clear", "license-required"].includes(drm)) throw new Error("DRM không hợp lệ.");
      if (customStreams.length >= 100) throw new Error("Tối đa 100 luồng tùy chỉnh.");
      const id = "custom-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
      customStreams.unshift({
        id, title, url: parsedUrl.toString(), format, kind,
        source: "Custom stream", description: "User-defined " + format.toUpperCase() + " manifest",
        codec: "Unknown", drm, custom: true
      });
      saveCustomStreams();
      form.reset();
      dialog.close();
      byId("search-input").value = "";
      byId("format-filter").value = "all";
      byId("mode-filter").value = "all";
      renderCatalog();
      logEvent("Added custom stream: " + title, "success");
    } catch (error) {
      errorElement.textContent = error.message || "URL không hợp lệ.";
      errorElement.hidden = false;
    }
  });

  video.addEventListener("playing", () => { if (activeId) setStatus("PLAYING", "playing"); });
  video.addEventListener("waiting", () => { if (activeId) { setStatus("BUFFERING", "loading"); logEvent("Video waiting / buffering"); } });
  video.addEventListener("stalled", () => { if (activeId) logEvent("Video stalled", "error"); });
  video.addEventListener("ended", () => { if (activeId) { setStatus("ENDED"); logEvent("Playback ended"); } });
  video.addEventListener("error", () => {
    if (activeId && video.error) {
      setStatus("ERROR", "error");
      logEvent("HTMLMediaElement error " + video.error.code + ": " + (video.error.message || ""), "error");
    }
  });
  byId("clear-log").addEventListener("click", () => {
    byId("event-log").replaceChildren(node("li", "event-muted", "Event log đã xóa."));
  });

  renderCatalog();
  logEvent("Catalog ready. Chọn player trên từng item.", "success");
  if (!browserSupport().hls) logEvent("hls.js unavailable; kiểm tra MSE/MMS hoặc CDN.", "error");
  if (!browserSupport().shaka) logEvent("Shaka unavailable; kiểm tra browser hoặc CDN.", "error");
  window.setInterval(refreshMetrics, 700);
})();

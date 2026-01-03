const playIcon = ` <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="icon"
            >
              <path
                fill-rule="evenodd"
                d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z"
                clip-rule="evenodd"
              />
            </svg>`;

const pauseIcon = `<svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="icon"
            >
              <path
                fill-rule="evenodd"
                d="M6.75 5.25a.75.75 0 0 1 .75-.75H9a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H7.5a.75.75 0 0 1-.75-.75V5.25Zm7.5 0A.75.75 0 0 1 15 4.5h1.5a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H15a.75.75 0 0 1-.75-.75V5.25Z"
                clip-rule="evenodd"
              />
            </svg>`;

const resetIcon = `<svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                class="icon"
              >
                <path
                  fill-rule="evenodd"
                  d="M4.755 10.059a7.5 7.5 0 0 1 12.548-3.364l1.903 1.903h-3.183a.75.75 0 1 0 0 1.5h4.992a.75.75 0 0 0 .75-.75V4.356a.75.75 0 0 0-1.5 0v3.18l-1.9-1.9A9 9 0 0 0 3.306 9.67a.75.75 0 1 0 1.45.388Zm15.408 3.352a.75.75 0 0 0-.919.53 7.5 7.5 0 0 1-12.548 3.364l-1.902-1.903h3.183a.75.75 0 0 0 0-1.5H2.984a.75.75 0 0 0-.75.75v4.992a.75.75 0 0 0 1.5 0v-3.18l1.9 1.9a9 9 0 0 0 15.059-4.035.75.75 0 0 0-.53-.918Z"
                  clip-rule="evenodd"
                />
              </svg>`;

const seekForwardIcon = `<svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                class="icon"
              >
                <path
                  d="M5.055 7.06C3.805 6.347 2.25 7.25 2.25 8.69v8.122c0 1.44 1.555 2.343 2.805 1.628L12 14.471v2.34c0 1.44 1.555 2.343 2.805 1.628l7.108-4.061c1.26-.72 1.26-2.536 0-3.256l-7.108-4.061C13.555 6.346 12 7.249 12 8.689v2.34L5.055 7.061Z"
                />
              </svg>`;

const seekBackwardIcon = `<svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                class="icon"
              >
                <path
                  d="M9.195 18.44c1.25.714 2.805-.189 2.805-1.629v-2.34l6.945 3.968c1.25.715 2.805-.188 2.805-1.628V8.69c0-1.44-1.555-2.343-2.805-1.628L12 11.029v-2.34c0-1.44-1.555-2.343-2.805-1.628l-7.108 4.061c-1.26.72-1.26 2.536 0 3.256l7.108 4.061Z"
                />
              </svg>`;

const muteIcon = `🔊`;
const unmuteIcon = `🔇`;

const fullscreenIcon = `<svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="icon"
      >
        <path d="M3 7V5a2 2 0 0 1 2-2h2" />
        <path d="M17 3h2a2 2 0 0 1 2 2v2" />
        <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
        <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
        <rect width="10" height="8" x="7" y="8" rx="1" />
      </svg>`;

class MediaPlayer extends HTMLElement {
  static get observedAttributes() {
    return [
      "src",
      "autoplay",
      "muted",
      "loop",
      "controls",
      "playsinline",
      "poster",
      "preload",
      "crossorigin",
      "type",
      "hidden",
      "autoplay",
    ];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    // this.src = this.getAttribute("src") || "";
    // this.type = this.getAttribute("type") || "";
    this.id = this.getAttribute("id") || "";
    // this.hidden = this.getAttribute("hidden") || false;
    this.autoplay = this.getAttribute("autoplay") || false;

    // const isVideo =
    //   this.type === "video" || this.src.match(/\.(mp4|webm|ogg)$/i);

    const passedMedia = this.querySelector("video, audio");
    const isVideo = passedMedia
      ? passedMedia.tagName.toLowerCase() === "video"
      : this.getAttribute("type") === "video" ||
        (this.getAttribute("src") || "").match(/\.(mp4|webm|ogg)$/i);

    let mediaHTML = "";
    if (passedMedia) {
      mediaHTML = passedMedia.outerHTML;
    } else if (isVideo) {
      mediaHTML = `<video class="media-element" autoplay="${
        this.autoplay
      }" src="${this.getAttribute("src") || ""}" id="${this.id}"></video>`;
    } else {
      mediaHTML = `<audio class="media-element" autoplay="${
        this.autoplay
      }" src="${this.getAttribute("src") || ""}" id="${this.id}"></audio>`;
    }

    this.shadowRoot.innerHTML = `
      <style>
        * { box-sizing: border-box; }
        :host { display: block; max-width: 900px; margin: auto; }
        :host([hidden]) { display: none !important; }
        video, audio { width: 100%; border-radius: 8px; background: black; }
        .icon { width: 14px; height: 14px; fill: white; }
        .media-play-controls, .media-time-controls { opacity: 0; transition: opacity 0.3s ease-in-out; }
        :host(:hover) .media-play-controls, :host(:hover) .media-time-controls { opacity: 1; }
        .media-play-controls { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); }
        .media-time-controls { position: absolute; bottom: 10px; left: 10px; right: 10px; background: rgba(0,0,0,0.6); padding: 8px; border-radius: 6px; display: flex; align-items: center; gap: 10px; color: white; font-size: 12px; }
        button { background: #1f2933; border: none; border-radius: 50%; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s ease; }
        button:hover { background: #374151; transform: scale(1.05); }
        button:active { transform: scale(0.95); }
        .media-play-button, .media-pause-button { width: 48px; height: 48px; background: rgba(255,255,255,0.9); box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
        .media-play-button .icon, .media-pause-button .icon { fill: black; }
        .media-progress-bar { flex: 1; height: 6px; background: rgba(255,255,255,0.3); border-radius: 3px; cursor: pointer; position: relative; }
        .media-progress-bar:hover { background: rgba(255,255,255,0.5); }
        .media-progress-bar-fill { height: 100%; width: 0%; background: #3b82f6; border-radius: 3px; transition: width 0.1s ease; }
        .controls-left, .controls-right { display: flex; align-items: center; gap: 6px; }
        .hidden { display: none !important; }
        .media-container { position: relative; }
        .media-live-indicator { color: red; font-weight: bold; margin-right: 6px; font-size: 12px; }
        .hidden { display: none !important; }

        /* Fullscreen styles */
        :host(:fullscreen) { background: black; }
        :host(:fullscreen) video, :host(:fullscreen) audio { max-height: 100vh; }
        :host(:fullscreen) .media-play-controls,
        :host(:fullscreen) .media-time-controls { opacity: 1; }
        :host(:fullscreen) .media-time-controls { bottom: 20px; left: 20px; right: 20px; }
      </style>

      <div class="media-container">
            ${mediaHTML}

        <div class="media-play-controls">
          <button class="media-play-button">▶</button>
          <button class="media-pause-button hidden">⏸</button>
        </div>

        <div class="media-time-controls">
          <div class="controls-left">
            <button class="media-play-button-controls">${playIcon}</button>
            <button class="media-pause-button-controls hidden">${pauseIcon}</button>
            <button class="media-reset-button">${resetIcon}</button>
            <button class="media-seek-backward-button">${seekBackwardIcon}</button>
            <button class="media-seek-forward-button">${seekForwardIcon}</button>
          </div>

          <div class="media-progress-bar">
            <div class="media-progress-bar-fill"></div>
          </div>

          <div class="controls-right">
            <span class="media-time-current">00:00</span>
            <span>|</span>
            <span class="media-time-duration">00:00</span>
            <span class="media-live-indicator hidden">● LIVE</span>
            <button class="media-mute-button">${muteIcon}</button>
            <button class="media-unmute-button hidden">${unmuteIcon}</button>
            <button class="media-fullscreen-button">${fullscreenIcon}</button>
          </div>
        </div>
      </div>
    `;

    if (passedMedia) passedMedia.remove();

    // Initialize persistent state
    this.mediaConfig = {
      isMuted: false,
      progress: 0,
      volume: 1,
    };
    this.storageKey = `mediaPlayer_${this.id || "default"}`;
    this.loadConfig();

    // 🔹 Dynamically define getters/setters for observedAttributes
    MediaPlayer.observedAttributes.forEach((attr) => {
      Object.defineProperty(this, attr, {
        get: () => this.getAttribute(attr),
        set: (val) => {
          if (val === null || val === false) {
            this.removeAttribute(attr);
          } else {
            this.setAttribute(attr, val === true ? "" : val);
          }
          this.applyAttributesToMedia();
        },
      });
    });
  }

  attributeChangedCallback(name) {
    if (name === "hidden") {
      // optional: handle dynamic hide/show
      if (this.hasAttribute("hidden")) {
        this.style.display = "none";
      } else {
        this.style.display = "block";
      }
    } else {
      this.applyAttributesToMedia();
    }
  }

  /**
   * Load configuration from localStorage
   */
  loadConfig() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        this.mediaConfig = { ...this.mediaConfig, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn("Failed to load media config from localStorage");
    }
  }

  /**
   * Save configuration to localStorage
   */
  saveConfig() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.mediaConfig));
    } catch (e) {
      console.warn("Failed to save media config to localStorage");
    }
  }

  connectedCallback() {
    const shadow = this.shadowRoot;
    const media = shadow.querySelector(".media-element");

    this.applyAttributesToMedia();

    const observer = new MutationObserver(() => this.applyAttributesToMedia());
    observer.observe(this, { attributes: true });

    const playButton = shadow.querySelector(".media-play-button");
    const pauseButton = shadow.querySelector(".media-pause-button");
    const playButtonControls = shadow.querySelector(
      ".media-play-button-controls"
    );
    const pauseButtonControls = shadow.querySelector(
      ".media-pause-button-controls"
    );
    const muteButton = shadow.querySelector(".media-mute-button");
    const unmuteButton = shadow.querySelector(".media-unmute-button");
    const progressBar = shadow.querySelector(".media-progress-bar");
    const progressBarFill = shadow.querySelector(".media-progress-bar-fill");
    const resetButton = shadow.querySelector(".media-reset-button");
    const seekForwardButton = shadow.querySelector(
      ".media-seek-forward-button"
    );
    const seekBackwardButton = shadow.querySelector(
      ".media-seek-backward-button"
    );
    const currentTimeEl = shadow.querySelector(".media-time-current");
    const durationEl = shadow.querySelector(".media-time-duration");
    const liveIndicator = shadow.querySelector(".media-live-indicator");

    const seekTime = 5;

    const updateLiveStatus = () => {
      // If duration is Infinity, NaN, or 0 → consider it "live"
      if (
        !media.duration ||
        media.duration === Infinity ||
        isNaN(media.duration)
      ) {
        liveIndicator.classList.remove("hidden");
        durationEl.textContent = ""; // hide duration
      } else {
        liveIndicator.classList.add("hidden");
        durationEl.textContent = formatTime(media.duration);
      }
    };

    const updatePlay = (isPlaying) => {
      playButton.classList.toggle("hidden", isPlaying);
      pauseButton.classList.toggle("hidden", !isPlaying);
      playButtonControls.classList.toggle("hidden", isPlaying);
      pauseButtonControls.classList.toggle("hidden", !isPlaying);
    };

    const updateMute = (isMuted) => {
      muteButton.classList.toggle("hidden", isMuted);
      unmuteButton.classList.toggle("hidden", !isMuted);
      media.muted = isMuted;
      this.mediaConfig.isMuted = isMuted;
      this.saveConfig();
    };

    const formatTime = (time) => {
      const m = Math.floor(time / 60);
      const s = Math.floor(time % 60);
      return `${m}:${s.toString().padStart(2, "0")}`;
    };

    playButton.onclick = playButtonControls.onclick = () => {
      media.play();
      updatePlay(true);
    };
    pauseButton.onclick = pauseButtonControls.onclick = () => {
      media.pause();
      updatePlay(false);
    };
    muteButton.onclick = () => updateMute(true);
    unmuteButton.onclick = () => updateMute(false);
    resetButton.onclick = () => {
      media.currentTime = 0;
    };
    seekForwardButton.onclick = () => {
      media.currentTime += seekTime;
    };
    seekBackwardButton.onclick = () => {
      media.currentTime -= seekTime;
    };

    // fullscreenButton.onclick = () => {
    //   if (!document.fullscreenElement) {
    //     this.requestFullscreen().catch((err) => {
    //       console.warn("Failed to enter fullscreen:", err);
    //     });
    //   } else {
    //     document.exitFullscreen().catch((err) => {
    //       console.warn("Failed to exit fullscreen:", err);
    //     });
    //   }
    // };

    media.addEventListener("timeupdate", () => {
      currentTimeEl.textContent = formatTime(media.currentTime);
      if (media.duration && media.duration !== Infinity) {
        progressBarFill.style.width =
          (media.currentTime / media.duration) * 100 + "%";
        // Save progress
        this.mediaConfig.progress = media.currentTime;
        this.saveConfig();
      } else {
        progressBarFill.style.width = "100%";
      }
    });

    // Run initially and on metadata loaded
    media.addEventListener("loadedmetadata", () => {
      updateLiveStatus();
      // Restore saved progress
      if (this.mediaConfig.progress > 0 && media.duration) {
        media.currentTime = Math.min(this.mediaConfig.progress, media.duration);
      }
      // Apply saved mute state
      updateMute(this.mediaConfig.isMuted);
    });
    media.addEventListener("durationchange", updateLiveStatus);

    progressBar.onclick = (e) => {
      const rect = progressBar.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      media.currentTime = percent * media.duration;
    };

    // ✅ Keyboard events
    window.addEventListener("keydown", (e) => {
      if (
        document.activeElement.tagName === "INPUT" ||
        document.activeElement.tagName === "TEXTAREA"
      )
        return;

      switch (e.code) {
        case "Space": // play/pause toggle
          e.preventDefault();
          if (media.paused) {
            media.play();
            updatePlay(true);
          } else {
            media.pause();
            updatePlay(false);
          }
          break;
        case "KeyM": // mute/unmute toggle
          e.preventDefault();
          updateMute(!media.muted);
          break;
        case "ArrowRight": // seek forward
          e.preventDefault();
          media.currentTime = Math.min(
            media.currentTime + seekTime,
            media.duration
          );
          break;
        case "ArrowLeft": // seek backward
          e.preventDefault();
          media.currentTime = Math.max(media.currentTime - seekTime, 0);
          break;
        // case "KeyF": // fullscreen toggle
        //   e.preventDefault();
        //   if (!document.fullscreenElement) {
        //     this.requestFullscreen().catch((err) => {
        //       console.warn("Failed to enter fullscreen:", err);
        //     });
        //   } else {
        //     document.exitFullscreen().catch((err) => {
        //       console.warn("Failed to exit fullscreen:", err);
        //     });
        //   }
        //   break;
      }
    });
  }

  attributeChangedCallback() {
    this.applyAttributesToMedia();
  }

  applyAttributesToMedia() {
    const media = this.shadowRoot.querySelector(".media-element");
    if (!media) return;

    for (let attr of this.attributes) {
      switch (attr.name) {
        case "src":
          media.src = attr.value;
          break;
        case "muted":
          media.muted = this.hasAttribute("muted");
          break;
        case "autoplay":
          media.autoplay = this.hasAttribute("autoplay");
          break;
        case "loop":
          media.loop = this.hasAttribute("loop");
          break;
        case "controls":
          media.controls = this.hasAttribute("controls");
          break;
        case "playsinline":
          media.playsInline = this.hasAttribute("playsinline");
          break;
        case "poster":
          media.poster = attr.value;
          break;
        case "preload":
          media.preload = attr.value;
          break;
        case "crossorigin":
          media.crossOrigin = attr.value;
          break;
      }
    }
  }

  set srcObject(stream) {
    const media = this.shadowRoot.querySelector(".media-element");
    if (media) {
      media.srcObject = stream;
      media.play().catch((err) => {
        console.warn("Failed to play media:", err);
      });
    }
  }

  get srcObject() {
    const media = this.shadowRoot.querySelector(".media-element");
    return media?.srcObject || null;
  }

  play() {
    // this.shadowRoot.querySelector(".media-element")?.play();
    const shadow = this.shadowRoot;
    console.log("🚀 ~ MediaPlayer ~ play ~ shadow:", shadow);
    const media = shadow.querySelector(".media-element");
    console.log("🚀 ~ MediaPlayer ~ play ~ media:", media);

    media.play().catch((err) => {
      console.warn("Failed to play media:", err);
    });
  }
  pause() {
    // this.shadowRoot.querySelector(".media-element")?.pause();
    const shadow = this.shadowRoot;
    console.log("🚀 ~ MediaPlayer ~ pause ~ shadow:", shadow);
    const media = shadow.querySelector(".media-element");
    console.log("🚀 ~ MediaPlayer ~ pause ~ media:", media);
    media.pause();
  }
  get paused() {
    return this.shadowRoot.querySelector(".media-element")?.paused;
  }
}

customElements.define("media-player", MediaPlayer);

const video = document.querySelector(".video-player");

const playButton = document.querySelector(".video-play-button");
const pauseButton = document.querySelector(".video-pause-button");
const playButtonControls = document.querySelector(
  ".video-play-button-controls"
);
const pauseButtonControls = document.querySelector(
  ".video-pause-button-controls"
);

const muteButton = document.querySelector(".video-mute-button");
const unmuteButton = document.querySelector(".video-unmute-button");

const progressBar = document.querySelector(".video-progress-bar");
const progressBarFill = document.querySelector(".video-progress-bar-fill");

const resetButton = document.querySelector(".video-reset-button");
const seekForwardButton = document.querySelector(".video-seek-forward-button");
const seekBackwardButton = document.querySelector(
  ".video-seek-backward-button"
);

const currentTimeEl = document.querySelector(".video-time-current");
const durationEl = document.querySelector(".video-time-duration");

const seekTime = 5;

function updatePlay(isPlaying) {
  playButton.classList.toggle("hidden", isPlaying);
  pauseButton.classList.toggle("hidden", !isPlaying);
  playButtonControls.classList.toggle("hidden", isPlaying);
  pauseButtonControls.classList.toggle("hidden", !isPlaying);
}

function updateMute(isMuted) {
  muteButton.classList.toggle("hidden", isMuted);
  unmuteButton.classList.toggle("hidden", !isMuted);
  video.muted = isMuted;
}

playButton.onclick = playButtonControls.onclick = () => {
  video.play();
  updatePlay(true);
};

pauseButton.onclick = pauseButtonControls.onclick = () => {
  video.pause();
  updatePlay(false);
};

muteButton.onclick = () => updateMute(true);
unmuteButton.onclick = () => updateMute(false);

resetButton.onclick = () => {
  video.currentTime = 0;
};

seekForwardButton.onclick = () => {
  video.currentTime += seekTime;
};

seekBackwardButton.onclick = () => {
  video.currentTime -= seekTime;
};

video.addEventListener("timeupdate", () => {
  currentTimeEl.textContent = formatTime(video.currentTime);
  progressBarFill.style.width =
    (video.currentTime / video.duration) * 100 + "%";
});

video.addEventListener("loadedmetadata", () => {
  durationEl.textContent = formatTime(video.duration);
});

progressBar.onclick = (e) => {
  const rect = progressBar.getBoundingClientRect();
  const percent = (e.clientX - rect.left) / rect.width;
  video.currentTime = percent * video.duration;
};

function formatTime(time) {
  const m = Math.floor(time / 60);
  const s = Math.floor(time % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

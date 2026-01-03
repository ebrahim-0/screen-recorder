const shareBtn = document.getElementById("shareBtn");
const stopBtn = document.getElementById("stopBtn");
const video = document.getElementById("preview");
const recordingsList = document.getElementById("recordingsList");
const status = document.getElementById("status");
const placeholder = document.getElementById("placeholder");
const echoWarning = document.getElementById("echoWarning");
const systemAudioIndicator = document.getElementById("systemAudioIndicator");
const echoPrevention = document.getElementById("echoPrevention");
const closeRecordingBtn = document.getElementById("closeRecordingBtn");
// Ensure close button starts hidden
if (closeRecordingBtn) {
  closeRecordingBtn.hidden = true;
}

const recordings = []; // { id, blob, url, name }

let screenStream = null;
let micStream = null;
let mediaRecorder = null;
let recordedChunks = [];

function setSharingUI(isSharing, hasSystemAudio = false) {
  shareBtn.hidden = isSharing;
  stopBtn.hidden = !isSharing;

  if (isSharing) {
    // When starting recording, close any playing recording to avoid conflicts
    closeRecording();
    video.hidden = false;
    placeholder.hidden = true;
    closeRecordingBtn.hidden = true; // Explicitly hide close button during recording
  } else {
    video.hidden = true;
    placeholder.hidden = false;
    updateCloseButtonVisibility(); // Update close button visibility when not recording
  }

  echoWarning.hidden = !(isSharing && !hasSystemAudio); // Show echo warning only when recording without system audio
  systemAudioIndicator.hidden = !hasSystemAudio; // Show system audio indicator when system audio is captured
  echoPrevention.hidden = !(isSharing && hasSystemAudio); // Show echo prevention when recording with system audio

  status.classList.toggle("recording", isSharing);
  status.querySelector("span:last-child").textContent = isSharing
    ? `Recording${hasSystemAudio ? " + System Audio" : ""}…`
    : "Not Recording";
}

async function startSharing() {
  try {
    // 1️⃣ Screen with System Audio
    screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        frameRate: 60,
        width: 1920,
        height: 1080,
        cursor: "always",
      },
      audio: {
        // Explicitly request system audio capture
        echoCancellation: false, // Don't apply echo cancellation to system audio
        noiseSuppression: false, // Don't suppress noise in system audio
        autoGainControl: false, // Don't auto-adjust system audio levels
        sampleRate: 48000,
        channelCount: 2,
      },
    });

    // Check if system audio was captured
    const hasSystemAudio = screenStream.getAudioTracks().length > 0;
    console.log(
      `System audio ${
        hasSystemAudio
          ? "captured successfully"
          : "not captured - user may have declined or browser doesn't support it"
      }`
    );

    if (!hasSystemAudio) {
      console.info("💡 System audio tips:");
      console.info(
        '1. Make sure you select "Share audio" or "Share system audio" in the screen sharing dialog'
      );
      console.info(
        '2. Some browsers require you to choose "Entire Screen" instead of "Application Window"'
      );
      console.info(
        "3. System audio is supported in Chrome 74+, Firefox 66+, Safari 13+"
      );
    }

    setSharingUI(true, hasSystemAudio);

    // 2️⃣ Microphone with enhanced echo cancellation
    // Note: Echo occurs when mic picks up audio from speakers
    // Solutions: Use headphones, reduce speaker volume, or use echo cancellation
    micStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true, // Enable AGC to help with volume levels
        sampleRate: 48000,
        channelCount: 2,
        latency: 0.01, // Lower latency for better echo cancellation
        volume: 0.8, // Reduce mic volume to prevent feedback
      },
    });

    // 3️⃣ Advanced audio mixing with aggressive echo prevention
    const audioContext = new AudioContext({
      sampleRate: 48000,
      latencyHint: "playback", // Changed to playback for better echo handling
    });
    const destination = audioContext.createMediaStreamDestination();

    // Create advanced audio processing chain
    const screenGain = audioContext.createGain();
    const micGain = audioContext.createGain();
    const micHighPass = audioContext.createBiquadFilter(); // High-pass filter to reduce low-frequency noise
    const micNotch = audioContext.createBiquadFilter(); // Notch filter to target echo frequencies
    const outputCompressor = audioContext.createDynamicsCompressor(); // Compress to prevent clipping

    // Configure high-pass filter to reduce low-frequency noise that can cause echo
    micHighPass.type = "highpass";
    micHighPass.frequency.value = 80; // Cut off frequencies below 80Hz
    micHighPass.Q.value = 0.7;

    // Configure notch filter to target common echo frequencies (around 1-2kHz)
    micNotch.type = "notch";
    micNotch.frequency.value = 1500; // Target mid-range frequencies where echo often occurs
    micNotch.Q.value = 5; // Narrow notch for precise filtering

    // Configure compressor to prevent audio clipping and feedback
    outputCompressor.threshold.value = -24;
    outputCompressor.knee.value = 30;
    outputCompressor.ratio.value = 12;
    outputCompressor.attack.value = 0.003;
    outputCompressor.release.value = 0.25;

    if (hasSystemAudio) {
      // Aggressive echo prevention when system audio is present
      screenGain.gain.value = 0.8; // System audio at normal level
      micGain.gain.value = 0.15; // Very low mic level to prevent feedback

      // Add dynamic ducking - further reduce mic when system audio is loud
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      const screenSourceForAnalysis =
        audioContext.createMediaStreamSource(screenStream);
      screenSourceForAnalysis.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const checkAudioLevels = () => {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;

        // If system audio is loud (> 150), reduce mic further
        if (average > 150) {
          micGain.gain.setTargetAtTime(0.08, audioContext.currentTime, 0.1);
        } else if (average > 100) {
          micGain.gain.setTargetAtTime(0.12, audioContext.currentTime, 0.1);
        } else {
          micGain.gain.setTargetAtTime(0.15, audioContext.currentTime, 0.1);
        }

        if (!mediaRecorder || mediaRecorder.state === "inactive") return;
        requestAnimationFrame(checkAudioLevels);
      };

      checkAudioLevels();
      console.log(
        "🎵 System audio + microphone (aggressive echo prevention + dynamic ducking)"
      );
      console.warn(
        "🛡️ Echo Prevention Active: Microphone volume reduced to prevent feedback. Use headphones for best results."
      );

      // Add delay to mic to help with echo cancellation timing
      const micDelay = audioContext.createDelay(0.05); // 50ms delay
      micDelay.delayTime.value = 0.03; // 30ms delay for echo prevention

      // Chain: mic source -> highpass -> notch -> delay -> gain -> compressor -> destination
      const micSource = audioContext.createMediaStreamSource(micStream);
      micSource.connect(micHighPass);
      micHighPass.connect(micNotch);
      micNotch.connect(micDelay);
      micDelay.connect(micGain);
      micGain.connect(outputCompressor);

      // Chain: screen source -> gain -> compressor -> destination
      const screenSourceForMixing =
        audioContext.createMediaStreamSource(screenStream);
      screenSourceForMixing.connect(screenGain);
      screenGain.connect(outputCompressor);

      outputCompressor.connect(destination);
    } else {
      // Only microphone audio - no echo concerns
      screenGain.gain.value = 0; // No system audio
      micGain.gain.value = 0.9; // Full microphone volume

      // Simplified chain for mic only (still with filters for quality)
      const micSource = audioContext.createMediaStreamSource(micStream);
      micSource.connect(micHighPass);
      micHighPass.connect(micNotch);
      micNotch.connect(micGain);
      micGain.connect(outputCompressor);
      outputCompressor.connect(destination);

      console.log("🎤 Microphone only (no echo prevention needed)");
    }

    // 4️⃣ Final stream
    const combinedStream = new MediaStream([
      ...screenStream.getVideoTracks(),
      ...destination.stream.getAudioTracks(),
    ]);

    // 5️⃣ Preview with echo prevention
    video.srcObject = combinedStream;
    video.autoplay = true;
    video.muted = true; // Keep preview muted to prevent additional echo

    // 6️⃣ Recorder (HIGH QUALITY)
    recordedChunks = [];
    mediaRecorder = new MediaRecorder(combinedStream, {
      mimeType: "video/webm;codecs=vp9,opus",
      videoBitsPerSecond: 8_000_000,
      audioBitsPerSecond: 320_000,
    });

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size) recordedChunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      downloadRecording();
    };

    mediaRecorder.start();

    // 🎚️ Monitor audio levels for echo detection (development)
    if (screenStream.getAudioTracks().length) {
      monitorAudioLevels(screenStream, "Screen");
    }
    monitorAudioLevels(micStream, "Microphone");

    // Browser stop sharing
    screenStream.getVideoTracks()[0].onended = stopSharing;
  } catch (err) {
    console.warn("Sharing canceled");
    setSharingUI(false);
  }
}

function stopSharing() {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
  }

  screenStream?.getTracks().forEach((t) => t.stop());
  micStream?.getTracks().forEach((t) => t.stop());

  video.srcObject = null;

  screenStream = null;
  micStream = null;
  mediaRecorder = null;

  setSharingUI(false);
}

// 🎚️ Audio monitoring for echo detection (development helper)
function monitorAudioLevels(stream, label) {
  if (!stream) return;

  const audioContext = new AudioContext();
  const analyser = audioContext.createAnalyser();
  const microphone = audioContext.createMediaStreamSource(stream);
  const dataArray = new Uint8Array(analyser.frequencyBinCount);

  analyser.fftSize = 256;
  microphone.connect(analyser);

  const checkLevels = () => {
    analyser.getByteFrequencyData(dataArray);
    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;

    // High average levels might indicate echo or feedback
    if (average > 100) {
      console.warn(
        `${label} audio level high (${average.toFixed(1)}) - possible echo`
      );
    }

    if (!mediaRecorder || mediaRecorder.state === "inactive") {
      return; // Stop monitoring when recording stops
    }

    requestAnimationFrame(checkLevels);
  };

  checkLevels();
}

// 🔊 Check system audio support
function checkSystemAudioSupport() {
  // System audio capture is supported in:
  // - Chrome/Edge 74+
  // - Firefox 66+
  // - Safari 13+ (limited support)

  if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
    console.warn("Screen sharing not supported");
    return false;
  }

  // Test if audio constraint is supported
  return navigator.mediaDevices.getSupportedConstraints().audio;
}

// 📥 Create recording function
function downloadRecording() {
  if (!recordedChunks.length) return;

  const blob = new Blob(recordedChunks, { type: "video/webm" });
  const url = URL.createObjectURL(blob);
  const timestamp = new Date().toLocaleString();

  const recording = {
    id: Date.now(),
    blob,
    url,
    name: `Recording ${recordings.length + 1}`,
    timestamp,
    duration: recordedChunks.length, // rough indicator of duration
  };

  recordings.push(recording);
  addRecordingToSidebar(recording);

  recordedChunks = [];
}

// 📥 Download specific recording
function downloadSpecificRecording(recording) {
  const a = document.createElement("a");
  a.href = recording.url;
  a.download = `${recording.name}.webm`;
  a.click();
}

function addRecordingToSidebar(recording) {
  const li = document.createElement("li");
  li.className = "recording-item";
  li.dataset.id = recording.id;

  li.innerHTML = `
    <div class="recording-info" onclick="previewRecordingById(${recording.id})">
      <div class="recording-name">${recording.name}</div>
      <div class="recording-meta">${recording.timestamp}</div>
    </div>
    <button class="download-btn" onclick="downloadSpecificRecordingById(${recording.id})" title="Download recording">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7,10 12,15 17,10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
    </button>
  `;

  recordingsList.prepend(li);
}

function previewRecordingById(id) {
  const recording = recordings.find((r) => r.id === id);
  const listItem = document.querySelector(`[data-id="${id}"]`);

  // Check if this recording is already active
  if (listItem && listItem.classList.contains("active")) {
    // If already active, don't do anything (don't reopen)
    return;
  }

  if (recording && listItem) {
    previewRecording(recording, listItem);
  }
}

function downloadSpecificRecordingById(id) {
  const recording = recordings.find((r) => r.id === id);
  if (recording) {
    downloadSpecificRecording(recording);
  }
}

function previewRecording(recording, listItem) {
  // Remove active class
  document
    .querySelectorAll(".sidebar li")
    .forEach((li) => li.classList.remove("active"));

  if (listItem) {
    listItem.classList.add("active");
  }

  placeholder.hidden = true;
  video.hidden = false;
  updateCloseButtonVisibility(); // Show close button when recording is active
  video.srcObject = null;
  video.src = recording.url;
  video.muted = false;
  video.play();
}

function closeRecording() {
  // Remove active class from all recordings
  document
    .querySelectorAll(".sidebar li")
    .forEach((li) => li.classList.remove("active"));

  // Hide video and show placeholder
  video.hidden = true;
  video.pause();
  video.src = "";
  placeholder.hidden = false;
  updateCloseButtonVisibility(); // Hide close button when no recording is active
}

// Helper function to check if any recording is currently active
function hasActiveRecording() {
  return document.querySelector(".sidebar li.active") !== null;
}

// Update close button visibility based on active recording state
function updateCloseButtonVisibility() {
  const hasActive = hasActiveRecording();
  closeRecordingBtn.hidden = !hasActive;
}

shareBtn.onclick = startSharing;
stopBtn.onclick = stopSharing;
closeRecordingBtn.onclick = closeRecording;

// Initial state
setSharingUI(false);
updateCloseButtonVisibility(); // Ensure close button is hidden initially

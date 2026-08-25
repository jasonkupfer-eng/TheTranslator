// Lightweight 8-Bit Audio Synthesizer
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  const now = audioCtx.currentTime;

  if (type === 'blip') { // Button push
    osc.type = 'square';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
    osc.start(now);
    osc.stop(now + 0.08);
  } else if (type === 'laser') { // Execute
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.2);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    osc.start(now);
    osc.stop(now + 0.2);
  }
}

// UI Event Listeners
const formatBtns = document.querySelectorAll('.format-btn');
formatBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    playSound('blip');
    formatBtns.forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
  });
});

let timeOffset = 0.0;
const timeDisplay = document.getElementById('timeOffsetDisplay');

document.getElementById('increaseTime').addEventListener('click', () => {
  playSound('blip');
  timeOffset += 0.5;
  timeDisplay.innerText = `+${timeOffset.toFixed(1)}`;
});

document.getElementById('decreaseTime').addEventListener('click', () => {
  playSound('blip');
  timeOffset -= 0.5;
  timeDisplay.innerText = timeOffset > 0 ? `+${timeOffset.toFixed(1)}` : timeOffset.toFixed(1);
});

// File Drop & QC Scanner Logic
const fileInput = document.getElementById('fileInput');
const dropZone = document.getElementById('dropZone');
const qcReport = document.getElementById('qcReport');
let currentFileContent = "";

fileInput.addEventListener('change', handleFile);

function handleFile(e) {
  const file = e.target.files[0];
  if (!file) return;
  playSound('blip');
  
  const reader = new FileReader();
  reader.onload = (event) => {
    currentFileContent = event.target.result;
    runQCScan(currentFileContent, file.name);
  };
  reader.readAsText(file);
}

function runQCScan(text, filename) {
  dropZone.classList.add('hidden');
  qcReport.classList.remove('hidden');
  
  // Basic diagnostic logic (to be expanded for specific formats)
  const lines = text.split('\n');
  let errors = 0;
  
  lines.forEach(line => {
    if (line.length > 42 && !line.includes('-->')) { // Checking CPL on text lines
      errors++;
    }
  });

  qcReport.innerHTML = `
    <h3>[ FILE MOUNTED: ${filename} ]</h3>
    <p>FORMAT DETECTED: AUTO</p>
    <br>
    <h4>DIAGNOSTIC REPORT:</h4>
    <p style="color: ${errors > 0 ? 'var(--neon-red)' : 'var(--neon-green)'}">
      > CPL/CPS VIOLATIONS DETECTED: ${errors}
    </p>
    <p>> READY FOR RECALIBRATION...</p>
  `;
  
  document.getElementById('executeBtn').classList.remove('disabled');
}

document.getElementById('executeBtn').addEventListener('click', () => {
    playSound('laser');
    // Conversion script injection point goes here
});
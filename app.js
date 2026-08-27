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

document.addEventListener("DOMContentLoaded", () => {
    const cosmosCanvas = document.getElementById('cosmosCanvas');
    if (!cosmosCanvas) return;
    
    const ctx = cosmosCanvas.getContext('2d');
    let frame = 0;
    
    // Sync canvas to the wrapper size
    function syncCosmos() {
        const wrapper = document.querySelector('.arcade-wrapper');
        if (wrapper && (cosmosCanvas.width !== wrapper.clientWidth || cosmosCanvas.height !== wrapper.clientHeight)) {
            cosmosCanvas.width = wrapper.clientWidth;
            cosmosCanvas.height = wrapper.clientHeight;
        }
    }
    window.addEventListener('resize', syncCosmos);
    syncCosmos();

    // 1. Generate Stars
    const stars = [];
    for (let i = 0; i < 60; i++) {
        stars.push({
            x: Math.random(), y: Math.random(),
            size: Math.random() * 2 + 1,
            twinkle: Math.random() * Math.PI * 2,
            speed: 0.02 + Math.random() * 0.03
        });
    }

    let activeUfo = null;
    let planets = [];

    function drawCosmos() {
        requestAnimationFrame(drawCosmos);
        frame++;
        ctx.clearRect(0, 0, cosmosCanvas.width, cosmosCanvas.height);
        
        let cw = cosmosCanvas.width;
        let ch = cosmosCanvas.height;

        // Draw Twinkling Stars
        stars.forEach(star => {
            star.twinkle += star.speed; 
            let alpha = 0.1 + Math.abs(Math.sin(star.twinkle)) * 0.9;
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.fillRect(star.x * cw, star.y * ch, star.size, star.size);
        });

        // Spawn & Draw Planets (from Trophies page logic)
        if (Math.random() < 0.005) {
            planets.push({ 
                x: Math.random() * cw, y: -50, 
                vx: (Math.random() - 0.5), vy: 1 + Math.random() * 2, 
                radius: 15 + Math.random() * 25, 
                color: Math.random() > 0.5 ? '#ff007f' : '#ffea00', 
                type: Math.floor(Math.random() * 3) 
            });
        }

        for (let i = planets.length - 1; i >= 0; i--) {
            let p = planets[i]; 
            p.x += p.vx; p.y += p.vy; 
            ctx.fillStyle = p.color;
            
            if (p.type === 0) {
                ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI*2); ctx.fill();
                ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(p.x - p.radius/2, p.y - p.radius/2, p.radius, p.radius/2);
            } else if (p.type === 1) {
                ctx.beginPath(); ctx.arc(p.x, p.y, p.radius * 0.8, 0, Math.PI*2); ctx.fill();
                ctx.strokeStyle = '#39ff14'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(p.x, p.y, p.radius * 1.4, p.radius * 0.3, Math.PI/8, 0, Math.PI*2); ctx.stroke();
            } else {
                ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI*2); ctx.fill();
                ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(p.x - p.radius*0.4, p.y - p.radius*0.4, p.radius*0.2, p.radius*0.2);
            }

            if (p.y > ch + 100) planets.splice(i, 1);
        }

        // Spawn & Draw UFO (from Battle Canvas logic)
        if (!activeUfo && Math.random() < 0.003) {
            activeUfo = { x: -50, y: ch * 0.1 + Math.random() * (ch * 0.3), speed: 3 + Math.random() * 3 };
        }

        if (activeUfo) {
            activeUfo.x += activeUfo.speed; 
            let ufoY = activeUfo.y + Math.sin(frame * 0.05) * 15;
            
            ctx.save(); ctx.translate(activeUfo.x, ufoY);
            ctx.fillStyle = 'rgba(0, 240, 255, 0.5)'; ctx.beginPath(); ctx.arc(0, -3, 10, Math.PI, 0); ctx.fill();
            ctx.fillStyle = '#95a5a6'; ctx.beginPath(); ctx.ellipse(0, 0, 22, 6, 0, 0, Math.PI * 2); ctx.fill();
            
            if (frame % 20 < 10) { 
                ctx.fillStyle = '#ff007f'; ctx.fillRect(-14, -1, 3, 3); 
                ctx.fillStyle = '#39ff14'; ctx.fillRect(11, -1, 3, 3); 
            }
            ctx.restore();
            
            if (activeUfo.x > cw + 60) activeUfo = null;
        }
    }
    
    drawCosmos();
});
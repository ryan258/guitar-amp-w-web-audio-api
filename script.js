// Select all the elements
const volume = document.getElementById("volume");
const bass = document.getElementById("bass");
const mid = document.getElementById("mid");
const treble = document.getElementById("treble");
const visualizer = document.getElementById("visualizer");

// Create audio context to control everything about our audio
const context = new AudioContext();
// fftSize = how many different frequencies you want to control
const analyserNode = new AnalyserNode(context, { fftSize: 256 });
// Change the volume
const gainNode = new GainNode(context, { gain: volume.value });
// Change the bass
const bassEQ = new BiquadFilterNode(context, {
  type: "lowshelf",
  frequency: 500,
  gain: bass.value,
});
// Change mids
const midEQ = new BiquadFilterNode(context, {
  type: "peaking",
  Q: Math.SQRT1_2,
  frequency: 1500,
  gain: mid.value,
});
// Change treble
const trebleEQ = new BiquadFilterNode(context, {
  type: "highshelf",
  Q: Math.SQRT1_2,
  frequency: 3000,
  gain: treble.value,
});

setupEventListeners();
// connect audio source/input with our AudioContext
setupContext();
resize();
drawVisualizer();

// set up an event handler for resizing the screen
function setupEventListeners() {
  window.addEventListener("resize", resize);

  volume.addEventListener("input", (e) => {
    const value = parseFloat(e.target.value);
    // Remove clicking sounds
    gainNode.gain.setTargetAtTime(value, context.currentTime, 0.01);
  });

  bass.addEventListener("input", (e) => {
    const value = parseInt(e.target.value);
    // Remove clicking sounds
    bassEQ.gain.setTargetAtTime(value, context.currentTime, 0.01);
  });

  mid.addEventListener("input", (e) => {
    const value = parseInt(e.target.value);
    // Remove clicking sounds
    midEQ.gain.setTargetAtTime(value, context.currentTime, 0.01);
  });

  treble.addEventListener("input", (e) => {
    const value = parseInt(e.target.value);
    // Remove clicking sounds
    trebleEQ.gain.setTargetAtTime(value, context.currentTime, 0.01);
  });
}

// where we integrate our guitar
async function setupContext() {
  const guitar = await getGuitar();
  if (context.state === "suspended") {
    await context.resume();
  }
  const source = context.createMediaStreamSource(guitar);
  // connect source with it's destination
  source
    .connect(bassEQ)
    .connect(midEQ)
    .connect(trebleEQ)
    .connect(gainNode)
    .connect(analyserNode)
    .connect(context.destination);
}

// get our audio source (setting to purest form to avoid browsers trying to clean up sound for us)
function getGuitar() {
  // returns a promise
  return navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: false,
      autoGainControl: false,
      noiseSuppression: false,
      latency: 0,
    },
  });
}

function drawVisualizer() {
  // loops at ~60fps
  requestAnimationFrame(drawVisualizer);

  // get frequencies out of AudioContext
  const bufferLength = analyserNode.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  analyserNode.getByteFrequencyData(dataArray);
  const width = visualizer.width;
  const height = visualizer.height;
  const barWidth = width / bufferLength;

  const canvasContext = visualizer.getContext("2d");
  canvasContext.clearRect(0, 0, width, height);

  dataArray.forEach((item, index) => {
    const y = ((item / 256) * height) / 2;
    // const y = (item / 256) * height;
    const x = barWidth * index;

    canvasContext.fillStyle = `hsl(${(y / height) * 2 * 200}, 100%, 50%)`;
    // canvasContext.fillStyle = `hsl(${(y / height) * 200}, 100%, 50%)`;
    canvasContext.fillRect(x, height - y, barWidth, y);
  });
}

// smooth out the jaggedness
function resize() {
  visualizer.width = visualizer.clientWidth * window.devicePixelRatio;
  visualizer.height = visualizer.clientHeight * window.devicePixelRatio;
}

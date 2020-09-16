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

// connect audio source/input with our AudioContext
setupContext();
resize();
drawVisualizer();

// where we integrate our guitar
async function setupContext() {
  const guitar = await getGuitar();
  if (context.state === "suspended") {
    await context.resume();
  }
  const source = context.createMediaStreamSource(guitar);
  // connect source with it's destination
  source.connect(analyserNode).connect(context.destination);
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

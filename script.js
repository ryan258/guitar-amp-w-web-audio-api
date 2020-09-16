// Select all the elements
const volume = document.getElementById("volume");
const bass = document.getElementById("bass");
const mid = document.getElementById("mid");
const treble = document.getElementById("treble");
const visualizer = document.getElementById("visualizer");

// Create audio context to control everything about our audio
const context = new AudioContext();
// connect audio source/input with our AudioContext
setupContext();

// where we integrate our guitar
async function setupContext() {
  const guitar = await getGuitar();
  if (context.state === "suspended") {
    await context.resume();
  }
  const source = context.createMediaStreamSource(guitar);
  // connect source with it's destination
  source.connect(context.destination);
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

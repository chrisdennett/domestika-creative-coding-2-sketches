const canvasSketch = require("canvas-sketch");
const math = require("canvas-sketch-util/math");

const settings = {
  dimensions: [1080, 1080],
  animate: true,
};

let audio;
let audioCtx, audioData, srcNode, analyserNode;
let manager;

const sketch = () => {
  const bins = [4, 12, 37]; // randomly picked

  return ({ context: ctx, width, height }) => {
    ctx.fillStyle = "#EEEAE0";
    ctx.strokeStyle = "rgba(30, 0,0,0.5)";
    ctx.fillRect(0, 0, width, height);

    if (!analyserNode) return;
    analyserNode.getFloatFrequencyData(audioData);

    for (let i = 0; i < bins.length; i++) {
      const bin = bins[i];
      const mapped = math.mapRange(
        audioData[bin],
        analyserNode.minDecibels,
        analyserNode.maxDecibels,
        0,
        1,
        true
      );

      const radius = mapped * 300;

      ctx.save();
      ctx.translate(width * 0.5, height * 0.5);
      ctx.lineWidth = 10;

      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, 2 * Math.PI);
      ctx.stroke();

      ctx.restore();
    }
  };
};

const addListeners = () => {
  window.addEventListener("mouseup", () => {
    if (!audioCtx) {
      createAudio();
    }
    if (audio.paused) {
      audio.play();
      manager.play();
    } else {
      audio.pause();
      manager.pause();
    }
  });
};

const createAudio = () => {
  audio = document.createElement("audio");
  audio.src = "audio/Jane & The Boy - Waste Our Time.mp3";

  audioCtx = new AudioContext();

  srcNode = audioCtx.createMediaElementSource(audio);
  srcNode.connect(audioCtx.destination);

  analyserNode = audioCtx.createAnalyser();
  analyserNode.fftSize = 512; // needs to be a power of 2
  analyserNode.smoothingTimeConstant = 0.9; // makes circles less jumpy
  srcNode.connect(analyserNode);

  audioData = new Float32Array(analyserNode.frequencyBinCount);
};
const getAverage = (data) => {
  let sum = 0;

  for (let i of data) {
    sum += i;
  }

  return sum / data.length;
};

const start = async () => {
  addListeners();
  manager = await canvasSketch(sketch, settings);
  manager.pause();
};

start();

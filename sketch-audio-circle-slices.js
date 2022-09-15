const canvasSketch = require("canvas-sketch");
const math = require("canvas-sketch-util/math");
const random = require("canvas-sketch-util/random");
const eases = require("eases");

const settings = {
  dimensions: [1080, 1080],
  animate: true,
};

let audio;
let audioCtx, audioData, srcNode, analyserNode;
let manager;
let minDb, maxDb;

const sketch = () => {
  const numCircles = 5;
  const numSlices = 9;
  const slice = (Math.PI * 2) / numSlices;
  const radius = 200;

  const bins = []; // randomly picked
  const lineWidths = [];

  let lineWidth, bin, mapped;
  const maxLineWidth = 200;
  const minLineWidth = 20;

  for (let i = 0; i < numCircles * numSlices; i++) {
    bin = random.rangeFloor(4, 64);
    if (random.value() > 0.5) {
      bin = 0;
    }
    bins.push(bin);
  }

  for (let i = 0; i < numCircles; i++) {
    const t = i / (numCircles - 1);
    lineWidth = eases.quadIn(t) * maxLineWidth + minLineWidth;
    lineWidths.push(lineWidth);
  }

  return ({ context: ctx, width, height }) => {
    ctx.fillStyle = "#EEEAE0";
    ctx.fillRect(0, 0, width, height);

    if (!audioCtx) return;
    analyserNode.getFloatFrequencyData(audioData);

    ctx.save();
    ctx.translate(width * 0.5, height * 0.5);

    let circleRadius = radius;

    for (let i = 0; i < numCircles; i++) {
      ctx.save();

      for (let j = 0; j < numSlices; j++) {
        ctx.rotate(slice);
        ctx.lineWidth = lineWidths[i];

        const index = i * numSlices + j;
        bin = bins[index];
        if (bin === 0) {
          continue;
        }

        mapped = math.mapRange(audioData[bin], minDb, maxDb, 0, 1, true);

        lineWidth = lineWidths[i] * mapped;
        if (lineWidth < 1) continue;

        ctx.lineWidth = lineWidth;

        ctx.beginPath();
        ctx.arc(0, 0, circleRadius + ctx.lineWidth / 2, 0, slice);
        ctx.stroke();
      }

      circleRadius += lineWidths[i];
      ctx.restore();
    }

    ctx.restore();
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

  minDb = analyserNode.minDecibels;
  maxDb = analyserNode.maxDecibels;

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

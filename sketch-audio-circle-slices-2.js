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
  const numSlices = 1;
  const slice = (Math.PI * 2) / numSlices;
  const radius = 200;

  const bins = []; // randomly picked
  const lineWidths = [];
  const rotationOffsets = [];

  let lineWidth, bin, mapped, angle;

  for (let i = 0; i < numCircles * numSlices; i++) {
    bin = random.rangeFloor(4, 64);
    bins.push(bin);
  }

  const maxLineWidth = 200;
  const minLineWidth = 10;
  for (let i = 0; i < numCircles; i++) {
    const t = i / (numCircles - 1);
    lineWidth = eases.quadIn(t) * maxLineWidth + minLineWidth;
    lineWidths.push(lineWidth);
  }

  for (let i = 0; i < numCircles; i++) {
    // random between -45deg and 45deg
    const startFrom = Math.PI * 0.5;
    const rotation = random.range(Math.PI * -0.25, Math.PI * 0.25) - startFrom;
    rotationOffsets.push(rotation);
  }

  return ({ context: ctx, width, height }) => {
    ctx.fillStyle = "#EEEAE0";
    ctx.fillRect(0, 0, width, height);

    if (!audioCtx) return;
    analyserNode.getFloatFrequencyData(audioData);

    ctx.save();
    ctx.translate(width * 0.5, height * 0.5);
    ctx.scale(1, -1); // flip on y axis

    let circleRadius = radius;
    let lineWidth, halfLineWidth;

    for (let i = 0; i < numCircles; i++) {
      ctx.save();
      ctx.rotate(rotationOffsets[i]);

      lineWidth = lineWidths[i];
      halfLineWidth = lineWidth * 0.5;

      circleRadius += halfLineWidth + 2; // because line drawn at width center

      for (let j = 0; j < numSlices; j++) {
        ctx.rotate(slice);
        ctx.lineWidth = lineWidth;

        const index = i * numSlices + j;
        bin = bins[index];

        mapped = math.mapRange(audioData[bin], minDb, maxDb, 0, 1, true);

        angle = slice * mapped;

        ctx.beginPath();
        ctx.arc(0, 0, circleRadius, 0, angle);
        ctx.stroke();
      }

      circleRadius += halfLineWidth;
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

const start = async () => {
  addListeners();
  manager = await canvasSketch(sketch, settings);
  manager.pause();
};

start();

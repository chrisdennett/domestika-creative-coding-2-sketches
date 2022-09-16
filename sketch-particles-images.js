const canvasSketch = require("canvas-sketch");
const random = require("canvas-sketch-util/random");
const math = require("canvas-sketch-util/math");
const eases = require("eases");

const settings = {
  dimensions: [1080, 1080],
  animate: true,
};

const particles = [];
const mousePos = { x: 9999, y: 9999 };
let elCanvas;
let imgA;

const sketch = ({ width, height, canvas }) => {
  let x, y, radius;
  const imgACanvas = document.createElement("canvas");
  const imgACtx = imgACanvas.getContext("2d");

  imgACanvas.width = imgA.width;
  imgACanvas.height = imgA.height;

  imgACtx.drawImage(imgA, 0, 0);

  const imgAData = imgACtx.getImageData(0, 0, imgA.width, imgA.height).data;

  const numCircles = 30;
  const gapBtnCircles = 1;
  const gapBtnDots = 1;
  let dotRadius = 8;
  let cirRadius = 0;
  const fitRadius = dotRadius;
  const fitDiameter = fitRadius * 2 + gapBtnDots;

  elCanvas = canvas;
  canvas.addEventListener("mousedown", onMouseDown);

  for (let i = 0; i < numCircles; i++) {
    const circumference = Math.PI * 2 * cirRadius;
    const dotsPerCircle = i > 0 ? Math.floor(circumference / fitDiameter) : 1;
    let ix, iy, index, r, g, b, colA;

    const angleInc = (Math.PI * 2) / dotsPerCircle;

    for (let j = 0; j < dotsPerCircle; j++) {
      const angle = angleInc * j;

      x = Math.cos(angle) * cirRadius;
      y = Math.sin(angle) * cirRadius;

      x += width * 0.5;
      y += height * 0.5;

      ix = Math.floor((x / width) * imgA.width);
      iy = Math.floor((y / height) * imgA.height);
      index = (iy * imgA.width + ix) * 4;

      r = imgAData[index + 0];
      g = imgAData[index + 1];
      b = imgAData[index + 2];
      colA = `rgb(${r},${g},${b})`;

      // radius = dotRadius;
      radius = math.mapRange(r, 0, 255, 1, dotRadius);

      particles.push(new Particle({ x, y, radius, colA }));
    }

    cirRadius += fitRadius * 2 + gapBtnCircles;
    dotRadius = (1 - eases.quadOut(i / numCircles)) * fitRadius;
  }

  return ({ context: ctx, width, height }) => {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, width, height);

    ctx.drawImage(imgACanvas, 0, 0);

    for (const p of particles) {
      p.update();
      p.draw(ctx);
    }
  };
};

const loadImage = async (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject();
    img.src = url;
  });
};

const onMouseDown = (e) => {
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);

  onMouseMove(e);
};

const onMouseMove = (e) => {
  const x = (e.offsetX / elCanvas.offsetWidth) * elCanvas.width;
  const y = (e.offsetY / elCanvas.offsetHeight) * elCanvas.height;

  mousePos.x = x;
  mousePos.y = y;
};

const onMouseUp = () => {
  window.removeEventListener("mousemove", onMouseMove);
  window.removeEventListener("mouseup", onMouseUp);

  mousePos.x = 9999;
  mousePos.y = 9999;
};

class Particle {
  constructor({ x, y, radius = 10, colA }) {
    // position
    this.x = x;
    this.y = y;

    // initial position
    this.ix = x;
    this.iy = y;

    // acceleration
    this.ax = 0;
    this.ay = 0;

    // velocity
    this.vx = 0;
    this.vy = 0;

    this.radius = radius;
    this.scale = 1;
    this.color = colA;

    const useUniformValues = false;

    this.minDist = useUniformValues ? 100 : random.range(100, 200);
    this.pushFactor = useUniformValues ? 0.02 : random.range(0.01, 0.09);
    this.pullFactor = useUniformValues ? 0.004 : random.range(0.002, 0.009);
    this.dampFactor = useUniformValues ? 0.95 : random.range(0.9, 0.95);
  }

  update() {
    let dx, dy, dd, distDelta;

    // pull force (pulls back to orig pos)
    dx = this.ix - this.x;
    dy = this.iy - this.y;

    this.ax = dx * this.pullFactor;
    this.ay = dy * this.pullFactor;

    // push force
    dx = this.x - mousePos.x; // x dist to cursor
    dy = this.y - mousePos.y; // y dist to cursor
    dd = Math.sqrt(dx * dx + dy * dy); // diagonal dist to cursor

    distDelta = this.minDist - dd; //

    if (dd < this.minDist) {
      this.ax += (dx / dd) * distDelta * this.pushFactor;
      this.ay += (dy / dd) * distDelta * this.pushFactor;
    }

    this.vx += this.ax;
    this.vy += this.ay;

    this.vx *= this.dampFactor;
    this.vy *= this.dampFactor;

    this.x += this.vx;
    this.y += this.vy;
  }

  draw(ctx) {
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.translate(this.x, this.y);
    ctx.arc(0, 0, this.radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
  }
}

// KICK THINGS OFF
const start = async () => {
  imgA = await loadImage("img/douglas-adams_64x64.jpg");
  canvasSketch(sketch, settings);
};

start();

const canvasSketch = require("canvas-sketch");

const settings = {
  dimensions: [1080, 1080],
  animate: true,
};

const particles = [];
const mousePos = { x: 9999, y: 9999 };
let elCanvas;

const sketch = ({ width, height, canvas }) => {
  let x, y;
  elCanvas = canvas;
  canvas.addEventListener("mousedown", onMouseDown);

  for (let i = 0; i < 1; i++) {
    x = width * 0.5;
    y = height * 0.5;
    particles.push(new Particle({ x, y }));
  }

  return ({ context: ctx, width, height }) => {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, width, height);

    for (const p of particles) {
      p.update();
      p.draw(ctx);
    }
  };
};

canvasSketch(sketch, settings);

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
  constructor({ x, y, radius = 10 }) {
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

    this.minDist = 100;
    this.pushFactor = 0.02;
    this.pullFactor = 0.004;
    this.dampFactor = 0.95;
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
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.translate(this.x, this.y);
    ctx.arc(0, 0, this.radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
  }
}

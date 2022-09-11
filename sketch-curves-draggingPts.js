const canvasSketch = require("canvas-sketch");

const settings = {
  dimensions: [1080, 1080],
  animate: true,
};

let elCanvas;
let points;

const sketch = ({ canvas }) => {
  elCanvas = canvas;

  points = [
    new Point({ x: 200, y: 540 }),
    new Point({ x: 400, y: 300, isControl: true }),
    new Point({ x: 880, y: 540 }),
  ];

  canvas.addEventListener("mousedown", onMouseDown);

  return ({ context: ctx, width, height }) => {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, width, height);
    ctx.lineWidth = 10;

    const [pt1, pt2, pt3] = points;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(pt1.x, pt1.y);
    ctx.quadraticCurveTo(pt2.x, pt2.y, pt3.x, pt3.y);
    ctx.stroke();
    ctx.restore();

    for (let pt of points) {
      pt.draw(ctx);
    }
  };
};

const onMouseDown = (e) => {
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);

  const x = (e.offsetX / elCanvas.offsetWidth) * elCanvas.width;
  const y = (e.offsetY / elCanvas.offsetHeight) * elCanvas.height;

  points.forEach((pt) => {
    pt.isDragging = pt.hitTest(x, y);
  });
};

const onMouseMove = (e) => {
  const x = (e.offsetX / elCanvas.offsetWidth) * elCanvas.width;
  const y = (e.offsetY / elCanvas.offsetHeight) * elCanvas.height;

  points.forEach((pt) => {
    if (pt.isDragging && e.toElement == elCanvas) {
      pt.x = x;
      pt.y = y;
    }
  });
};

const onMouseUp = () => {
  window.removeEventListener("mousemove", onMouseMove);
  window.removeEventListener("mouseup", onMouseUp);

  points.forEach((pt) => {
    pt.isDragging = false;
  });
};

canvasSketch(sketch, settings);

class Point {
  constructor({ x, y, isControl = false }) {
    this.x = x;
    this.y = y;
    this.isControl = isControl;
    this.radius = 10;
    this.hitRadius = 20;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, 2 * Math.PI);

    ctx.fillStyle = this.isControl ? "red" : "black";
    ctx.fill();
    ctx.restore();
  }

  hitTest(x, y) {
    const dx = this.x - x;
    const dy = this.y - y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    return distance <= this.hitRadius;
  }
}

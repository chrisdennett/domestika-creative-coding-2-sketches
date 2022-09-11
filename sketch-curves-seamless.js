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
    new Point({ x: 400, y: 700 }),
    new Point({ x: 880, y: 540 }),
    new Point({ x: 600, y: 700 }),
    new Point({ x: 640, y: 900 }),
  ];

  canvas.addEventListener("mousedown", onMouseDown);

  return ({ context: ctx, width, height }) => {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, width, height);
    ctx.lineWidth = 2;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.strokeStyle = "#999";
    ctx.stroke();

    ctx.beginPath();
    // midpoints
    for (let i = 0; i < points.length - 1; i++) {
      const currPt = points[i + 0];
      const nextPt = points[i + 1];

      const middleX = currPt.x + (nextPt.x - currPt.x) * 0.5;
      const middleY = currPt.y + (nextPt.y - currPt.y) * 0.5;

      // draw smooth curve start -> all mid-points -> end
      if (i === 0) ctx.moveTo(currPt.x, currPt.y);
      else if (i === points.length - 2)
        ctx.quadraticCurveTo(currPt.x, currPt.y, nextPt.x, nextPt.y);
      else ctx.quadraticCurveTo(currPt.x, currPt.y, middleX, middleY);
    }

    ctx.lineWidth = 4;
    ctx.strokeStyle = "blue";
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

  let pointSelected = false;
  points.forEach((pt) => {
    const isHit = pt.hitTest(x, y);
    if (isHit) {
      pt.isDragging = true;
      pointSelected = true;
    }
  });

  if (!pointSelected) {
    points.push(new Point({ x, y }));
  }
};

const onMouseMove = (e) => {
  const x = (e.offsetX / elCanvas.offsetWidth) * elCanvas.width;
  const y = (e.offsetY / elCanvas.offsetHeight) * elCanvas.height;

  points.forEach((pt) => {
    if (pt.isDragging) {
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

  draw(ctx, colour = "black") {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, 2 * Math.PI);
    ctx.fillStyle = this.isControl ? "red" : colour;
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

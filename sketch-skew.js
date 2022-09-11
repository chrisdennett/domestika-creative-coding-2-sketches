const canvasSketch = require("canvas-sketch");
const math = require("canvas-sketch-util/math");
const random = require("canvas-sketch-util/random");
const Color = require("canvas-sketch-util/color");
const risoColors = require("riso-colors");

const seed = Date.now();
const settings = {
  dimensions: [1080, 1080],
  animate: true,
  name: seed,
};

const sketch = ({ width, height }) => {
  random.setSeed(seed);

  const num = 40;
  const degrees = 30;

  const rects = [];
  const rectColours = [
    random.pick(risoColors),
    random.pick(risoColors),
    random.pick(risoColors),
  ];

  const bgColour = random.pick(risoColors).hex;
  const mask = {
    sides: 3,
    radius: width * 0.4,
    x: width * 0.5,
    y: height * 0.58,
  };

  for (let i = 0; i < num; i++) {
    rects.push({
      x: random.range(0, width),
      y: random.range(0, height),
      w: random.range(600, width),
      h: random.range(40, 200),
      fill: random.pick(rectColours).hex,
      stroke: random.pick(rectColours).hex,
      blend: random.value() > 0.5 ? "overlay" : "source-over",
    });
  }

  return ({ context: ctx, width, height }) => {
    ctx.fillStyle = bgColour;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(mask.x, mask.y);

    drawPolygon({ ctx, ...mask });

    ctx.fill();
    ctx.clip();

    ctx.translate(-mask.x, -mask.y);

    for (let r of rects) {
      const { x, y, w, h, fill, stroke, blend } = r;
      let shadowColor;

      ctx.save();
      ctx.translate(x, y);
      ctx.strokeStyle = stroke;
      ctx.fillStyle = fill;
      ctx.lineWidth = 20;

      ctx.globalCompositeOperation = blend;

      drawSkewedRect({ ctx, degrees, w, h });

      shadowColor = Color.offsetHSL(fill, 0, 0, -20);
      shadowColor.rgba[3] = 0.5;

      ctx.shadowColor = Color.style(shadowColor.rgba);
      ctx.shadowOffsetX = -10;
      ctx.shadowOffsetY = 20;

      ctx.fill();

      ctx.shadowColor = null;
      ctx.stroke();
      ctx.globalCompositeOperation = "source-over";
      ctx.lineWidth = 2;
      ctx.strokeStyle = "black";
      ctx.stroke();

      ctx.restore();
    }
    ctx.restore();

    // draw outline
    ctx.save();
    ctx.translate(mask.x, mask.y);
    ctx.lineWidth = 20;
    drawPolygon({
      ctx,
      sides: mask.sides,
      radius: mask.radius - ctx.lineWidth,
    });
    ctx.strokeStyle = rectColours[0].hex;
    ctx.globalCompositeOperation = "color-burn";
    ctx.stroke();
    ctx.restore();
  };
};

const drawSkewedRect = ({ ctx, w = 600, h = 200, degrees = -45 }) => {
  const angle = math.degToRad(degrees);
  const rx = Math.cos(angle) * w;
  const ry = Math.sin(angle) * w;

  ctx.save();
  ctx.translate(rx * -0.5, (ry + h) * -0.5);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(rx, ry);
  ctx.lineTo(rx, ry + h);
  ctx.lineTo(0, h);
  ctx.closePath();
  // ctx.stroke();
  ctx.restore();
};

const drawPolygon = ({ ctx, radius = 100, sides = 3, x, y }) => {
  // NB 2 * pi is same as 360 degrees in radians
  const slice = (Math.PI * 2) / sides;

  ctx.beginPath();
  ctx.moveTo(0, -radius);

  for (let i = 0; i < sides; i++) {
    const offsetAngle = Math.PI * 0.5; // same as 90 degrees
    const angle = i * slice - offsetAngle;
    ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
  }

  ctx.closePath();
};

canvasSketch(sketch, settings);

import palettes from "./palette.js";

let randomNumber = max => parseInt(Math.floor(Math.random() * max));
let randomSelection = array => array[randomNumber(array.length)];
let randomFillStyle = () =>
  `rgb(${randomNumber(128) + 64}, ${randomNumber(64) + 64}, ${randomNumber(64) +
    64})`;

let canvas = null;
let context = null;
let palette = null;
let max = 0;
let min = 0;
let x_count = 50;
let y_count = 50;
let x_offset_velocity = randomSelection([0, 0.1, 0.2, 0.5, 0.5, 1, 1, 1, 2]);
let y_offset_velocity = randomSelection([0, 0.1, 0.2, 0.5, 0.5, 1, 1, 1, 2]);
console.log("x_offset_velocity", x_offset_velocity);
console.log("y_offset_velocity", y_offset_velocity);
let size = randomSelection([
  5,
  5,
  8,
  8,
  8,
  10,
  10,
  12,
  14,
  18,
  18,
  18,
  24,
  24,
  40,
  50
]);
let x_size = size;
let y_size = size;
let step = randomSelection([
  -2,
  -1,
  -1,
  -1,
  -0.4,
  -0.1,
  -0.1,
  -0.1,
  0,
  0,
  0.1,
  0.1,
  0.4,
  0.8,
  1,
  1,
  1,
  2,
  2
]);
let x_step = step;
let y_step = step;

let x_step_velocity = 0.1;
let y_step_velocity = 0.1;
let max_x_step = 15;
let min_x_step = 0;
let max_y_step = 15;
let min_y_step = 0;
let topDrawBound = 0;
let bottomDrawBound = 0;
let leftDrawBound = 0;
let rightDrawBound = 0;

let enclosedDraw = null;
let drawInterval = null;
let updateInterval = null;
let cells = null;
let x_offset = 0;
let y_offset = 0;

//introduce challenge
//test challenge
//scale challenge
//change challenge

//let get_key = (a, b) => `${a},${b}`;
let get_key = (x, y) => {
  x = x % x_count;
  y = y % y_count;
  if (x < 0) {
    x = x_count + x;
  }
  if (y < 0) {
    y = y_count + y;
  }

  let result = x * x_count + y;
  //console.log(`x, y: ${x}, ${y}, result: ${result}`);
  return result;
};

let encloseDraw = (fn, context) => () => fn(context);
let encloseClick = (fn, context, canvas) => event => fn(event, context, canvas);

let clearAllIntervals = function() {
  for (let i = 0; i < 60000; i++) {
    clearInterval(i);
    clearTimeout(i);
  }
};

let leak = () => {
  for (let i = 0; i < x_count; i++) {
    for (let j = 0; j < y_count; j++) {
      if (randomNumber(10) > 7) {
        const d = randomNumber(12);
        if (d < 3) {
          cells[get_key(i, j)].color = cells[get_key(i, j - 1)].color;
        } else if (d < 6) {
          cells[get_key(i, j)].color = cells[get_key(i, j + 1)].color;
        } else if (d < 9) {
          cells[get_key(i, j)].color = cells[get_key(i + 1, j)].color;
        } else {
          cells[get_key(i, j)].color = cells[get_key(i - 1, j)].color;
        }
      }
    }
  }
};

let setup = g => {
  cells = new Array(x_count * y_count);
  palette = randomSelection(palettes); // palette 86 is nice.
  let id = null;
  for (let i = 0; i < x_count; i++) {
    for (let j = 0; j < y_count; j++) {
      id = get_key(i, j);
      cells[id] = {
        x: i,
        y: j,
        id: id,
        color: randomSelection(palette)
      };
    }
  }
  for (let c = 0; c < 550; c++) {
    leak();
  }
};

let getContiguousColorBoxes = (x, y) => {
  const original_id = get_key(x, y);
  const boxes = [cells[original_id]];
  const seen = { original_id: true };
  const color = cells[original_id].color;
  console.log("cells[original_id]: ", cells[original_id]);
  console.log("color: ", color);
  let current = null;
  let north = null;
  let south = null;
  let west = null;
  let east = null;
  let depth = 0;
  while (depth < boxes.length) {
    //console.log("depth: ", depth, ", boxes: ", boxes);
    current = boxes[depth];
    north = get_key(current.x, current.y - 1);
    south = get_key(current.x, current.y + 1);
    west = get_key(current.x - 1, current.y);
    east = get_key(current.x + 1, current.y);
    // console.log(
    //   "x, y: ",
    //   current.x,
    //   ", ",
    //   current.y,
    //   ", cells[north]: ",
    //   cells[north],
    //   "seen[north]: ",
    //   seen[north]
    // );
    if (cells[north].color === color && !seen[north]) {
      //console.log("pushed");
      boxes.push(cells[north]);
      seen[north] = true;
    }
    // console.log(
    //   "x, y: ",
    //   current.x,
    //   ", ",
    //   current.y,
    //   ", cells[south]: ",
    //   cells[south],
    //   "seen[south]: ",
    //   seen[south]
    // );
    if (cells[south].color === color && !seen[south]) {
      //console.log("pushed");
      boxes.push(cells[south]);
      seen[south] = true;
    }
    // console.log(
    //   "x, y: ",
    //   current.x,
    //   ", ",
    //   current.y,
    //   ", cells[east]: ",
    //   cells[east],
    //   "seen[east]: ",
    //   seen[east]
    // );
    if (cells[west].color === color && !seen[west]) {
      //console.log("pushed");
      boxes.push(cells[west]);
      seen[west] = true;
    }
    // console.log(
    //   "x, y: ",
    //   current.x,
    //   ", ",
    //   current.y,
    //   ", cells[west]: ",
    //   cells[west],
    //   "seen[west]: ",
    //   seen[west]
    // );
    if (cells[east].color === color && !seen[east]) {
      //console.log("pushed");
      boxes.push(cells[east]);
      seen[east] = true;
    }
    depth += 1;
  }
  return boxes;
};

let draw = g => {
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.clearRect(0, 0, x_count * (x_size + x_step), y_count * (y_size + y_step));
  //g.translate(x_offset, 0);
  for (let i = leftDrawBound; i < rightDrawBound; i++) {
    for (let j = topDrawBound; j < bottomDrawBound; j++) {
      // if (leftDrawBound > x_count) {
      //   console.log("l > x, i % x: ", i % x_count);
      // }
      // if (rightDrawBound > x_count) {
      //   console.log("r > x, i % x: ", i % x_count);
      // }
      //console.log("i, j % counts: ", i % x_count, j % y_count);
      g.fillStyle = cells[(i % x_count) * x_count + (j % y_count)].color;
      g.fillRect(
        (i + x_offset / (x_size + x_step)) * (x_size + x_step),
        (j + y_offset / (y_size + y_step)) * (y_size + y_step),
        x_size,
        y_size
      );
    }
  }
};

let update = () => {
  if (Math.random() > 0.99967) {
    let newColor = randomSelection(palette);
    let bounds = getContiguousColorBoxes(
      randomNumber(x_count),
      randomNumber(y_count)
    );
    for (const box of bounds) {
      //console.log(box);
      box.color = newColor;
    }
  }
  if (Math.random() > 0.85) {
    for (let i = 0; i < randomNumber(1) + 2; i++) {
      cells[
        get_key(randomNumber(x_count), randomNumber(y_count))
      ].color = randomSelection(palette);
    }
  }
  x_offset -= x_offset_velocity;
  if (
    x_offset < -x_count * (x_size + x_step) ||
    x_offset > x_count * (x_size + x_step)
  ) {
    x_offset = 0;
  }
  y_offset -= y_offset_velocity;
  if (
    y_offset < -y_count * (y_size + y_step) ||
    y_offset > y_count * (y_size + y_step)
  ) {
    y_offset = 0;
  }
  let oldLeftBound = leftDrawBound;
  let oldRightBound = rightDrawBound;
  leftDrawBound = parseInt(Math.floor(-x_offset / (x_size + x_step)));
  rightDrawBound = parseInt(
    Math.ceil((-x_offset + x_count * (x_size + x_step)) / (x_size + x_step))
  );
  topDrawBound = parseInt(Math.floor(-y_offset / (y_size + y_step)));
  bottomDrawBound = parseInt(
    Math.ceil((-y_offset + y_count * (y_size + y_step)) / (y_size + y_step))
  );
  if (oldRightBound !== rightDrawBound || oldLeftBound !== leftDrawBound) {
    console.log(
      `lbound, rbound: ${leftDrawBound}, ${rightDrawBound}, diff: ${rightDrawBound -
        leftDrawBound}, x_count: ${x_count}`
    );
  }
  //console.log("left, right: ", leftDrawBound, ", ", rightDrawBound);
  // x_step += x_step_velocity;
  // if (x_step > max_x_step || x_step < min_x_step) {
  //   x_step_velocity *= -1;
  // }
  // y_step += y_step_velocity;
  // if (y_step > max_y_step || y_step < min_y_step) {
  //   y_step_velocity *= -1;
  // }
};

let onclick = (e, g, c) => {
  let window_x = e.clientX - x_offset;
  let window_y = e.clientY - y_offset;
  let cell_x = parseInt(Math.floor(window_x / (x_size + x_step)));
  let cell_y = parseInt(Math.floor(window_y / (y_size + y_step)));
  console.log(`cell x, y: ${cell_x}, ${cell_y}`);
  let originalBoxColor = cells[get_key(cell_x, cell_y)].color;
  let newColor = randomSelection(palette);
  let bounds = getContiguousColorBoxes(cell_x, cell_y);
  cells[get_key(cell_x, cell_y)].color = randomFillStyle();
  for (const box of bounds) {
    //console.log(box);
    box.color = newColor;
  }
};

window.onload = () => {
  canvas = document.getElementById("canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  max = Math.max(canvas.width, canvas.height);
  min = Math.min(canvas.width, canvas.height);
  x_count = parseInt(Math.round(max / (x_size + x_step)));
  y_count = parseInt(Math.round(max / (y_size + y_step)));
  topDrawBound = 0;
  bottomDrawBound = y_count;
  leftDrawBound = 0;
  rightDrawBound = x_count;
  context = canvas.getContext("2d");
  canvas.addEventListener("click", encloseClick(onclick, context, canvas));
  // canvas.addEventListener(
  //   "pointermove",
  //   encloseClick(onmove, context, canvas)
  // );
  // canvas.addEventListener("pointerdown", ondown);
  // canvas.addEventListener("pointerup", onup);
  setup();
  enclosedDraw = encloseDraw(draw, context);
  drawInterval = setInterval(enclosedDraw, 50);
  updateInterval = setInterval(update, 30);
};

window.addEventListener("resize", function() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  max = Math.max(canvas.width, canvas.height);
  min = Math.min(canvas.width, canvas.height);
  x_count = parseInt(Math.round(max / (x_size + x_step)));
  y_count = parseInt(Math.round(max / (y_size + y_step)));
});

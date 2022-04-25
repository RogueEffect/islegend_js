

const MAX = 1000;
const DIVISOR = 8;
const WIDTH = 200;
const HEIGHT = 200;

let grid;
let canvas;
let ctx;

let valueMap = {
  48:  'ocean',
  75:  'beach',
  110:  'plains',
  160:  'hills',
  250: 'mountain',
  350: 'peak'
}

let colorMap = {
  ocean: [0, 0, 255],
  beach: [255, 255, 0],
  plains: [0, 255, 0],
  hills: [192, 255, 127],
  mountain: [127, 127, 127],
  peak: [255, 255, 255]
}

function randInt(max) {
  return Math.floor(Math.random() * max);
}

function randomNoise(width, height) {
  let grid = [];
  for(let y = 0; y < height; y++) {
    grid[y] = [];
    for(let x = 0; x < width; x++) {
      grid[y][x] = randInt(MAX);
    }
  }
  return grid;
}

function getColor(r, g, b) {
  if(r instanceof Array) {
    g = r[1];
    b = r[2];
    r = r[0];
  }
  else if(g === undefined) {
    g = b = r;
  }
  return `rgb(${r}, ${g}, ${b})`;
}

function getCell(grid, x, y) {
  return grid[y][x];
}

function setCell(grid, x, y, value) {
  if(grid === undefined) return;
  grid[y][x] = value;
}

function colorFromValue(n) {
  let heightRange;
  for(c in valueMap) {
    heightRange = valueMap[c];
    if(c > n) break;
  }
  return colorMap[heightRange];
}

function updateCanvas(color_) {
  if(ctx === undefined) return;
  for(let y = 0; y < HEIGHT; y++) {
    for(let x = 0; x < WIDTH; x++) {
      let color = Math.floor(getCell(grid, x, y) / 3);
      color = (color > 255) ? 255 : color;
      color = (color < 24) ? 0 : color;
      if(color_ !== undefined) {
        color = colorFromValue(getCell(grid, x, y));
      }
      ctx.fillStyle = getColor(color);
      ctx.fillRect(x, y, 1, 1);
    }
  }
}

function generateNoiseMap() {
  //grid = randomNoise(WIDTH, HEIGHT);
  grid = randomNoise(Math.floor(WIDTH / DIVISOR), Math.floor(HEIGHT / DIVISOR));
  grid = scaleGrid(grid, DIVISOR);
}

function smoothNoiseMap(iterations) {
  for(let i = 0; i < iterations; i++) {
    grid = smoothGrid(grid);
  }
}

function averageCell(grid, x, y) {
  let sum = 0;
  for(let yy = -1; yy < 2; yy++) {
    for(let xx = -1; xx < 2; xx++) {
      if(xx == 0 && yy == 0) continue;
      if(x + xx < 0 || y + yy < 0) continue;
      if(x + xx >= grid[0].length || y + yy >= grid.length) continue;
      sum += getCell(grid, x + xx, y + yy);
    }
  }
  return Math.floor(sum / 8);
}

function smoothGrid(grid) {
  let grid2 = [];
  for(let y = 0; y < grid.length; y++) {
    grid2[y] = [];
    for(let x = 0; x < grid[0].length; x++) {
      let val = getCell(grid, x, y);
      let avg = averageCell(grid, x, y);
      setCell(grid2, x, y, (avg < val) ? avg : val);
      //setCell(grid2, x, y, avg);
    }
  }
  return grid2;
}

function scaleGrid(grid, scale) {
  let grid2 = [];
  for(let y = 0; y < grid.length * scale; y++) {
    grid2[y] = [];
    for(let x = 0; x < grid[0].length * scale; x++) {
      let xx = Math.floor(x / scale);
      let yy = Math.floor(y / scale);
      setCell(grid2, x, y, getCell(grid, xx, yy));
    }
  }
  return grid2;
}

function generateIsland(itterations) {
  if(itterations === undefined) itterations = 200;
  generateNoiseMap();
  smoothNoiseMap(itterations);
  updateCanvas(true);
}

window.addEventListener('load', () => {
  let ts = Date.parse(new Date());
  let d = {script: 'src', link: 'href'};
  for(let i in d) {
    let attr = d[i];
    let elem = document.querySelector(i);
    elem[attr] += `?v=${ts}`;
  }

  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');
  generateIsland();

}, false);

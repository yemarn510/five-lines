
const TILE_SIZE = 30;
const FPS = 30;
const SLEEP = 1000 / FPS;

enum Tile {
  AIR,
  FLUX,
  UNBREAKABLE,
  PLAYER,
  STONE, FALLING_STONE,
  BOX, FALLING_BOX,
  KEY1, LOCK1,
  KEY2, LOCK2
}

enum Input {
  UP, DOWN, LEFT, RIGHT
}

let playerx = 1;
let playery = 1;
let map: Tile[][] = [
  [2, 2, 2, 2, 2, 2, 2, 2],
  [2, 3, 0, 1, 1, 2, 0, 2],
  [2, 4, 2, 6, 1, 2, 0, 2],
  [2, 8, 4, 1, 1, 2, 0, 2],
  [2, 4, 1, 1, 1, 9, 0, 2],
  [2, 2, 2, 2, 2, 2, 2, 2],
];

let inputs: Input[] = [];

function remove(tile: Tile) {
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      (map[y][x] === tile) ? map[y][x] = Tile.AIR : {}; 
    }
  }
}

function moveToTile(newx: number, newy: number) {
  map[playery][playerx] = Tile.AIR;
  map[newy][newx] = Tile.PLAYER;
  playerx = newx;
  playery = newy;
}

function moveHorizontal(dx: number) {
  if (map[playery][playerx + dx] === Tile.FLUX
    || map[playery][playerx + dx] === Tile.AIR) {
    moveToTile(playerx + dx, playery);
  } else if ((map[playery][playerx + dx] === Tile.STONE
    || map[playery][playerx + dx] === Tile.BOX)
    && map[playery][playerx + dx + dx] === Tile.AIR
    && map[playery + 1][playerx + dx] !== Tile.AIR) {
    map[playery][playerx + dx + dx] = map[playery][playerx + dx];
    moveToTile(playerx + dx, playery);
  } else if (map[playery][playerx + dx] === Tile.KEY1) {
    remove(Tile.LOCK1);
    moveToTile(playerx + dx, playery);
  } else if (map[playery][playerx + dx] === Tile.KEY2) {
    remove(Tile.LOCK2);
    moveToTile(playerx + dx, playery);
  }
}

function moveVertical(dy: number) {
  if (map[playery + dy][playerx] === Tile.FLUX
    || map[playery + dy][playerx] === Tile.AIR) {
    moveToTile(playerx, playery + dy);
  } else if (map[playery + dy][playerx] === Tile.KEY1) {
    remove(Tile.LOCK1);
    moveToTile(playerx, playery + dy);
  } else if (map[playery + dy][playerx] === Tile.KEY2) {
    remove(Tile.LOCK2);
    moveToTile(playerx, playery + dy);
  }
}

function update() {
  while (inputs.length > 0) {
    let current = inputs.pop();
    if (current === Input.LEFT)
      moveHorizontal(-1);
    else if (current === Input.RIGHT)
      moveHorizontal(1);
    else if (current === Input.UP)
      moveVertical(-1);
    else if (current === Input.DOWN)
      moveVertical(1);
  }

  for (let y = map.length - 1; y >= 0; y--) {
    for (let x = 0; x < map[y].length; x++) {
      if ((map[y][x] === Tile.STONE || map[y][x] === Tile.FALLING_STONE)
        && map[y + 1][x] === Tile.AIR) {
        map[y + 1][x] = Tile.FALLING_STONE;
        map[y][x] = Tile.AIR;
      } else if ((map[y][x] === Tile.BOX || map[y][x] === Tile.FALLING_BOX)
        && map[y + 1][x] === Tile.AIR) {
        map[y + 1][x] = Tile.FALLING_BOX;
        map[y][x] = Tile.AIR;
      } else if (map[y][x] === Tile.FALLING_STONE) {
        map[y][x] = Tile.STONE;
      } else if (map[y][x] === Tile.FALLING_BOX) {
        map[y][x] = Tile.BOX;
      }
    }
  }
}

function draw() {
  let canvas = document.getElementById("GameCanvas") as HTMLCanvasElement;
  let g = canvas.getContext("2d");

  g.clearRect(0, 0, canvas.width, canvas.height);

  // Draw map
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      g.fillStyle = (map[y][x] === Tile.FLUX) ? "#ccffcc" :
                    (map[y][x] === Tile.UNBREAKABLE) ? "#999999" :
                    (map[y][x] === Tile.STONE || map[y][x] === Tile.FALLING_STONE) ? "#0000cc" :
                    (map[y][x] === Tile.BOX || map[y][x] === Tile.FALLING_BOX) ? "#8b4513" :
                    (map[y][x] === Tile.KEY1 || map[y][x] === Tile.LOCK1) ? "#ffcc00" :
                    (map[y][x] === Tile.KEY2 || map[y][x] === Tile.LOCK2) ? "#00ccff" : null;
      if (map[y][x] !== Tile.AIR)
        g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }
  }

  // Draw player
  g.fillStyle = "#ff0000";
  g.fillRect(playerx * TILE_SIZE, playery * TILE_SIZE, TILE_SIZE, TILE_SIZE);
}

function gameLoop() {
  let before = Date.now();
  update();
  draw();
  let after = Date.now();
  let frameTime = after - before;
  let sleep = SLEEP - frameTime;
  setTimeout(gameLoop, sleep);
}

window.onload = () => {
  gameLoop();
}

const LEFT_KEY = 37;
const UP_KEY = 38;
const RIGHT_KEY = 39;
const DOWN_KEY = 40;
window.addEventListener("keydown", e => {
  const direction = (e.keyCode === LEFT_KEY || e.key === "a") ? 'LEFT' : 
                      (e.keyCode === UP_KEY || e.key === "w") ? 'UP' : 
                      (e.keyCode === RIGHT_KEY || e.key === "d") ? 'RIGHT' : 
                      (e.keyCode === DOWN_KEY || e.key === "s") ? 'DOWN' : null;
  inputs.push(Input[direction]);
});


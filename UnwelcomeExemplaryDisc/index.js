class Canyon {
  constructor(ctx, canvas) {
    this.ctx = ctx;
    this.canvas = canvas;

    this.left = 50;
    this.right = 450;

    this.leftWall = 0;
    this.rightWall = this.canvas.width;
    this.canyonMap = [];
    this.veering = null;

    this.initializeMap();
  }

  getVectors(direction) {
    let leftDirection, rightDirection;

    // Handle veering.
    if (direction) {
      leftDirection = direction;
      rightDirection = direction;
    } else {
      // -1 for left, 0 for straight, 1 for right.
      leftDirection  = Math.floor(Math.random() * Math.floor(3)) - 1;
      rightDirection = Math.floor(Math.random() * Math.floor(3)) - 1;
    }

    if (leftDirection !== 1 && this.left <= this.leftWall + 20) {
      // Bounce off the left side of the screen.
      leftDirection = 1;
    } else if (rightDirection !== -1 && this.right >= this.rightWall - 20) {
      // Bounce off the right side of the screen.
      rightDirection = -1;
    }

    const magnitude = 2.5;

    return [leftDirection * magnitude, rightDirection * magnitude];
  }

  initializeMap() {
    // 500px high canvas, each segment is 10px high.
    for (let i = 0; i < 500; i += 10) {
      let [leftVector, rightVector] = this.getVectors();
      this.canyonMap.push([this.left + leftVector, this.right + rightVector]);
    }
  }

  updateMap() {
    let direction = this.veering && this.veering.direction;
    let [leftVector, rightVector] = this.getVectors(direction);

    this.canyonMap.pop();
    this.canyonMap.unshift([this.left + leftVector, this.right + rightVector]);

    this.left += leftVector;
    this.right += rightVector;

    // 1% chance of veering.
    if (Math.random() <= 0.01) {
      this.veering = {
        // 50/50 chance of veering left or right.
        direction: Math.random() <= 0.5 ? -1 : 1,
        duration: 20,
      };
    }

    if (this.veering) {
      if (this.veering.duration === 0) {
        this.veering = null;
        return;
      }

      this.veering.duration--;
    }
  }

  draw() {
    this.updateMap();

    for (let i = 0; i < this.canyonMap.length; i++) {
      // Left canyon wall.
      this.ctx.beginPath();
      this.ctx.strokeStyle = "#e58618";
      this.ctx.lineWidth = 5;
      this.ctx.moveTo(this.canyonMap[i][0], i * 10);
      this.ctx.lineTo(this.canyonMap[i][0], i * 10 + 10);
      this.ctx.closePath();
      this.ctx.stroke();

      // Right canyon wall.
      this.ctx.beginPath();
      this.ctx.strokeStyle = "#e58618";
      this.ctx.lineWidth = 5;
      this.ctx.moveTo(this.canyonMap[i][1], i * 10);
      this.ctx.lineTo(this.canyonMap[i][1], i * 10 + 10);
      this.ctx.closePath();
      this.ctx.stroke();
    }
  }
}

class Ship {
  constructor(ctx, canvas) {
    this.ctx = ctx;
    this.canvas = canvas;
    this.front = 230;
    this.back = 250;
    this.left = 240;
    this.center = 250;
    this.right = 260;
    this.draw(0, 0);
  }

  draw(deltaX, deltaY) {
    this.ctx.beginPath();
    this.ctx.strokeStyle = "#49b04f";
    this.ctx.fillStyle = "#d2ecd2";
    this.ctx.lineWidth = 5;
    this.ctx.moveTo(this.center + deltaX, this.front + deltaY);
    this.ctx.lineTo(this.left + deltaX, this.back + deltaY);
    this.ctx.lineTo(this.right + deltaX, this.back + deltaY);
    this.ctx.closePath();
    this.ctx.stroke();
    this.ctx.fill();
  }
}

let keys = [];
let deltaX = 0;
let deltaY = 0;

let intervalId;

const DIRECTIONS = Object.freeze({
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
});

const handleKeyDown = function(ship, ctx, canvas) {
  return function(e) {
    keys[e.keyCode] = true;

    if (keys[DIRECTIONS.LEFT])  { deltaX -= 5; }
    if (keys[DIRECTIONS.UP])    { deltaY -= 5; }
    if (keys[DIRECTIONS.RIGHT]) { deltaX += 5; }
    if (keys[DIRECTIONS.DOWN])  { deltaY += 5; }

    e.preventDefault();

    ship.draw(deltaX, deltaY);
  };
};

const handleKeyUp = function(e) {
  keys[e.keyCode] = false;
};

class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d");
    this.canvas.height = 500;
    this.canvas.width = 500;
    this.ship = new Ship(this.ctx, this.canvas);
    this.canyon = new Canyon(this.ctx, this.canvas);
    this.score = 0;
  }

  start() {
    // Register event listeners.
    addEventListener("keydown", handleKeyDown(this.ship, this.ctx, this.canvas), false);
    addEventListener("keyup", handleKeyUp, false);
    // Run the main game loop.
    this.loop();
  }

  displayScore() {
    alert(`Score: ${this.score}`);
  }

  loop() {
    intervalId = setInterval(() => {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ship.draw(deltaX, deltaY);
      this.canyon.draw(this.ctx);

      for (let i = 0; i < this.canyon.canyonMap.length; i++) {
        // If the ship is even with this part of the wall...
        if (this.ship.back + deltaY === i * 10) {
          // ...AND the left side of the ship is over the left wall
          // OR the right side of the ship is over the right wall...
          if (this.ship.left + deltaX <= this.canyon.canyonMap[i][0] || this.ship.right + deltaX >= this.canyon.canyonMap[i][1]) {
            // Game over!
            this.end();
            return;
          }
        }
      }

      this.score++;
    }, 10);
  }

  end() {
    removeEventListener("keydown", handleKeyDown, true);
    removeEventListener("keyup", handleKeyDown, true);
    clearInterval(intervalId);
    this.displayScore();
  }
}

let canvas = document.getElementById("screen");
let game = new Game(canvas);

game.start();
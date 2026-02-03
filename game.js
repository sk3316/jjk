const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

/* ===== FIXED GAME WORLD ===== */
const WIDTH = 360;
const HEIGHT = 640;
const GROUND_HEIGHT = 90;
const PIPE_WIDTH = 60;
const GAP = 160;

/* ===== IMAGES ===== */
const birdImg = new Image();
birdImg.src = "assets/bird.png";

const pipeTopImg = new Image();
pipeTopImg.src = "assets/pipe-top.png";

const pipeBottomImg = new Image();
pipeBottomImg.src = "assets/pipe-bottom.png";

/* ===== AUDIO ===== */
const bgMusic = new Audio("assets/bg-music.mp3");
bgMusic.loop = true;

const dieSound = new Audio("assets/die.mp3");

/* ===== GAME STATE ===== */
let bird, pipes, score, speed, frame, gameOver;

/* ===== INIT ===== */
function init() {
  bird = {
    x: 70,
    y: HEIGHT / 2,
    size: 36,
    gravity: 0.45,
    lift: -7,
    velocity: 0
  };

  pipes = [];
  score = 0;
  speed = 1.6;
  frame = 0;
  gameOver = false;

  bgMusic.currentTime = 0;
}

/* ===== INPUT ===== */
document.addEventListener("keydown", flap);
canvas.addEventListener("click", flap);
canvas.addEventListener("touchstart", flap);

function flap(e) {
  if (e) e.preventDefault();

  if (gameOver) {
    init();
    loop();
    return;
  }

  bird.velocity += bird.lift;
  bgMusic.play();
}

/* ===== PIPE ===== */
function createPipe() {
  const topHeight = Math.random() * 220 + 60;

  pipes.push({
    x: WIDTH,
    top: topHeight,
    bottom: HEIGHT - topHeight - GAP - GROUND_HEIGHT,
    passed: false
  });
}

/* ===== COLLISION ===== */
function hit(pipe) {
  return (
    bird.x + bird.size > pipe.x &&
    bird.x < pipe.x + PIPE_WIDTH &&
    (bird.y < pipe.top ||
     bird.y + bird.size > HEIGHT - pipe.bottom - GROUND_HEIGHT)
  );
}

/* ===== HUD ===== */
function drawHUD() {
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.fillRect(0, 0, WIDTH, 60);

  ctx.fillStyle = "#fff";
  ctx.font = "bold 22px Arial";
  ctx.textAlign = "center";
  ctx.fillText(score, WIDTH / 2, 38);
}

/* ===== GAME OVER CARD ===== */
function drawGameOver() {
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.font = "bold 32px Arial";
  ctx.fillText("Game Over", WIDTH / 2, HEIGHT / 2 - 60);

  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, WIDTH / 2, HEIGHT / 2 - 20);
  ctx.fillText("Tap to Restart", WIDTH / 2, HEIGHT / 2 + 30);
}

/* ===== LOOP ===== */
function loop() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  /* Sky */
  ctx.fillStyle = "#6ec6d9";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  /* Bird */
  bird.velocity += bird.gravity;
  bird.velocity = Math.min(bird.velocity, 9);
  bird.y += bird.velocity;

  ctx.save();
  ctx.translate(bird.x + bird.size / 2, bird.y + bird.size / 2);
  ctx.rotate(bird.velocity * 0.04);
  ctx.drawImage(birdImg, -bird.size / 2, -bird.size / 2, bird.size, bird.size);
  ctx.restore();

  /* Pipes */
  pipes.forEach(pipe => {
    pipe.x -= speed;

    ctx.drawImage(pipeTopImg, pipe.x, 0, PIPE_WIDTH, pipe.top);
    ctx.drawImage(
      pipeBottomImg,
      pipe.x,
      HEIGHT - pipe.bottom - GROUND_HEIGHT,
      PIPE_WIDTH,
      pipe.bottom
    );

    if (!pipe.passed && pipe.x + PIPE_WIDTH < bird.x) {
      score++;
      pipe.passed = true;
      if (score % 6 === 0) speed += 0.15;
    }

    if (hit(pipe)) endGame();
  });

  pipes = pipes.filter(p => p.x > -PIPE_WIDTH);
  if (frame % 120 === 0) createPipe();

  /* Ground */
  ctx.fillStyle = "#ded895";
  ctx.fillRect(0, HEIGHT - GROUND_HEIGHT, WIDTH, GROUND_HEIGHT);

  if (bird.y + bird.size > HEIGHT - GROUND_HEIGHT || bird.y < 0) {
    endGame();
  }

  drawHUD();
  frame++;

  if (!gameOver) requestAnimationFrame(loop);
  else drawGameOver();
}

/* ===== END ===== */
function endGame() {
  if (gameOver) return;
  gameOver = true;
  bgMusic.pause();
  dieSound.play();
}

/* ===== START ===== */
init();
loop();

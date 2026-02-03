const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

/* ===== RESIZE CANVAS FOR MOBILE ===== */
function resizeCanvas() {
  canvas.width = Math.min(window.innerWidth, 420);
  canvas.height = Math.min(window.innerHeight, 640);
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

/* ===== CONSTANTS ===== */
const PIPE_WIDTH = 60;
const GAP = 160;
const GROUND_HEIGHT = 80;

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
    x: canvas.width * 0.2,
    y: canvas.height * 0.4,
    width: 36,
    height: 36,
    gravity: 0.45,
    lift: -7,
    velocity: 0
  };

  pipes = [];
  score = 0;
  speed = 1.5;
  frame = 0;
  gameOver = false;
  bgMusic.currentTime = 0;
}

/* ===== INPUT (DESKTOP + MOBILE) ===== */
document.addEventListener("keydown", flap);
canvas.addEventListener("touchstart", flap);
canvas.addEventListener("click", flap);

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

/* ===== PIPE CREATION ===== */
function createPipe() {
  const topHeight = Math.random() * (canvas.height * 0.35) + 60;

  pipes.push({
    x: canvas.width,
    top: topHeight,
    bottom: canvas.height - topHeight - GAP - GROUND_HEIGHT,
    passed: false
  });
}

/* ===== COLLISION ===== */
function collide(pipe) {
  return (
    bird.x < pipe.x + PIPE_WIDTH &&
    bird.x + bird.width > pipe.x &&
    (bird.y < pipe.top ||
      bird.y + bird.height > canvas.height - pipe.bottom - GROUND_HEIGHT)
  );
}

/* ===== SCORE UI ===== */
function drawScore() {
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.fillRect(12, 12, 120, 36);

  ctx.fillStyle = "#fff";
  ctx.font = "bold 20px Arial";
  ctx.fillText("Score: " + score, 20, 38);
}

/* ===== GAME OVER UI ===== */
function drawGameOver() {
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#fff";
  ctx.font = "bold 30px Arial";
  ctx.fillText("Game Over", canvas.width / 2 - 90, canvas.height / 2 - 40);

  ctx.font = "18px Arial";
  ctx.fillText("Score: " + score, canvas.width / 2 - 45, canvas.height / 2);
  ctx.fillText("Tap to Restart", canvas.width / 2 - 70, canvas.height / 2 + 40);
}

/* ===== MAIN LOOP ===== */
function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  /* Sky */
  ctx.fillStyle = "#6ec6d9";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  /* Bird Physics */
  bird.velocity += bird.gravity;
  bird.velocity = Math.min(bird.velocity, 9);
  bird.y += bird.velocity;

  /* Bird Draw */
  ctx.save();
  ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
  ctx.rotate(Math.max(-0.4, Math.min(bird.velocity * 0.03, 0.6)));
  ctx.drawImage(birdImg, -bird.width / 2, -bird.height / 2, bird.width, bird.height);
  ctx.restore();

  /* Pipes */
  pipes.forEach(pipe => {
    pipe.x -= speed;

    ctx.drawImage(pipeTopImg, pipe.x, 0, PIPE_WIDTH, pipe.top);
    ctx.drawImage(
      pipeBottomImg,
      pipe.x,
      canvas.height - pipe.bottom - GROUND_HEIGHT,
      PIPE_WIDTH,
      pipe.bottom
    );

    if (!pipe.passed && pipe.x + PIPE_WIDTH < bird.x) {
      score++;
      pipe.passed = true;

      if (score % 6 === 0) {
        speed = Math.min(speed + 0.15, 5);
      }
    }

    if (collide(pipe)) endGame();
  });

  pipes = pipes.filter(p => p.x > -PIPE_WIDTH);

  if (frame % 120 === 0) createPipe();

  /* Ground */
  ctx.fillStyle = "#ded895";
  ctx.fillRect(0, canvas.height - GROUND_HEIGHT, canvas.width, GROUND_HEIGHT);

  if (bird.y + bird.height > canvas.height - GROUND_HEIGHT || bird.y < 0) {
    endGame();
  }

  drawScore();
  frame++;

  if (!gameOver) requestAnimationFrame(loop);
  else drawGameOver();
}

/* ===== END GAME ===== */
function endGame() {
  if (gameOver) return;
  gameOver = true;
  bgMusic.pause();
  dieSound.play();
}

/* ===== START ===== */
init();
loop();

// SCENE
const scene = new THREE.Scene();

// CAMERA
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

// RENDERER
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// RESIZE FIX
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// LIGHT
const light = new THREE.AmbientLight(0xffffff, 1);
scene.add(light);

// TEXTURE LOADER
const loader = new THREE.TextureLoader();

// IMAGES (MATCH YOUR FILE NAMES EXACTLY)
const playerTexture = loader.load("images.jpg");
const coinTexture = loader.load("coin.jpg");
const obstacleTexture = loader.load("rahul.jpg");

// SOUNDS (FIXED NAMES)
const coinSound = new Audio("wah.mp3");
const crashSound = new Audio("modibkl.mp3");

// PLAYER
const player = new THREE.Mesh(
  new THREE.PlaneGeometry(2, 3),
  new THREE.MeshBasicMaterial({ map: playerTexture, transparent: true })
);
scene.add(player);
player.position.set(0, 1.5, 0);

// TRACK
const track = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 200),
  new THREE.MeshBasicMaterial({ color: 0x333333 })
);
track.rotation.x = -Math.PI / 2;
track.position.z = -50;
scene.add(track);

// LANE SYSTEM
let lane = 0;

// KEYBOARD CONTROLS
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") lane = Math.max(lane - 1, -1);
  if (e.key === "ArrowRight") lane = Math.min(lane + 1, 1);
});

// MOBILE SWIPE CONTROLS
let startX = 0;

document.addEventListener("touchstart", (e) => {
  startX = e.touches[0].clientX;
});

document.addEventListener("touchend", (e) => {
  let endX = e.changedTouches[0].clientX;
  let diff = endX - startX;

  if (diff > 50) lane = Math.min(lane + 1, 1);
  else if (diff < -50) lane = Math.max(lane - 1, -1);
});

// SCORE
let score = 0;

// COINS
let coins = [];

function spawnCoin() {
  const coin = new THREE.Mesh(
    new THREE.PlaneGeometry(1.5, 1.5),
    new THREE.MeshBasicMaterial({ map: coinTexture, transparent: true })
  );

  coin.position.set(
    (Math.floor(Math.random() * 3) - 1) * 2,
    2,
    player.position.z - 30
  );

  scene.add(coin);
  coins.push(coin);
}

setInterval(spawnCoin, 1200);

// OBSTACLES
let obstacles = [];

function spawnObstacle() {
  const obs = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 3),
    new THREE.MeshBasicMaterial({ map: obstacleTexture, transparent: true })
  );

  obs.position.set(
    (Math.floor(Math.random() * 3) - 1) * 2,
    1.5,
    player.position.z - 30
  );

  scene.add(obs);
  obstacles.push(obs);
}

setInterval(spawnObstacle, 1800);

// GAME LOOP
function animate() {
  requestAnimationFrame(animate);

  // MOVE FORWARD
  player.position.z -= 0.25;
  player.position.x = lane * 2;

  // CAMERA FOLLOW
  camera.position.x = player.position.x;
  camera.position.z = player.position.z + 6;
  camera.position.y = player.position.y + 4;
  camera.lookAt(player.position);

  player.lookAt(camera.position);

  // SCORE
  score += 0.1;
  document.getElementById("score").innerText =
    "Score: " + Math.floor(score);

  // COIN LOGIC
  coins.forEach((coin, i) => {
    coin.lookAt(camera.position);
    coin.rotation.y += 0.1;

    if (player.position.distanceTo(coin.position) < 1.5) {
      scene.remove(coin);
      coins.splice(i, 1);

      coinSound.currentTime = 0;
      coinSound.play();
    }
  });

  // OBSTACLE LOGIC
  obstacles.forEach((obs) => {
    obs.lookAt(camera.position);

    if (player.position.distanceTo(obs.position) < 1.5) {
      crashSound.currentTime = 0;
      crashSound.play();

      setTimeout(() => {
        alert("Game Over 💀");
        location.reload();
      }, 200);
    }
  });

  renderer.render(scene, camera);
}

animate();
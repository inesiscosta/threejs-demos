import * as THREE from "three";
import Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";
import { Balloon } from "./Balloon.js";
import { DroneWatch } from "./DroneWatch.js";
import { createCameras } from "./cameras.js";
import {
  BG_COLOR,
  FRUSTUM_SIZE,
  DEFAULT_CAM_IDX,
  BALLOON_COUNT,
  BALLOON_SPREAD_XZ,
  BALLOON_Y_MIN,
  BALLOON_Y_SPREAD,
  MAX_DT,
  GUI_MOVE_SPEED_MIN,
  GUI_MOVE_SPEED_MAX,
  GUI_MOVE_SPEED_STEP,
  GUI_ROT_SPEED_MIN,
  GUI_ROT_SPEED_MAX,
  GUI_ROT_SPEED_STEP,
  GUI_PARAMS_DEFAULTS,
  ARM_LENGTH,
  ROTOR_RADIUS,
  ROTOR_TUBE,
  BALLOON_RADIUS,
  AMPLITUDE_X,
  AMPLITUDE_Y,
  AMPLITUDE_Z,
  AMPLITUDE_PITCH,
} from "./constants.js";

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////
let scene, renderer, stats, gui;
let orbitControls;
let freeCamera;
let freeCamActive = false;
let cameras = [];
let activeCamIdx = DEFAULT_CAM_IDX;
let cameraHelpers = [];
let helpersVisible = false;
let wireframe = false;
let collisionAnimating = false;
let prevTime = 0;

let balloons = [];
let droneWatch;

const keysDown = new Set();
const worldUp = new THREE.Vector3(0, 1, 0);
const rotorLocalOffset = new THREE.Vector3();
const rotorWorldOffset = new THREE.Vector3();
// Scratch objects reused every frame to avoid per-frame allocations
const rotorPos = new THREE.Vector3();
const balloonPos = new THREE.Vector3();
const yawMatrix = new THREE.Matrix4();
const pitchMatrix = new THREE.Matrix4();
const rotationMatrix = new THREE.Matrix4();
const translationMatrix = new THREE.Matrix4();
const rotorBounds = {
  xMin: 0,
  xMax: 0,
  yMin: 0,
  yMax: 0,
  zMin: 0,
  zMax: 0,
};

// GUI controller refs (needed to keep GUI in sync when keyboard changes state)
let cameraCtrl, helpersCtrl, wireframeCtrl;

// GUI-bound parameter object (single source of truth for GUI)
const guiParams = { ...GUI_PARAMS_DEFAULTS };

// DroneWatch transform state — Euler angles (radians) and world translation
const dronePos = new THREE.Vector3();
const droneAngles = new THREE.Vector3(); // x = pitch, y = yaw, z = roll

/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(BG_COLOR);

  createBalloons();
  droneWatch = new DroneWatch(scene);
  droneWatch.object.matrixAutoUpdate = false;
}

////////////////////////
/* CREATE OBJECT3D(S) */
////////////////////////
function createBalloons() {
  for (let i = 0; i < BALLOON_COUNT; i++) {
    const x = (Math.random() - 0.5) * BALLOON_SPREAD_XZ;
    const y = BALLOON_Y_MIN + Math.random() * BALLOON_Y_SPREAD;
    const z = (Math.random() - 0.5) * BALLOON_SPREAD_XZ;
    balloons.push(new Balloon(scene, x, y, z));
  }
}

///////////////////////
/* CREATE STATS & GUI */
///////////////////////
function createStats() {
  stats = new Stats();
  stats.showPanel(0); // 0 = FPS
  stats.dom.style.position = "absolute";
  stats.dom.style.bottom = "0px";
  stats.dom.style.left = "0px";
  stats.dom.style.top = "auto";
  document.body.appendChild(stats.dom);
}

function createGUI() {
  gui = new GUI({ title: "Scene Controls" });

  const camFolder = gui.addFolder("Camera");
  cameraCtrl = camFolder
    .add(guiParams, "camera", {
      "1 – Top": 0,
      "2 – Lateral": 1,
      "3 – Front": 2,
      "4 – Fixed Ortho": 3,
      "5 – Fixed Persp": 4,
      "6 – Mobile": 5,
    })
    .name("Active Camera")
    .onChange((v) => selectCamera(v));

  const viewFolder = gui.addFolder("View");
  helpersCtrl = viewFolder
    .add(guiParams, "helpers")
    .name("Show Helpers")
    .onChange((v) => {
      helpersVisible = v;
      applyHelpers();
      updateHUD();
    });
  wireframeCtrl = viewFolder
    .add(guiParams, "wireframe")
    .name("Wireframe")
    .onChange((v) => {
      wireframe = v;
      applyWireframe();
      updateHUD();
    });

  const moveFolder = gui.addFolder("Movement");
  moveFolder
    .add(guiParams, "moveSpeed", GUI_MOVE_SPEED_MIN, GUI_MOVE_SPEED_MAX, GUI_MOVE_SPEED_STEP)
    .name("Translation Speed");
  moveFolder
    .add(guiParams, "rotSpeed", GUI_ROT_SPEED_MIN, GUI_ROT_SPEED_MAX, GUI_ROT_SPEED_STEP)
    .name("Rotation Speed");

  const exportFolder = gui.addFolder("Export");
  exportFolder
    .add({ fn: exportDroneWatch }, "fn")
    .name("Export DroneWatch (.gltf)");
}

function exportDroneWatch() {
  const exporter = new GLTFExporter();
  exporter.parse(
    droneWatch.object,
    (result) => {
      const output = JSON.stringify(result, null, 2);
      const blob = new Blob([output], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "dronewatch.gltf";
      a.click();
      URL.revokeObjectURL(url);
    },
    (error) => console.error("GLTFExporter:", error),
    { binary: false },
  );
}

//////////////////////
/* SCENE OPERATIONS */
//////////////////////
function selectCamera(idx) {
  freeCamActive = false;
  orbitControls.enabled = false;
  activeCamIdx = idx;
  guiParams.camera = idx;
  cameraCtrl.updateDisplay();
  updateHUD();
}

function toggleFreeCamera() {
  freeCamActive = !freeCamActive;
  orbitControls.enabled = freeCamActive;
  updateHUD();
}

function applyHelpers() {
  cameraHelpers.forEach((h) => (h.visible = helpersVisible));
  balloons.forEach((b) => b.setHelpersVisible(helpersVisible));
  if (droneWatch) droneWatch.setHelpersVisible(helpersVisible);
}

function applyWireframe() {
  balloons.forEach((b) =>
    b.getMeshes().forEach((m) => (m.material.wireframe = wireframe)),
  );
  if (droneWatch)
    droneWatch.getMeshes().forEach((m) => (m.material.wireframe = wireframe));
}

////////////////////
/* HUD MANAGEMENT */
////////////////////
function setHudActive(id, active) {
  const el = document.getElementById(id);
  if (!el) return;
  const kbd = el.querySelector("kbd");
  if (kbd) kbd.classList.toggle("active", active);
}

function updateHUD() {
  // Highlight the camera currently being rendered
  for (let i = 0; i < 6; i++) {
    document
      .getElementById(`hud-cam-${i + 1}`)
      ?.classList.toggle("current", !freeCamActive && activeCamIdx === i);
  }
  document
    .getElementById("hud-cam-free")
    ?.classList.toggle("current", freeCamActive);
  // Camera rows — highlight while held
  for (let i = 0; i < 6; i++) {
    setHudActive(`hud-cam-${i + 1}`, keysDown.has(String(i + 1)));
  }
  setHudActive("hud-cam-free", keysDown.has("0"));
  // Toggle keys — highlight while held
  setHudActive("hud-key-h", keysDown.has("h"));
  setHudActive("hud-key-7", keysDown.has("7"));
  setHudActive("hud-key-q", keysDown.has("q"));
  // Movement keys — highlight while held
  for (const k of ["a", "d", "w", "s", "u", "j", "i", "k", "o", "l"]) {
    const el = document.getElementById(`hud-kbd-${k}`);
    if (el) el.classList.toggle("active", keysDown.has(k));
  }
}

//////////////////////
/* CHECK COLLISIONS */
//////////////////////
function checkCollisions() {
  if (collisionAnimating || !droneWatch) return;

  const collisionDist = ROTOR_RADIUS + ROTOR_TUBE + BALLOON_RADIUS;

  for (const arm of droneWatch.arms) {
    if (!arm.isFullyExtended()) continue;
    arm.rotor.object.getWorldPosition(rotorPos);
    for (const balloon of balloons) {
      if (!balloon.isAlive) continue;
      balloon.group.getWorldPosition(balloonPos);
      if (rotorPos.distanceTo(balloonPos) < collisionDist) {
        balloon.pop();
        collisionAnimating = true;
      }
    }
  }
}

function clampDronePositionToRotorBounds(rotationMatrix) {
  rotorBounds.xMin = -Infinity;
  rotorBounds.yMin = -Infinity;
  rotorBounds.zMin = -Infinity;
  rotorBounds.xMax = Infinity;
  rotorBounds.yMax = Infinity;
  rotorBounds.zMax = Infinity;

  for (const arm of droneWatch.arms) {
    const rotorDistance = arm.currentX + ARM_LENGTH + 2 * ROTOR_RADIUS;
    rotorLocalOffset
      .set(rotorDistance, 0, 0)
      .applyAxisAngle(worldUp, arm.object.rotation.y);
    rotorWorldOffset.copy(rotorLocalOffset).applyMatrix4(rotationMatrix);

    rotorBounds.xMin = Math.max(
      rotorBounds.xMin,
      AMPLITUDE_X[0] - rotorWorldOffset.x,
    );
    rotorBounds.xMax = Math.min(
      rotorBounds.xMax,
      AMPLITUDE_X[1] - rotorWorldOffset.x,
    );
    rotorBounds.yMin = Math.max(
      rotorBounds.yMin,
      AMPLITUDE_Y[0] - rotorWorldOffset.y,
    );
    rotorBounds.yMax = Math.min(
      rotorBounds.yMax,
      AMPLITUDE_Y[1] - rotorWorldOffset.y,
    );
    rotorBounds.zMin = Math.max(
      rotorBounds.zMin,
      AMPLITUDE_Z[0] - rotorWorldOffset.z,
    );
    rotorBounds.zMax = Math.min(
      rotorBounds.zMax,
      AMPLITUDE_Z[1] - rotorWorldOffset.z,
    );
  }

  dronePos.x = THREE.MathUtils.clamp(
    dronePos.x,
    rotorBounds.xMin,
    rotorBounds.xMax,
  );
  dronePos.y = THREE.MathUtils.clamp(
    dronePos.y,
    rotorBounds.yMin,
    rotorBounds.yMax,
  );
  dronePos.z = THREE.MathUtils.clamp(
    dronePos.z,
    rotorBounds.zMin,
    rotorBounds.zMax,
  );
}

///////////////////////
/* HANDLE COLLISIONS */
///////////////////////
function handleCollisions() {
  if (collisionAnimating && !balloons.some((b) => b.isPopping)) {
    collisionAnimating = false;
  }
}

////////////
/* UPDATE */
////////////
function updateDroneWatch(dt) {
  if (!droneWatch || collisionAnimating) return;
  if (!droneWatch.arms.every((a) => a.isFullyExtended())) return;

  // Accumulate world-space translation
  if (keysDown.has("a")) dronePos.x -= guiParams.moveSpeed * dt; // δx left
  if (keysDown.has("d")) dronePos.x += guiParams.moveSpeed * dt; // δx right
  if (keysDown.has("w")) dronePos.y += guiParams.moveSpeed * dt; // δy up
  if (keysDown.has("s")) dronePos.y -= guiParams.moveSpeed * dt; // δy down
  if (keysDown.has("u")) dronePos.z -= guiParams.moveSpeed * dt; // δz forward
  if (keysDown.has("j")) dronePos.z += guiParams.moveSpeed * dt; // δz backward

  // Accumulate Euler angles
  if (keysDown.has("i")) droneAngles.y += guiParams.rotSpeed * dt; // θ₁ yaw left
  if (keysDown.has("k")) droneAngles.y -= guiParams.rotSpeed * dt; // θ₁ yaw right
  if (keysDown.has("o")) droneAngles.x += guiParams.rotSpeed * dt; // θ₂ pitch up
  if (keysDown.has("l")) droneAngles.x -= guiParams.rotSpeed * dt; // θ₂ pitch down

  droneAngles.x = THREE.MathUtils.clamp(
    droneAngles.x,
    THREE.MathUtils.degToRad(AMPLITUDE_PITCH[0]),
    THREE.MathUtils.degToRad(AMPLITUDE_PITCH[1]),
  );

  // Build rotation matrices: yaw (θ₁) then pitch (θ₂)
  yawMatrix.makeRotationY(droneAngles.y);
  pitchMatrix.makeRotationX(droneAngles.x);

  // Compose: R = Ry * Rx  (yaw → pitch)
  rotationMatrix.multiplyMatrices(yawMatrix, pitchMatrix);

  clampDronePositionToRotorBounds(rotationMatrix);

  // Build translation matrix
  translationMatrix.makeTranslation(dronePos.x, dronePos.y, dronePos.z);

  // Final transform M = T * R — apply directly, bypassing Three.js auto-update
  droneWatch.object.matrix.multiplyMatrices(translationMatrix, rotationMatrix);
}

function update(dt) {
  balloons.forEach((b) => b.update(dt));
  if (droneWatch) droneWatch.update(dt);
  updateDroneWatch(dt);
  checkCollisions();
  handleCollisions();
}

/////////////
/* DISPLAY */
/////////////
function render() {
  renderer.render(scene, freeCamActive ? freeCamera : cameras[activeCamIdx]);
}

////////////////////////////////
/* INITIALIZE ANIMATION CYCLE */
////////////////////////////////
function init() {
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  createScene();
  ({ cameras, cameraHelpers, freeCamera } = createCameras(
    scene,
    helpersVisible,
  ));
  droneWatch.attachMobileCamera(cameras[5]);
  createStats();
  createGUI();

  // OrbitControls always drives the free XYZ camera only
  orbitControls = new OrbitControls(freeCamera, renderer.domElement);
  orbitControls.enableDamping = true;
  orbitControls.dampingFactor = 0.05;
  orbitControls.autoRotate = false;
  orbitControls.screenSpacePanning = true;
  orbitControls.mouseButtons = {
    LEFT: THREE.MOUSE.ROTATE,
    MIDDLE: THREE.MOUSE.DOLLY,
    RIGHT: THREE.MOUSE.PAN,
  };
  orbitControls.target.set(0, 10, 0);
  orbitControls.enabled = false; // disabled until user switches to free cam

  window.addEventListener("resize", onResize);
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  // keyup never fires for keys still held when the tab loses focus
  window.addEventListener("blur", () => {
    keysDown.clear();
    updateHUD();
  });
}

/////////////////////
/* ANIMATION CYCLE */
/////////////////////
function animate(timestamp) {
  stats.begin();
  requestAnimationFrame(animate);
  const dt = Math.min((timestamp - prevTime) / 1000, MAX_DT);
  prevTime = timestamp;
  update(dt);
  if (freeCamActive) orbitControls.update();
  render();
  stats.end();
}

////////////////////////////
/* RESIZE WINDOW CALLBACK */
////////////////////////////
function onResize() {
  const aspect = window.innerWidth / window.innerHeight;
  const hs = FRUSTUM_SIZE / 2;
  const hw = hs * aspect;

  cameras.slice(0, 4).forEach((cam) => {
    cam.left = -hw;
    cam.right = hw;
    cam.top = hs;
    cam.bottom = -hs;
    cam.updateProjectionMatrix();
  });
  cameras.slice(4).forEach((cam) => {
    cam.aspect = aspect;
    cam.updateProjectionMatrix();
  });
  freeCamera.aspect = aspect;
  freeCamera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

///////////////////////
/* KEY DOWN CALLBACK */
///////////////////////
function onKeyDown(e) {
  if (e.repeat) return;
  if (collisionAnimating) return;
  const key = e.key.toLowerCase();
  keysDown.add(key);

  switch (key) {
    case "0":
      toggleFreeCamera();
      break;
    case "1":
    case "2":
    case "3":
    case "4":
    case "5":
    case "6":
      selectCamera(Number(key) - 1);
      break;
    case "h":
      helpersVisible = !helpersVisible;
      guiParams.helpers = helpersVisible;
      helpersCtrl.updateDisplay();
      applyHelpers();
      break;
    case "7":
      wireframe = !wireframe;
      guiParams.wireframe = wireframe;
      wireframeCtrl.updateDisplay();
      applyWireframe();
      break;
    case "q":
      if (droneWatch) droneWatch.extend();
      document.getElementById("hint")?.classList.add("hidden");
      break;
  }
  updateHUD();
}

///////////////////////
/* KEY UP CALLBACK   */
///////////////////////
function onKeyUp(e) {
  keysDown.delete(e.key.toLowerCase());
  updateHUD();
}

init();
updateHUD();
requestAnimationFrame(animate);

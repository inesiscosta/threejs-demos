import * as THREE from "three";
import { AnaglyphEffect } from "three/addons/effects/AnaglyphEffect.js";
import { Artemis } from "./Artemis.js";
import { Cat } from "./Cat.js";
import { Tesseract } from "./Tesseract.js";
import { createLights, createModelLights } from "./lights.js";
import {
  CAMERA_FOV,
  CAMERA_NEAR,
  CAMERA_FAR,
  CAMERA_Z,
  MODEL_POSITION_X,
  MODEL_POSITION_Y,
  MODEL_POSITION_Z,
  MODEL_COLOR,
  PHONG_SHININESS,
  PHONG_SPECULAR,
  CAT_IDX,
  TESSERACT_IDX,
  TESSERACT_SIZE,
  CAT_ROT_SPEED,
  TESSERACT_ROT_X,
  TESSERACT_ROT_Y,
  TESSERACT_SCALE_MIN,
  TESSERACT_SCALE_MAX,
  TESSERACT_SCALE_FREQ,
} from "./constants.js";

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////
let renderer, scene, camera;
let anaglyphEffect;
let useAnaglyph = false;
let tesseract = null;
let artemis = null;

// models[i]  — static wrapper group (lights live here, visibility toggled here)
// meshes[i]  — inner rotating mesh/group (child of wrapper)
const models = [];
const meshes = [];
const modelNames = ["Artemis", "Cat", "Tesseract"];
let currentModelIdx = TESSERACT_IDX; // default tesseract
let currentMatIdx = 0;

const materials = [
  {
    name: "Gouraud",
    mat: new THREE.MeshLambertMaterial({ color: MODEL_COLOR }),
    unlit: new THREE.MeshBasicMaterial({ color: MODEL_COLOR }),
  },
  {
    name: "Phong",
    mat: new THREE.MeshPhongMaterial({
      color: MODEL_COLOR,
      specular: PHONG_SPECULAR,
      shininess: PHONG_SHININESS,
    }),
    unlit: new THREE.MeshBasicMaterial({ color: MODEL_COLOR }),
  },
];
let lightingOn = true;

let dirLight;
const modelLights = []; // modelLights[idx] = { pointLights, spotLights }
let dirOn = true; // desired state of the directional light
let pointsOn = true;
let spotsOn = false;

/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene() {
  "use strict";
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
}

//////////////////////
/* CREATE CAMERA(S) */
//////////////////////
function createCamera() {
  "use strict";
  camera = new THREE.PerspectiveCamera(
    CAMERA_FOV,
    window.innerWidth / window.innerHeight,
    CAMERA_NEAR,
    CAMERA_FAR,
  );
  camera.position.set(0, 0, CAMERA_Z);
  camera.lookAt(0, 0, 0);
}

/////////////////////
/* CREATE LIGHT(S) */
/////////////////////
function initLights() {
  "use strict";
  ({ dirLight } = createLights(scene));
}

function initModelLights(idx) {
  modelLights[idx] = createModelLights(models[idx]); // wrapper = static anchor
}

////////////////////////
/* CREATE OBJECT3D(S) */
////////////////////////

function applyMaterial(object, mat) {
  object.traverse((child) => {
    if (child.isMesh) child.material = mat;
  });
}

function applyCurrentMaterial(idx) {
  if (idx === TESSERACT_IDX) {
    tesseract.setMaterial(currentMatIdx, lightingOn);
    return;
  }
  if (idx === 0) {
    artemis.setMaterial(currentMatIdx, lightingOn);
    return;
  }
  const m = materials[currentMatIdx];
  applyMaterial(meshes[idx], lightingOn ? m.mat : m.unlit);
}

function setModelLightsVisible(idx, pOn, sOn) {
  const ml = modelLights[idx];
  if (!ml) return;
  ml.pointLights.forEach((l) => (l.visible = pOn));
  ml.spotLights.forEach((l) => (l.visible = sOn));
}

function addModel(object, idx) {
  const wrapper = new THREE.Group();
  wrapper.visible = false;
  wrapper.add(object);
  scene.add(wrapper);
  models[idx] = wrapper;
  meshes[idx] = object;
  if (idx === 0) artemis.setMaterial(currentMatIdx, lightingOn);
  else if (idx !== TESSERACT_IDX)
    applyMaterial(object, materials[currentMatIdx].mat);
  initModelLights(idx);
  // sync lights with current toggle state (model may load after flags are set)
  if (idx === currentModelIdx)
    setModelLightsVisible(idx, lightingOn && pointsOn, lightingOn && spotsOn);
}

async function createObjects() {
  "use strict";

  // Tesseract (index 2) — built manually, vertex by vertex
  tesseract = new Tesseract();
  const tMesh = tesseract.getMesh();
  tMesh.position.set(MODEL_POSITION_X, MODEL_POSITION_Y, MODEL_POSITION_Z);
  tMesh.scale.setScalar(TESSERACT_SIZE);
  addModel(tMesh, TESSERACT_IDX);

  // Show default (Tesseract = index 2)
  models[currentModelIdx].visible = true;

  // Async: Artemis (0) and Cat (1)
  artemis = new Artemis();
  artemis.load().then((obj) => {
    addModel(obj, 0);
  });
  new Cat().load().then((obj) => {
    addModel(obj, 1);
  });
}

////////////////////
/* CREATE RENDERER */
////////////////////
function createRenderer() {
  "use strict";
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  document.body.appendChild(renderer.domElement);

  anaglyphEffect = new AnaglyphEffect(renderer);
  anaglyphEffect.eyeSep = 0.064;
  anaglyphEffect.setSize(window.innerWidth, window.innerHeight);
}

////////////////////
/* SETUP HUD      */
////////////////////

function syncLightButtons() {
  const dirBtn = document.getElementById("light-directional");
  const pntBtn = document.getElementById("light-point");
  const sptBtn = document.getElementById("light-spot");
  dirBtn.disabled = !lightingOn;
  pntBtn.disabled = !lightingOn;
  sptBtn.disabled = !lightingOn;
  dirBtn.classList.toggle("active", lightingOn && dirOn);
  pntBtn.classList.toggle("active", lightingOn && pointsOn);
  sptBtn.classList.toggle("active", lightingOn && spotsOn);
}

function applyLightVisibility() {
  dirLight.visible = lightingOn && dirOn;
  const ml = modelLights[currentModelIdx];
  if (ml) {
    ml.pointLights.forEach((l) => (l.visible = lightingOn && pointsOn));
    ml.spotLights.forEach((l) => (l.visible = lightingOn && spotsOn));
  }
}

function setupModelButtons() {
  function switchModel(next) {
    if (!models[next]) return;
    models[currentModelIdx].visible = false;
    setModelLightsVisible(currentModelIdx, false, false);
    document
      .getElementById(`model-btn-${currentModelIdx}`)
      ?.classList.remove("active");
    currentModelIdx = next;
    models[currentModelIdx].visible = true;
    setModelLightsVisible(
      currentModelIdx,
      lightingOn && pointsOn,
      lightingOn && spotsOn,
    );
    document
      .getElementById(`model-btn-${currentModelIdx}`)
      ?.classList.add("active");
  }

  modelNames.forEach((_, idx) => {
    document
      .getElementById(`model-btn-${idx}`)
      ?.addEventListener("click", () => switchModel(idx));
  });
}

function setupMaterialButtons() {
  materials.forEach((_, idx) => {
    document.getElementById(`mat-btn-${idx}`)?.addEventListener("click", () => {
      document
        .getElementById(`mat-btn-${currentMatIdx}`)
        ?.classList.remove("active");
      currentMatIdx = idx;
      document.getElementById(`mat-btn-${idx}`)?.classList.add("active");
      applyCurrentMaterial(currentModelIdx);
    });
  });

  document.getElementById("mat-lighting").addEventListener("click", (e) => {
    lightingOn = !lightingOn;
    e.currentTarget.classList.toggle("active", lightingOn);
    applyCurrentMaterial(currentModelIdx);
    applyLightVisibility();
    syncLightButtons();
  });
}

function setupLightButtons() {
  const dirBtn = document.getElementById("light-directional");
  const pntBtn = document.getElementById("light-point");
  const sptBtn = document.getElementById("light-spot");

  dirBtn.addEventListener("click", () => {
    if (!lightingOn) return;
    dirOn = !dirOn;
    dirLight.visible = dirOn;
    dirBtn.classList.toggle("active", dirOn);
  });

  pntBtn.addEventListener("click", () => {
    if (!lightingOn) return;
    pointsOn = !pointsOn;
    modelLights[currentModelIdx]?.pointLights.forEach(
      (l) => (l.visible = pointsOn),
    );
    pntBtn.classList.toggle("active", pointsOn);
  });

  sptBtn.addEventListener("click", () => {
    if (!lightingOn) return;
    spotsOn = !spotsOn;
    modelLights[currentModelIdx]?.spotLights.forEach(
      (l) => (l.visible = spotsOn),
    );
    sptBtn.classList.toggle("active", spotsOn);
  });
}

function setupEffectButtons() {
  document.getElementById("fx-anaglyph").addEventListener("click", (e) => {
    useAnaglyph = !useAnaglyph;
    e.currentTarget.classList.toggle("active", useAnaglyph);
  });
}

function setupHUD() {
  "use strict";
  setupModelButtons();
  setupMaterialButtons();
  setupLightButtons();
  setupEffectButtons();

  // Sync all button states with initial flag values
  syncLightButtons();
  document
    .getElementById("mat-lighting")
    .classList.toggle("active", lightingOn);
  document.getElementById(`mat-btn-${currentMatIdx}`)?.classList.add("active");
  document
    .getElementById(`model-btn-${currentModelIdx}`)
    ?.classList.add("active");
}

//////////////////////
/* CHECK COLLISIONS */
//////////////////////
function checkCollisions() {
  "use strict";
}

///////////////////////
/* HANDLE COLLISIONS */
///////////////////////
function handleCollisions() {
  "use strict";
}

////////////
/* UPDATE */
////////////
function update() {
  "use strict";

  const mesh = meshes[currentModelIdx];
  if (!mesh) return;

  if (currentModelIdx === CAT_IDX) {
    mesh.rotation.y += CAT_ROT_SPEED;
  } else if (currentModelIdx === TESSERACT_IDX) {
    mesh.rotation.x += TESSERACT_ROT_X;
    mesh.rotation.y += TESSERACT_ROT_Y;
    const t = performance.now() / 1000;
    const s =
      TESSERACT_SCALE_MIN +
      (TESSERACT_SCALE_MAX - TESSERACT_SCALE_MIN) *
        (Math.sin(t * TESSERACT_SCALE_FREQ * Math.PI * 2) * 0.5 + 0.5);
    mesh.scale.setScalar(s * TESSERACT_SIZE);
  }
}

/////////////
/* DISPLAY */
/////////////
function render() {
  "use strict";
  if (useAnaglyph) {
    anaglyphEffect.render(scene, camera);
  } else {
    renderer.render(scene, camera);
  }
}

////////////////////////////////
/* INITIALIZE ANIMATION CYCLE */
////////////////////////////////
function init() {
  "use strict";
  createScene();
  createCamera();
  createRenderer();
  initLights();
  createObjects();
  setupHUD();
  window.addEventListener("resize", onResize);
}

/////////////////////
/* ANIMATION CYCLE */
/////////////////////
function animate() {
  "use strict";
  requestAnimationFrame(animate);
  update();
  render();
}

////////////////////////////
/* RESIZE WINDOW CALLBACK */
////////////////////////////
function onResize() {
  "use strict";
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  anaglyphEffect.setSize(window.innerWidth, window.innerHeight);
}

///////////////////////
/* KEY DOWN CALLBACK */
///////////////////////
function onKeyDown(e) {
  "use strict";
}

///////////////////////
/* KEY UP CALLBACK */
///////////////////////
function onKeyUp(e) {
  "use strict";
}

init();
animate();

import * as THREE from "three";
import {
  FRUSTUM_SIZE,
  CAM_NEAR,
  CAM_FAR,
  CAM_ORTHO_DIST,
  CAM_FIXED_POS,
  CAM_PERSP_FOV,
  CAM_MOBILE_FOV,
  CAM_MOBILE_POS,
  CAM_MOBILE_TARGET,
} from "./constants.js";

export function createCameras(scene, helpersVisible) {
  const aspect = window.innerWidth / window.innerHeight;
  const hs = FRUSTUM_SIZE / 2;
  const hw = hs * aspect;

  function makeOrtho(px, py, pz) {
    const cam = new THREE.OrthographicCamera(-hw, hw, hs, -hs, CAM_NEAR, CAM_FAR);
    cam.position.set(px, py, pz);
    cam.lookAt(0, 0, 0);
    return cam;
  }

  // Camera 1 — top (looking down -Y)
  const camTop        = makeOrtho(0, CAM_ORTHO_DIST, 0);
  // Camera 2 — lateral (looking along -X)
  const camSide       = makeOrtho(CAM_ORTHO_DIST, 0, 0);
  // Camera 3 — front (looking along -Z)
  const camFront      = makeOrtho(0, 0, CAM_ORTHO_DIST);
  // Camera 4 — fixed off-axis, orthographic
  const camOrthoFixed = makeOrtho(...CAM_FIXED_POS);

  // Camera 5 — fixed off-axis, perspective
  const camPerspFixed = new THREE.PerspectiveCamera(CAM_PERSP_FOV, aspect, CAM_NEAR, CAM_FAR);
  camPerspFixed.position.set(...CAM_FIXED_POS);
  camPerspFixed.lookAt(0, 0, 0);

  // Camera 6 — mobile perspective, top rim of DroneWatch
  const camMobile = new THREE.PerspectiveCamera(CAM_MOBILE_FOV, aspect, CAM_NEAR, CAM_FAR);
  camMobile.position.set(...CAM_MOBILE_POS);
  camMobile.lookAt(...CAM_MOBILE_TARGET);

  const cameras = [camTop, camSide, camFront, camOrthoFixed, camPerspFixed, camMobile];

  // Free XYZ camera — driven by OrbitControls, independent of the scene camera list
  const freeCamera = new THREE.PerspectiveCamera(CAM_PERSP_FOV, aspect, CAM_NEAR, CAM_FAR);
  freeCamera.position.set(0, 50, 60);
  freeCamera.lookAt(0, 10, 0);

  cameras.forEach((cam) => scene.add(cam));
  scene.add(freeCamera);

  const cameraHelpers = cameras.map((cam) => {
    const helper = new THREE.CameraHelper(cam);
    helper.visible = helpersVisible;
    scene.add(helper);
    return helper;
  });

  return { cameras, cameraHelpers, freeCamera };
}

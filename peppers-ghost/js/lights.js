import * as THREE from "three";
import {
  AMBIENT_INTENSITY,
  DIR_INTENSITY, DIR_POS_X, DIR_POS_Y, DIR_POS_Z,
  POINT1_COLOR, POINT2_COLOR, POINT_INTENSITY, POINT_RANGE,
  SPOT1_COLOR, SPOT2_COLOR, SPOT_INTENSITY, SPOT_ANGLE, SPOT_PENUMBRA,
} from "./constants.js";

/////////////////////
/* CREATE LIGHT(S) */
/////////////////////

export function createLights(scene) {
  const ambientLight = new THREE.AmbientLight(0xffffff, AMBIENT_INTENSITY);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, DIR_INTENSITY);
  dirLight.position.set(DIR_POS_X, DIR_POS_Y, DIR_POS_Z);
  dirLight.visible = true;
  scene.add(dirLight);

  return { ambientLight, dirLight };
}

/**
 * Creates 2 point lights + 2 spotlights as children of `model`.
 * Positions are in model local space — lights follow model if it moves.
 * Spotlight targets sit at local origin so they always aim at model center.
 */
export function createModelLights(model) {
  const pointLight1 = new THREE.PointLight(POINT1_COLOR, POINT_INTENSITY, POINT_RANGE);
  pointLight1.position.set(-2, 0, 0);   // left side
  pointLight1.visible = false;
  model.add(pointLight1);

  const pointLight2 = new THREE.PointLight(POINT2_COLOR, POINT_INTENSITY, POINT_RANGE);
  pointLight2.position.set(2, 0, 0);    // right side
  pointLight2.visible = false;
  model.add(pointLight2);

  const spotLight1 = new THREE.SpotLight(SPOT1_COLOR, SPOT_INTENSITY);
  spotLight1.position.set(-1.5, 3, 2);  // top-left-front
  spotLight1.angle = SPOT_ANGLE;
  spotLight1.penumbra = SPOT_PENUMBRA;
  spotLight1.target.position.set(0, 0, 0);
  spotLight1.visible = false;
  model.add(spotLight1);
  model.add(spotLight1.target);

  const spotLight2 = new THREE.SpotLight(SPOT2_COLOR, SPOT_INTENSITY);
  spotLight2.position.set(1.5, 3, -2);  // top-right-back
  spotLight2.angle = SPOT_ANGLE;
  spotLight2.penumbra = SPOT_PENUMBRA;
  spotLight2.target.position.set(0, 0, 0);
  spotLight2.visible = false;
  model.add(spotLight2);
  model.add(spotLight2.target);

  return {
    pointLights: [pointLight1, pointLight2],
    spotLights: [spotLight1, spotLight2],
  };
}

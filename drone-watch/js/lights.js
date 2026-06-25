import * as THREE from "three";
import { LIGHT_COLOR, SUN_POS } from "./constants.js";

export function createLights(scene, { ambientIntensity, sunIntensity }) {
  const ambientLight = new THREE.AmbientLight(LIGHT_COLOR, ambientIntensity);
  scene.add(ambientLight);
  
  const sunLight = new THREE.DirectionalLight(LIGHT_COLOR, sunIntensity);
  sunLight.position.set(...SUN_POS);
  scene.add(sunLight);
  
  return { ambientLight, sunLight };
}

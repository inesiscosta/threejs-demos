import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import {
  MODEL_FIT_SIZE,
  MODEL_POSITION_X,
  MODEL_POSITION_Y,
  MODEL_POSITION_Z,
} from "./constants.js";

class Cat {
  constructor() {
    this.mesh = null;
  }

  async load() {
    const loader = new GLTFLoader();
    const object = (await loader.loadAsync("./cat.glb")).scene;

    this._fitToView(object);

    this.mesh = object; // glTF scene is a Group, not a geometry
    this.mesh.position.set(
      MODEL_POSITION_X,
      MODEL_POSITION_Y,
      MODEL_POSITION_Z,
    );

    return this.mesh;
  }

  _fitToView(object) {
    object.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(object);

    const center = new THREE.Vector3();
    box.getCenter(center);

    // Translate each child's geometry so the group origin IS the center
    object.traverse((child) => {
      if (child.isMesh) {
        child.geometry.translate(-center.x, -center.y, -center.z);
      }
    });

    const size = new THREE.Vector3();
    box.getSize(size);
    const scale = MODEL_FIT_SIZE / Math.max(size.x, size.y, size.z);
    object.scale.setScalar(scale);
  }
}

export { Cat };

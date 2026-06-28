import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import {
  ARTEMIS_FIT_SIZE,
  MODEL_POSITION_X,
  MODEL_POSITION_Y,
  MODEL_POSITION_Z,
  PHONG_SHININESS,
  PHONG_SPECULAR,
} from "./constants.js";

function makeMats(src) {
  const base = {};
  if (src.map) {
    base.map = src.map;
    base.color = 0xffffff;
  } else if (src.color) {
    base.color = src.color.clone();
  }

  return {
    lambert: new THREE.MeshLambertMaterial({ ...base }),
    phong: new THREE.MeshPhongMaterial({
      ...base,
      specular: PHONG_SPECULAR,
      shininess: PHONG_SHININESS,
    }),
    basic: new THREE.MeshBasicMaterial({ ...base }),
  };
}

class Artemis {
  constructor() {
    this.group = new THREE.Group();
    this.meshes = [];
  }

  async load() {
    const loader = new GLTFLoader();
    const gltf = await loader.loadAsync("Artemis.glb");
    const model = gltf.scene;

    model.traverse((child) => {
      if (!child.isMesh) return;
      child.userData.mats = makeMats(child.material);
      child.material = child.userData.mats.lambert;
      this.meshes.push(child);
    });

    const box = new THREE.Box3().setFromObject(model);
    const centre = new THREE.Vector3();
    const size = new THREE.Vector3();
    box.getCenter(centre);
    box.getSize(size);

    model.position.sub(centre);
    const scale = ARTEMIS_FIT_SIZE / Math.max(size.x, size.y, size.z);

    this.group.add(model);
    this.group.scale.setScalar(scale);
    this.group.position.set(MODEL_POSITION_X, MODEL_POSITION_Y, MODEL_POSITION_Z);

    return this.group;
  }

  setMaterial(matIdx, lightingOn) {
    this.meshes.forEach((m) => {
      const mats = m.userData.mats;
      m.material = !lightingOn
        ? mats.basic
        : matIdx === 1
          ? mats.phong
          : mats.lambert;
    });
  }
}

export { Artemis };

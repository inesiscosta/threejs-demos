import * as THREE from "three";
import {
  ROTOR_COLOR, HUB_COLOR, BLADE_COLOR,
  ROTOR_RADIUS, ROTOR_TUBE,
  HUB_RADIUS, HUB_TUBE,
  BLADE_LENGTH, BLADE_HEIGHT, BLADE_WIDTH,
} from "./constants.js";

class Rotor {
  constructor(parent, x = 0, y = 0, z = 0) {
    this.parent = parent;

    // Caixilharia — outer guard ring, flat on XZ plane
    this.caixilharia = new THREE.Mesh(
      new THREE.TorusGeometry(ROTOR_RADIUS, ROTOR_TUBE, 30, 4),
      new THREE.MeshBasicMaterial({ color: ROTOR_COLOR }),
    );
    this.caixilharia.rotation.x = Math.PI / 2;

    // Hub — small motor torus at center, flat on XZ plane
    this.hub = new THREE.Mesh(
      new THREE.TorusGeometry(HUB_RADIUS, HUB_TUBE, 16, 32),
      new THREE.MeshBasicMaterial({ color: HUB_COLOR }),
    );
    this.hub.rotation.x = Math.PI / 2;

    // Hélice — single scaled box spanning both blades (2-blade prop)
    this.helice = new THREE.Mesh(
      new THREE.BoxGeometry(BLADE_LENGTH, BLADE_HEIGHT, BLADE_WIDTH),
      new THREE.MeshBasicMaterial({ color: BLADE_COLOR }),
    );

    this.object = new THREE.Object3D();
    this.object.add(this.caixilharia, this.hub, this.helice);
    this.object.position.set(x, y, z);

    this.axesHelper = new THREE.AxesHelper(ROTOR_RADIUS);
    this.axesHelper.visible = false;
    this.object.add(this.axesHelper);

    parent.add(this.object);
  }

  getMeshes() {
    return [this.caixilharia, this.hub, this.helice];
  }

  setHelpersVisible(visible) {
    this.axesHelper.visible = visible;
  }

  remove() {
    this.parent.remove(this.object);
  }

  update(dt) {
    this.helice.rotation.y += 5 * dt;
  }
}

export { Rotor, ROTOR_RADIUS };

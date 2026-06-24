import * as THREE from "three";
import { Watch } from "./Watch.js";
import { Arm } from "./Arm.js";
import { Strap } from "./Strap.js";
import {
  STRAP_POS_Y,
  WATCH_BODY_HEIGHT,
  WATCH_BODY_SIZE,
} from "./constants.js";

class DroneWatch {
  constructor(scene, x = 0, y = 0, z = 0) {
    this.object = new THREE.Object3D();
    this.object.position.set(x, y, z);

    this.droneCenter = new THREE.Object3D();
    this.object.add(this.droneCenter);

    this.scene = scene;
    this.watch = new Watch(this.droneCenter);
    this.strap = new Strap(this.droneCenter, STRAP_POS_Y);
    this.strapDetached = false;

    this.arms = [0, 1, 2, 3].map(
      (k) => new Arm(this.droneCenter, Math.PI / 4 + k * (Math.PI / 2)),
    );

    this.axesHelper = new THREE.AxesHelper(1);
    this.axesHelper.visible = false;
    this.droneCenter.add(this.axesHelper);

    scene.add(this.object);
  }

  extend() {
    if (!this.strapDetached) {
      const worldPos = new THREE.Vector3();
      const worldQuat = new THREE.Quaternion();
      this.strap.mesh.getWorldPosition(worldPos);
      this.strap.mesh.getWorldQuaternion(worldQuat);
      this.droneCenter.remove(this.strap.mesh);
      this.scene.add(this.strap.mesh);
      this.strap.mesh.position.copy(worldPos);
      this.strap.mesh.quaternion.copy(worldQuat);
      this.strapDetached = true;
    }
    this.arms.forEach((a) => a.extend());
  }

  attachMobileCamera(camera) {
    this.droneCenter.add(camera);
    camera.position.set(0, WATCH_BODY_HEIGHT / 2 + 0.8, WATCH_BODY_SIZE / 2);
    camera.rotation.set(0, 0, 0);
  }

  getMeshes() {
    return [
      ...this.watch.getMeshes(),
      ...this.arms.flatMap((a) => a.getMeshes()),
      this.strap.mesh,
    ];
  }

  setHelpersVisible(visible) {
    this.axesHelper.visible = visible;
    this.watch.setHelpersVisible(visible);
    this.arms.forEach((a) => a.setHelpersVisible(visible));
  }

  update(dt) {
    this.arms.forEach((a) => a.update(dt));
  }
}

export { DroneWatch };

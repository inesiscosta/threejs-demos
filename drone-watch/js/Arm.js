import * as THREE from "three";
import { Rotor, ROTOR_RADIUS } from "./Rotor.js";
import {
  ARM_LENGTH,
  ARM_HALF_LENGTH,
  ARM_HEIGHT,
  ARM_WIDTH,
  ARM_COLOR,
  ARM_EXTENDED_X,
  ARM_RETRACTED_X,
  ARM_ANIM_SPEED,
} from "./constants.js";

class Arm {
  // parent — droneCenter (MiddleOfDroneWatch referential)
  // angle  — Y rotation (radians)
  constructor(parent, angle) {
    // RefOfArms — Y rotation only, anchored at droneCenter
    this.object = new THREE.Object3D();
    this.object.rotation.y = angle;

    // Slide object — translates along local X for extend/retract
    this.slideObject = new THREE.Object3D();
    this.object.add(this.slideObject);

    // midRef — pivot at the physical center of the arm beam
    this.midRef = new THREE.Object3D();
    this.midRef.position.x = ARM_HALF_LENGTH;
    this.slideObject.add(this.midRef);

    this.beam = new THREE.Mesh(
      new THREE.BoxGeometry(ARM_LENGTH, ARM_HEIGHT, ARM_WIDTH),
      new THREE.MeshBasicMaterial({ color: ARM_COLOR }),
    );
    this.midRef.add(this.beam); // centered at midRef origin

    // RefOfRotor lives at the arm tip relative to midRef
    this.rotor = new Rotor(this.midRef, ARM_HALF_LENGTH + ROTOR_RADIUS, 0, 0);

    this.axesHelper = new THREE.AxesHelper(ROTOR_RADIUS);
    this.axesHelper.visible = false;
    this.midRef.add(this.axesHelper); // helper at arm center

    // Start retracted
    this.extended = false;
    this.targetX = ARM_RETRACTED_X;
    this.currentX = ARM_RETRACTED_X;
    this.slideObject.position.x = ARM_RETRACTED_X;

    parent.add(this.object);
  }

  extend() {
    this.extended = !this.extended;
    this.targetX = this.extended ? ARM_EXTENDED_X : ARM_RETRACTED_X;
  }

  getMeshes() {
    return [this.beam, ...this.rotor.getMeshes()];
  }

  setHelpersVisible(visible) {
    this.axesHelper.visible = visible;
    this.rotor.setHelpersVisible(visible);
  }

  isFullyExtended() {
    return this.extended && Math.abs(this.currentX - ARM_EXTENDED_X) < 0.05;
  }

  update(dt) {
    this.currentX = THREE.MathUtils.lerp(this.currentX, this.targetX, ARM_ANIM_SPEED * dt);
    this.slideObject.position.x = this.currentX;
    if (this.isFullyExtended()) this.rotor.update(dt);
  }
}

export { Arm };

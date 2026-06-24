import * as THREE from "three";
import {
  WATCH_BODY_SIZE,
  WATCH_BODY_HEIGHT,
  WATCH_BODY_COLOR,
  WATCH_FACE_SIZE,
  WATCH_FACE_HEIGHT,
  WATCH_FACE_COLOR,
  WATCH_BUTTON_RADIUS,
  WATCH_BUTTON_HEIGHT,
  WATCH_BUTTON_SEGS,
  WATCH_BUTTON_COLOR,
  WATCH_BUTTON_POS_Y,
  WATCH_BUTTON_POS_Z,
  WATCH_BUTTON_ROT_Z,
} from "./constants.js";

class Watch {
  constructor(parent) {
    this.object = new THREE.Object3D();

    this.body = new THREE.Mesh(
      new THREE.BoxGeometry(WATCH_BODY_SIZE, WATCH_BODY_HEIGHT, WATCH_BODY_SIZE),
      new THREE.MeshBasicMaterial({ color: WATCH_BODY_COLOR }),
    );
    this.object.add(this.body);

    this.face = new THREE.Mesh(
      new THREE.BoxGeometry(WATCH_FACE_SIZE, WATCH_FACE_HEIGHT, WATCH_FACE_SIZE),
      new THREE.MeshBasicMaterial({ color: WATCH_FACE_COLOR }),
    );
    this.face.position.y = WATCH_BODY_HEIGHT / 2 + WATCH_FACE_HEIGHT / 2;
    this.object.add(this.face);

    const buttonGeo = new THREE.CylinderGeometry(
      WATCH_BUTTON_RADIUS,
      WATCH_BUTTON_RADIUS,
      WATCH_BUTTON_HEIGHT,
      WATCH_BUTTON_SEGS,
    );
    const buttonMat = new THREE.MeshBasicMaterial({ color: WATCH_BUTTON_COLOR });

    // Two buttons lying along X on top of the body, at opposite Z ends
    this.buttonPos = new THREE.Mesh(buttonGeo, buttonMat);
    this.buttonPos.rotation.z = WATCH_BUTTON_ROT_Z;
    this.buttonPos.position.set(0, WATCH_BUTTON_POS_Y, WATCH_BUTTON_POS_Z);
    this.object.add(this.buttonPos);

    this.buttonNeg = new THREE.Mesh(buttonGeo, buttonMat);
    this.buttonNeg.rotation.z = WATCH_BUTTON_ROT_Z;
    this.buttonNeg.position.set(0, WATCH_BUTTON_POS_Y, -WATCH_BUTTON_POS_Z);
    this.object.add(this.buttonNeg);

    this.axesHelper = new THREE.AxesHelper(WATCH_BODY_SIZE / 2);
    this.axesHelper.visible = false;
    this.object.add(this.axesHelper);

    parent.add(this.object);
  }

  getMeshes() {
    return [this.body, this.face, this.buttonPos, this.buttonNeg];
  }

  setHelpersVisible(visible) {
    this.axesHelper.visible = visible;
  }
}

export { Watch };

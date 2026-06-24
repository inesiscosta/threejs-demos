
import * as THREE from "three";
import { STRAP_LENGTH, STRAP_WIDTH, STRAP_HEIGHT, STRAP_BEND, STRAP_TIP, STRAP_COLOR } from "./constants.js";

class Strap {
  constructor(parent, offsetY = 0) {
    const geo = new THREE.BoxGeometry(STRAP_WIDTH, STRAP_HEIGHT, STRAP_LENGTH, 1, 1, 40);
    const pos = geo.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      const z = pos.getZ(i);
      const t = (2 * z) / STRAP_LENGTH;             // -1 to 1
      const mainBend = (1 - Math.cos(t * Math.PI)) * STRAP_BEND;
      const tipCurl  = Math.pow(Math.abs(t), 4) * STRAP_TIP;
      pos.setY(i, pos.getY(i) - mainBend - tipCurl);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();

    this.mesh = new THREE.Mesh(
      geo,
      new THREE.MeshBasicMaterial({ color: STRAP_COLOR }),
    );
    this.mesh.position.set(0, offsetY, 0);
    parent.add(this.mesh);
  }
}

export { Strap };

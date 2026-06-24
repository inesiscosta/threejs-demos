import * as THREE from 'three';

import { BALLOON_RADIUS, KNOT_RADIUS, KNOT_HEIGHT, RIBBON_RADIUS, RIBBON_HEIGHT, BALLOON_COLOR, RIBBON_COLOR, POP_DURATION } from './constants.js';



class Balloon {
    constructor(scene, x, y, z) {
        'use strict';
        this.scene = scene;

        const bodyMat = new THREE.MeshBasicMaterial({ color: BALLOON_COLOR });
        const ribbonMat = new THREE.MeshBasicMaterial({ color: RIBBON_COLOR });

        // (i) Body — sphere
        const body = new THREE.Mesh(
            new THREE.SphereGeometry(BALLOON_RADIUS, 16, 12),
            bodyMat
        );

        // (ii) Knot — small inverted cone at bottom of sphere
        const knot = new THREE.Mesh(
            new THREE.ConeGeometry(KNOT_RADIUS, KNOT_HEIGHT, 8),
            bodyMat
        );
        knot.rotation.z = Math.PI;  // point downward
        knot.position.y = -(BALLOON_RADIUS + KNOT_HEIGHT / 2);

        // (iii) Ribbon — thin cylinder hanging below knot
        const ribbon = new THREE.Mesh(
            new THREE.CylinderGeometry(RIBBON_RADIUS, RIBBON_RADIUS, RIBBON_HEIGHT, 8),
            ribbonMat
        );
        ribbon.position.y = -(BALLOON_RADIUS + KNOT_HEIGHT + RIBBON_HEIGHT / 2);

        this.body = body;
        this.knot = knot;
        this.ribbon = ribbon;

        this.group = new THREE.Object3D();
        this.group.add(body, knot, ribbon);
        this.group.position.set(x, y, z);

        // AxesHelper (hidden by default, toggled via H)
        this.axesHelper = new THREE.AxesHelper(BALLOON_RADIUS * 2);
        this.axesHelper.visible = false;
        this.group.add(this.axesHelper);

        scene.add(this.group);

        // Bounding sphere radius for collision detection
        this.collisionRadius = BALLOON_RADIUS;

        this.isAlive = true;
        this.isPopping = false;
        this.popTimer = 0;
    }

    pop() {
        this.isPopping = true;
        this.popTimer = 0;
    }

    /** Returns the balloon body's world-space position. */
    getWorldPosition() {
        const pos = new THREE.Vector3();
        this.group.getWorldPosition(pos);
        return pos;
    }

    getMeshes() {
        return [this.body, this.knot, this.ribbon];
    }

    setHelpersVisible(visible) {
        this.axesHelper.visible = visible;
    }

    /** Remove this balloon from the scene (called on collision). */
    remove() {
        this.scene.remove(this.group);
    }

    update(dt) {
        'use strict';
        if (!this.isPopping) return;
        this.popTimer += dt;
        const t = Math.min(this.popTimer / POP_DURATION, 1);
        this.group.scale.setScalar(1 - t);
        if (t >= 1) {
            this.remove();
            this.isAlive = false;
            this.isPopping = false;
        }
    }
}

export { Balloon };

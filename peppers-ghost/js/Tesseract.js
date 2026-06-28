import * as THREE from "three";
import {
  TESSERACT_FACE_COLOR, TESSERACT_FACE_OPACITY,
  TESSERACT_CONN_COLOR, TESSERACT_CONN_OPACITY,
  TESSERACT_SHININESS, TESSERACT_SPECULAR,
  NORMALMAP_SIZE, NORMALMAP_RINGS,
} from "./constants.js";



class Tesseract {
  constructor() {
    this.group = new THREE.Group();
    this._mesh = null;

    const normalMap = this._generateConcentricNormalMap();

    this._mats = {
      faceLambert: new THREE.MeshLambertMaterial({
        color: TESSERACT_FACE_COLOR, transparent: true, opacity: TESSERACT_FACE_OPACITY,
        normalMap, side: THREE.DoubleSide, depthWrite: false,
      }),
      facePhong: new THREE.MeshPhongMaterial({
        color: TESSERACT_FACE_COLOR, shininess: TESSERACT_SHININESS, specular: TESSERACT_SPECULAR,
        transparent: true, opacity: TESSERACT_FACE_OPACITY,
        normalMap, side: THREE.DoubleSide, depthWrite: false,
      }),
      faceUnlit: new THREE.MeshBasicMaterial({
        color: TESSERACT_FACE_COLOR, transparent: true, opacity: TESSERACT_FACE_OPACITY,
        side: THREE.DoubleSide, depthWrite: false,
      }),
      connLambert: new THREE.MeshLambertMaterial({
        color: TESSERACT_CONN_COLOR, transparent: true, opacity: TESSERACT_CONN_OPACITY,
        side: THREE.DoubleSide, depthWrite: false,
      }),
      connPhong: new THREE.MeshPhongMaterial({
        color: TESSERACT_CONN_COLOR, shininess: TESSERACT_SHININESS, specular: TESSERACT_SPECULAR,
        transparent: true, opacity: TESSERACT_CONN_OPACITY,
        side: THREE.DoubleSide, depthWrite: false,
      }),
      connUnlit: new THREE.MeshBasicMaterial({
        color: TESSERACT_CONN_COLOR, transparent: true, opacity: TESSERACT_CONN_OPACITY,
        side: THREE.DoubleSide, depthWrite: false,
      }),
    };

    this._build();
  }

  getMesh() { return this.group; }

  setMaterial(matIdx, lit) {
    let face, conn;
    if (!lit) {
      face = this._mats.faceUnlit;
      conn = this._mats.connUnlit;
    } else if (matIdx === 1) {
      face = this._mats.facePhong;
      conn = this._mats.connPhong;
    } else {
      face = this._mats.faceLambert;
      conn = this._mats.connLambert;
    }
    this._mesh.material = [face, conn];
  }

  _build() {
    const I = 1 / 3;
    const v = [
      // 0–7: inner cube (w = -1)
      new THREE.Vector3(-I, -I, -I), //  0
      new THREE.Vector3(I, -I, -I), //  1
      new THREE.Vector3(I, I, -I), //  2
      new THREE.Vector3(-I, I, -I), //  3
      new THREE.Vector3(-I, -I, I), //  4
      new THREE.Vector3(I, -I, I), //  5
      new THREE.Vector3(I, I, I), //  6
      new THREE.Vector3(-I, I, I), //  7
      // 8–15: outer cube (w = +1)
      new THREE.Vector3(-1, -1, -1), //  8
      new THREE.Vector3(1, -1, -1), //  9
      new THREE.Vector3(1, 1, -1), // 10
      new THREE.Vector3(-1, 1, -1), // 11
      new THREE.Vector3(-1, -1, 1), // 12
      new THREE.Vector3(1, -1, 1), // 13
      new THREE.Vector3(1, 1, 1), // 14
      new THREE.Vector3(-1, 1, 1), // 15
    ];

    // quads [v0, v1, v2, v3] — outer + inner cube faces (12 total)
    const faceQuads = [
      [12, 13, 14, 15], // outer front  (+z)
      [9, 8, 11, 10], // outer back   (-z)
      [8, 12, 15, 11], // outer left   (-x)
      [13, 9, 10, 14], // outer right  (+x)
      [8, 9, 13, 12], // outer bottom (-y)
      [15, 14, 10, 11], // outer top    (+y)
      [4, 5, 6, 7], // inner front  (+z)
      [1, 0, 3, 2], // inner back   (-z)
      [0, 4, 7, 3], // inner left   (-x)
      [5, 1, 2, 6], // inner right  (+x)
      [0, 1, 5, 4], // inner bottom (-y)
      [7, 6, 2, 3], // inner top    (+y)
    ];

    // quads — trapezoidal connectors (12 total)
    const connQuads = [
      [8, 9, 1, 0], // bottom back
      [9, 13, 5, 1], // bottom right
      [13, 12, 4, 5], // bottom front
      [12, 8, 0, 4], // bottom left
      [11, 10, 2, 3], // top back
      [10, 14, 6, 2], // top right
      [14, 15, 7, 6], // top front
      [15, 11, 3, 7], // top left
      [8, 11, 3, 0], // pillar back-left
      [9, 10, 2, 1], // pillar back-right
      [13, 14, 6, 5], // pillar front-right
      [12, 15, 7, 4], // pillar front-left
    ];

    // face quads first (group 0), then connector quads (group 1)
    const allQuads = [...faceQuads, ...connQuads];
    const nFace = faceQuads.length, nConn = connQuads.length;
    const N = 4; // NxN subdivision per quad for smooth per-vertex lighting
    const indicesPerQuad = N * N * 6;

    this._mesh = this._buildMesh(allQuads, v, [
      { start: 0, count: nFace * indicesPerQuad, matIndex: 0 },
      { start: nFace * indicesPerQuad, count: nConn * indicesPerQuad, matIndex: 1 },
    ], [this._mats.faceLambert, this._mats.connLambert], N);
    this.group.add(this._mesh);
  }

  _buildMesh(quads, v, groups, material, N = 1) {
    const nQ = quads.length;
    const vertsPerQuad = (N + 1) * (N + 1);
    const idxPerQuad = N * N * 6;
    const pos = new Float32Array(nQ * vertsPerQuad * 3);
    const nor = new Float32Array(nQ * vertsPerQuad * 3);
    const uv = new Float32Array(nQ * vertsPerQuad * 2);
    const idx = new Uint16Array(nQ * idxPerQuad);

    const e1 = new THREE.Vector3();
    const e2 = new THREE.Vector3();
    const n = new THREE.Vector3();

    let vOff = 0; // running vertex offset (absolute)
    let iOff = 0; // running index offset

    for (let q = 0; q < nQ; q++) {
      const [i0, i1, i2, i3] = quads[q];
      const v0 = v[i0], v1 = v[i1], v2 = v[i2], v3 = v[i3];

      e1.subVectors(v1, v0);
      e2.subVectors(v3, v0);
      n.crossVectors(e1, e2).normalize();

      const vStart = vOff;

      // (N+1)×(N+1) vertices via bilinear interpolation over the quad
      for (let row = 0; row <= N; row++) {
        const t = row / N;
        for (let col = 0; col <= N; col++) {
          const u = col / N;
          const w00 = (1 - u) * (1 - t), w10 = u * (1 - t);
          const w11 = u * t, w01 = (1 - u) * t;

          const p = vOff * 3;
          pos[p] = w00 * v0.x + w10 * v1.x + w11 * v2.x + w01 * v3.x;
          pos[p + 1] = w00 * v0.y + w10 * v1.y + w11 * v2.y + w01 * v3.y;
          pos[p + 2] = w00 * v0.z + w10 * v1.z + w11 * v2.z + w01 * v3.z;

          nor[p] = n.x; nor[p + 1] = n.y; nor[p + 2] = n.z;

          const uvp = vOff * 2;
          uv[uvp] = u; uv[uvp + 1] = t;

          vOff++;
        }
      }

      // N×N sub-quads → 2 triangles each
      for (let row = 0; row < N; row++) {
        for (let col = 0; col < N; col++) {
          const a = vStart + row * (N + 1) + col;
          const b = a + 1;
          const c = a + (N + 1) + 1;
          const d = a + (N + 1);

          idx[iOff++] = a; idx[iOff++] = b; idx[iOff++] = c;
          idx[iOff++] = a; idx[iOff++] = c; idx[iOff++] = d;
        }
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setIndex(new THREE.BufferAttribute(idx, 1));
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
    geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
    for (const { start, count, matIndex } of groups)
      geo.addGroup(start, count, matIndex);
    geo.computeTangents();
    return new THREE.Mesh(geo, material);
  }

  // Canvas-based normal map with concentric cosine rings.
  _generateConcentricNormalMap(size = NORMALMAP_SIZE, rings = NORMALMAP_RINGS) {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    const img = ctx.createImageData(size, size);
    const d = img.data;
    const cx = size / 2, cy = size / 2;
    const eps = 2.0 / size;
    const h = (r) => Math.cos(r * rings * Math.PI * 2) * 0.5 + 0.5;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = (x - cx) / cx;
        const dy = (y - cy) / cy;
        const r = Math.sqrt(dx * dx + dy * dy);

        const h0 = h(r);
        const hx = h(Math.sqrt((dx + eps) * (dx + eps) + dy * dy));
        const hy = h(Math.sqrt(dx * dx + (dy + eps) * (dy + eps)));

        const str = 4.0;
        let nx = (h0 - hx) * str, ny = (h0 - hy) * str, nz = 1.0;
        const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
        nx /= len; ny /= len; nz /= len;

        const i = (y * size + x) * 4;
        d[i] = ((nx * 0.5 + 0.5) * 255) | 0;
        d[i + 1] = ((ny * 0.5 + 0.5) * 255) | 0;
        d[i + 2] = ((nz * 0.5 + 0.5) * 255) | 0;
        d[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    return new THREE.CanvasTexture(canvas);
  }
}

export { Tesseract };

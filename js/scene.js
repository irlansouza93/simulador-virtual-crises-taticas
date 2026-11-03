// Carta topográfica em relevo (Three.js): terreno com curvas de nível e quadrícula UTM,
// miniaturas de viaturas, aeronaves e postos inimigos, e as sequências de cada decisão.
import * as THREE from "three";
import { NODES, EDGES, edgeKey, PLANNED_ROUTE, listSimpleRoutes } from "./routing.js";
import { roleSymbolSVG } from "./characters.js";

const SIZE = 128;
const HALF = SIZE / 2;
const WATER = 1.1;
const BASE_Y = -16;

const C = {
  paper: 0xefe6cf, sepia: 0x8a5a2b, ink: 0x1d1d1b, water: 0x5b8fc9, veg: 0xc9d6a3,
  red: 0xc8302a, blue: 0x1f4fa8, friendly: 0x5b7096, hostile: 0xa8443a, olive: 0x5f6648,
  tree: 0x6d8650, road: 0xd98b3a, rock: 0x8b7355
};

function vec3Hex(hex) {
  return new THREE.Vector3(((hex >> 16) & 255) / 255, ((hex >> 8) & 255) / 255, (hex & 255) / 255);
}

// ---------- relevo ----------
function hash2(ix, iz) {
  let h = (ix * 374761393 + iz * 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}
function vnoise(x, z) {
  const ix = Math.floor(x), iz = Math.floor(z);
  const fx = x - ix, fz = z - iz;
  const sx = fx * fx * (3 - 2 * fx), sz = fz * fz * (3 - 2 * fz);
  const a = hash2(ix, iz), b = hash2(ix + 1, iz), c = hash2(ix, iz + 1), d = hash2(ix + 1, iz + 1);
  return a + (b - a) * sx + (c - a) * sz + (a - b - c + d) * sx * sz;
}
function fbm(x, z, oct = 5) {
  let s = 0, a = 0.5, f = 1;
  for (let i = 0; i < oct; i++) { s += a * vnoise(x * f, z * f); a *= 0.5; f *= 2.03; }
  return s;
}
function gauss(x, z, cx, cz, s) {
  const dx = x - cx, dz = z - cz;
  return Math.exp(-(dx * dx + dz * dz) / (2 * s * s));
}
export function riverX(z) { return 12 + 9 * Math.sin(z * 0.05 + 0.6); }

export function heightAt(x, z) {
  let h = fbm(x * 0.032 + 11.3, z * 0.032 + 4.7) * 15 - 2;
  h += 19 * gauss(x, z, 33, -30, 12);          // Serra do abrigo
  h += 10 * gauss(x, z, 8, 2, 9);              // Morro da torre
  h += 8 * gauss(x, z, -30, -28, 14);
  h -= 6 * gauss(x, z, -40, 38, 10);           // baixada do posto de comando
  const dr = x - riverX(z);
  h -= 6.5 * Math.exp(-(dr * dr) / (2 * 2.6 * 2.6));
  const edge = Math.max(Math.abs(x), Math.abs(z)) / HALF;
  h *= 1 - Math.pow(Math.max(0, edge - 0.86) / 0.14, 2) * 0.6;
  return Math.max(h, WATER - 1.4);
}
function vegAt(x, z) {
  return THREE.MathUtils.smoothstep(fbm(x * 0.06 - 7, z * 0.06 + 13, 3), 0.48, 0.6);
}

// ---------- shaders ----------
const terrainVert = `
  attribute float aVeg;
  varying vec3 vPos; varying vec3 vN; varying float vVeg;
  void main(){
    vPos = (modelMatrix * vec4(position,1.0)).xyz;
    vN = normalize(mat3(modelMatrix) * normal);
    vVeg = aVeg;
    gl_Position = projectionMatrix * viewMatrix * vec4(vPos,1.0);
  }`;
const terrainFrag = `
  uniform vec3 uPaper, uSepia, uInk, uWater, uVeg, uRed, uBlue;
  uniform vec3 uSun; uniform float uDay, uTime, uWaterLevel;
  uniform vec4 uAnomaly; uniform vec3 uHole; uniform vec4 uJam;
  varying vec3 vPos; varying vec3 vN; varying float vVeg;
  float lineAA(float v, float w){ float f = abs(fract(v - 0.5) - 0.5) / max(fwidth(v), 1e-4); return 1.0 - min(f / w, 1.0); }
  void main(){
    if (uHole.z > 0.0 && distance(vPos.xz, uHole.xy) < uHole.z) discard;
    vec3 n = normalize(vN);
    float shade = clamp(dot(n, normalize(uSun)), 0.0, 1.0);
    vec3 col = mix(uPaper, uVeg, vVeg * 0.8);
    col *= mix(1.03, 0.9, smoothstep(0.0, 34.0, vPos.y));
    float w = 1.0 - smoothstep(uWaterLevel - 0.1, uWaterLevel + 0.35, vPos.y);
    col = mix(col, uWater, w * 0.9);
    col *= 0.6 + 0.5 * shade;
    float minor = lineAA(vPos.y / 1.25, 1.0);
    float major = lineAA(vPos.y / 6.25, 1.7);
    col = mix(col, uSepia, max(minor * 0.42, major * 0.85) * (1.0 - w));
    vec2 g = vPos.xz / 10.0;
    float gx = lineAA(g.x, 1.0), gz = lineAA(g.y, 1.0);
    col = mix(col, uInk, max(gx, gz) * 0.28);
    if (uAnomaly.w > 0.0) {
      float d = distance(vPos.xz, uAnomaly.xy) / uAnomaly.z;
      float rings = lineAA(d * 5.0, 1.6) * step(d, 1.0);
      col = mix(col, uBlue, rings * uAnomaly.w * 0.95);
      col = mix(col, uBlue, (1.0 - smoothstep(0.0, 1.0, d)) * 0.22 * uAnomaly.w);
    }
    if (uJam.w > 0.0) {
      float d = distance(vPos.xz, uJam.xy);
      float inside = 1.0 - smoothstep(uJam.z - 0.6, uJam.z, d);
      float hatch = step(0.62, fract((vPos.x + vPos.z) * 0.35 - uTime * 0.25));
      col = mix(col, uRed, inside * hatch * 0.1 * uJam.w);
      float edgeRing = lineAA(d / uJam.z, 2.5) * step(abs(d - uJam.z), 1.2);
      col = mix(col, uRed, edgeRing * uJam.w * 0.8);
    }
    vec3 night = col * vec3(0.82, 0.6, 0.55) * 0.7;
    col = mix(night, col, uDay);
    gl_FragColor = vec4(col, 1.0);
  }`;

const strataFrag = `
  uniform vec3 uSepia, uPaper; uniform float uDay;
  varying vec3 vPos;
  void main(){
    float b = fract(vPos.y * 0.22 + sin(vPos.x * 0.08 + vPos.z * 0.05) * 0.4);
    vec3 col = mix(uPaper * 0.78, uSepia * 1.05, step(0.5, b) * 0.55 + 0.2);
    float l = abs(fract(vPos.y * 0.22 - 0.5) - 0.5) / fwidth(vPos.y * 0.22);
    col = mix(col, uSepia * 0.6, (1.0 - min(l, 1.0)) * 0.6);
    col *= 0.78;
    vec3 night = col * vec3(0.82, 0.6, 0.55) * 0.7;
    gl_FragColor = vec4(mix(night, col, uDay), 1.0);
  }`;
const strataVert = `varying vec3 vPos; void main(){ vPos = (modelMatrix*vec4(position,1.0)).xyz; gl_Position = projectionMatrix*viewMatrix*vec4(vPos,1.0); }`;

const domeFrag = `
  uniform vec3 uRed; uniform float uTime, uOpacity;
  varying vec3 vPos; varying vec3 vN;
  void main(){
    float rings = step(0.82, fract(vPos.y * 0.35 - uTime * 0.8));
    float fres = pow(1.0 - abs(dot(normalize(vN), vec3(0.0, 0.0, 1.0))), 1.5);
    float a = (rings * 0.16 + 0.05 + fres * 0.1) * uOpacity;
    gl_FragColor = vec4(uRed, a);
  }`;
const domeVert = `varying vec3 vPos; varying vec3 vN; void main(){ vPos = position; vN = normalize(normalMatrix*normal); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`;

// ---------- utilidades de modelo ----------
function mat(color, opts = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0.05, flatShading: true, ...opts });
}
function box(w, h, d, color, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), typeof color === "number" ? mat(color) : color);
  m.position.set(x, y, z);
  m.castShadow = true;
  return m;
}
function cyl(rt, rb, h, color, seg = 10) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat(color));
  m.castShadow = true;
  return m;
}

const ease = {
  out: t => 1 - Math.pow(1 - t, 3),
  inOut: t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  expo: t => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  lin: t => t
};

export class MapWorld {
  constructor(container, labelLayer, { reducedMotion = false } = {}) {
    this.container = container;
    this.labelLayer = labelLayer;
    this.reducedMotion = reducedMotion;
    this.speed = 1;
    this.time = 0;
    this.tasks = new Set();
    this.labels = [];
    this.temp = [];
    this.daylight = 1;
    this.cam = { target: new THREE.Vector3(0, 6, 4), dist: 125, az: -0.5, el: 0.82 };
    this.camOffset = { az: 0, el: 0, zoom: 1 };
    this.shake = 0;
    this.frameShift = 0;
    this.frameShiftTarget = 0;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 760 ? 1.5 : 2));
    this.renderer.shadowMap.enabled = false;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(38, 1, 0.5, 900);

    this.hemi = new THREE.HemisphereLight(0xfff6e2, 0x4a4436, 1.5);
    this.scene.add(this.hemi);
    this.sun = new THREE.DirectionalLight(0xfff1d6, 2.4);
    this.sun.position.set(-60, 90, 40);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    const sc = this.sun.shadow.camera;
    sc.left = -80; sc.right = 80; sc.top = 80; sc.bottom = -80; sc.near = 10; sc.far = 260;
    this.sun.shadow.bias = -0.0008;
    this.scene.add(this.sun);
    this.nightLamp = new THREE.PointLight(0xff5a3c, 0, 260, 1.4);
    this.nightLamp.position.set(-20, 70, 30);
    this.scene.add(this.nightLamp);

    this.buildTerrain();
    this.buildRiverAndLabels();
    this.buildRoads();
    this.buildTrees();
    this.buildBase();
    this.buildShelter();
    this.buildJammer();
    this.buildSatellites();
    this.buildFiber();
    this.buildHostilePosts();
    this.buildFleet();
    this.buildAircraft();

    this.resize();
    window.addEventListener("resize", () => this.resize());
    this.bindPointer();
    this.clock = new THREE.Clock();
    this.renderer.setAnimationLoop(() => this.frame());
  }

  // ---------- construção ----------
  buildTerrain() {
    const seg = 200;
    const geo = new THREE.PlaneGeometry(SIZE, SIZE, seg, seg);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position;
    const veg = new Float32Array(pos.count);
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i);
      pos.setY(i, heightAt(x, z));
      veg[i] = vegAt(x, z);
    }
    geo.setAttribute("aVeg", new THREE.BufferAttribute(veg, 1));
    geo.computeVertexNormals();
    this.uniforms = {
      uPaper: { value: vec3Hex(C.paper) }, uSepia: { value: vec3Hex(C.sepia) }, uInk: { value: vec3Hex(C.ink) },
      uWater: { value: vec3Hex(C.water) }, uVeg: { value: vec3Hex(C.veg) }, uRed: { value: vec3Hex(C.red) },
      uBlue: { value: vec3Hex(C.blue) }, uSun: { value: new THREE.Vector3(-0.6, 0.9, 0.4) },
      uDay: { value: 1 }, uTime: { value: 0 }, uWaterLevel: { value: WATER },
      uAnomaly: { value: new THREE.Vector4(33, -28, 13, 0) }, uHole: { value: new THREE.Vector3(30, -26, 0) },
      uJam: { value: new THREE.Vector4(6, 4, 30, 0) }
    };
    this.terrain = new THREE.Mesh(geo, new THREE.ShaderMaterial({ uniforms: this.uniforms, vertexShader: terrainVert, fragmentShader: terrainFrag }));
    this.terrain.receiveShadow = true;
    this.scene.add(this.terrain);

    // Laterais do bloco de relevo, com estratos de rocha.
    const strataMat = new THREE.ShaderMaterial({
      uniforms: { uSepia: this.uniforms.uSepia, uPaper: this.uniforms.uPaper, uDay: this.uniforms.uDay },
      vertexShader: strataVert, fragmentShader: strataFrag, side: THREE.DoubleSide
    });
    this.strataMat = strataMat;
    const n = 160;
    const sides = [
      (t) => [-HALF + t * SIZE, HALF], (t) => [HALF, HALF - t * SIZE],
      (t) => [HALF - t * SIZE, -HALF], (t) => [-HALF, -HALF + t * SIZE]
    ];
    for (const side of sides) {
      const verts = [], idx = [];
      for (let i = 0; i <= n; i++) {
        const [x, z] = side(i / n);
        verts.push(x, heightAt(x, z), z, x, BASE_Y, z);
        if (i < n) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
      g.setIndex(idx);
      this.scene.add(new THREE.Mesh(g, strataMat));
    }
    const bottom = new THREE.Mesh(new THREE.PlaneGeometry(SIZE, SIZE), new THREE.MeshBasicMaterial({ color: 0x2a2620 }));
    bottom.rotation.x = Math.PI / 2;
    bottom.position.y = BASE_Y;
    this.scene.add(bottom);
  }

  buildRiverAndLabels() {
    const water = new THREE.Mesh(
      new THREE.PlaneGeometry(SIZE - 0.2, SIZE - 0.2),
      new THREE.MeshStandardMaterial({ color: 0x4f85c4, roughness: 0.3, metalness: 0.1, transparent: true, opacity: 0.85 })
    );
    water.rotation.x = -Math.PI / 2;
    water.position.y = WATER - 0.05;
    water.receiveShadow = true;
    this.waterMesh = water;
    this.scene.add(water);

    const L = (text, x, z, cls, dy = 1.2) => this.addLabel(text, new THREE.Vector3(x, heightAt(x, z) + dy, z), cls);
    L("Rio Areia Branca", riverX(-44), -44, "water", 0.6);
    L("Serra do Cume Partido", 42, -46, "relief", 3);
    L("Morro da Torre", 8, -6, "relief", 3);
    L("Vale do Socorro", -18, 14, "place", 2);
    L("Cota 1.214", 33, -30, "spot", 1.2);
    L("Posto de Comando", NODES.PC.x, NODES.PC.z + 5, "friendly", 2);
  }

  addLabel(text, pos, cls = "place") {
    const el = document.createElement("div");
    el.className = `map-label ${cls}`;
    el.textContent = text;
    this.labelLayer.appendChild(el);
    const label = { el, pos, visible: true };
    this.labels.push(label);
    return label;
  }

  removeLabel(label) {
    label.el.remove();
    this.labels = this.labels.filter(l => l !== label);
  }

  roadPoints(a, b, step = 1) {
    const p = NODES[a], q = NODES[b];
    const len = Math.hypot(q.x - p.x, q.z - p.z);
    const n = Math.max(2, Math.ceil(len / step));
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const x = p.x + (q.x - p.x) * t, z = p.z + (q.z - p.z) * t;
      pts.push(new THREE.Vector3(x, Math.max(heightAt(x, z), WATER) + 0.18, z));
    }
    return pts;
  }

  ribbon(points, width, color, { dashed = false, lift = 0 } = {}) {
    const verts = [], idx = [];
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      const q = points[Math.min(i + 1, points.length - 1)], o = points[Math.max(i - 1, 0)];
      const dir = new THREE.Vector3().subVectors(q, o).setY(0).normalize();
      const side = new THREE.Vector3(-dir.z, 0, dir.x).multiplyScalar(width / 2);
      verts.push(p.x + side.x, p.y + lift, p.z + side.z, p.x - side.x, p.y + lift, p.z - side.z);
      if (i < points.length - 1 && (!dashed || i % 2 === 0)) {
        const a = i * 2;
        idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color, roughness: 0.95, polygonOffset: true, polygonOffsetFactor: -2 }));
    m.receiveShadow = true;
    return m;
  }

  buildRoads() {
    this.roads = {};
    for (const [a, b, kind] of EDGES) {
      const pts = this.roadPoints(a, b, 0.8);
      const group = new THREE.Group();
      if (kind === "estrada") {
        group.add(this.ribbon(pts, 1.25, 0x3b332b));
        group.add(this.ribbon(pts, 0.8, C.road, { lift: 0.02 }));
      } else {
        group.add(this.ribbon(pts, 0.55, 0x3b332b, { dashed: true }));
      }
      this.scene.add(group);
      this.roads[edgeKey(a, b)] = { group, pts, kind };
    }
  }

  buildTrees() {
    const geo = new THREE.IcosahedronGeometry(0.85, 0);
    const material = mat(C.tree);
    const count = 900;
    const mesh = new THREE.InstancedMesh(geo, material, count);
    mesh.castShadow = true;
    const dummy = new THREE.Object3D();
    let placed = 0, tries = 0;
    const segs = EDGES.map(([a, b]) => [NODES[a], NODES[b]]);
    const nearRoad = (x, z) => segs.some(([p, q]) => {
      const vx = q.x - p.x, vz = q.z - p.z;
      const t = Math.max(0, Math.min(1, ((x - p.x) * vx + (z - p.z) * vz) / (vx * vx + vz * vz)));
      return Math.hypot(x - (p.x + vx * t), z - (p.z + vz * t)) < 1.8;
    });
    while (placed < count && tries < 20000) {
      tries++;
      const x = (Math.random() - 0.5) * (SIZE - 4), z = (Math.random() - 0.5) * (SIZE - 4);
      if (vegAt(x, z) < 0.45 || Math.random() > vegAt(x, z)) continue;
      const y = heightAt(x, z);
      if (y < WATER + 0.4 || nearRoad(x, z)) continue;
      const s = 0.7 + Math.random() * 0.9;
      dummy.position.set(x, y + 0.6 * s, z);
      dummy.scale.set(s, s * (1.1 + Math.random() * 0.5), s);
      dummy.rotation.y = Math.random() * Math.PI;
      dummy.updateMatrix();
      mesh.setMatrixAt(placed++, dummy.matrix);
    }
    mesh.count = placed;
    this.scene.add(mesh);
  }

  marker(glyph, hostile, scale = 3.2) {
    const img = new Image();
    const tex = new THREE.Texture(img);
    tex.colorSpace = THREE.SRGBColorSpace;
    img.onload = () => { tex.needsUpdate = true; };
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(roleSymbolSVG(glyph, { size: 128, hostile }));
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true }));
    s.scale.set(scale, scale, 1);
    s.renderOrder = 10;
    return s;
  }

  place(obj, x, z, lift = 0) {
    obj.position.set(x, Math.max(heightAt(x, z), WATER) + lift, z);
    this.scene.add(obj);
    return obj;
  }

  buildBase() {
    const g = new THREE.Group();
    const tent = new THREE.Mesh(new THREE.CylinderGeometry(0, 2.6, 2.2, 4), mat(C.olive));
    tent.rotation.y = Math.PI / 4; tent.position.y = 1.1; tent.castShadow = true;
    g.add(tent);
    const mast = cyl(0.08, 0.12, 6, 0x3b3b33); mast.position.set(2.4, 3, 0); g.add(mast);
    const helipad = new THREE.Mesh(new THREE.CircleGeometry(2.4, 24), mat(0x3d3a32));
    helipad.rotation.x = -Math.PI / 2; helipad.position.set(-4, 0.05, 2); g.add(helipad);
    const m = this.marker("med", false, 3); m.position.set(0, 6, 0); g.add(m);
    this.place(g, NODES.PC.x, NODES.PC.z);
    this.base = g;
  }

  buildShelter() {
    const S = NODES.ABR;
    const surface = heightAt(S.x, S.z);
    this.shelterDepth = surface - 11;
    const g = new THREE.Group();
    g.add(box(6, 2.6, 4.2, 0x4a4b40, 0, 1.3, 0));
    g.add(box(6.2, 0.3, 4.4, 0x2f3029, 0, 2.75, 0));
    const lamp = new THREE.PointLight(0xffd9a0, 0, 16, 1.5);
    lamp.position.set(0, 2, 0);
    g.add(lamp);
    for (let i = -1; i <= 1; i++) g.add(box(1.4, 0.5, 0.7, 0xe9e2d0, i * 1.8, 0.4, 1.2));
    const cross = box(0.25, 1.2, 0.05, C.red, 0, 1.4, 2.12); const cross2 = box(1.2, 0.25, 0.05, C.red, 0, 1.4, 2.12);
    g.add(cross, cross2);
    g.position.set(S.x, this.shelterDepth, S.z);
    g.visible = false;
    this.scene.add(g);
    this.shelter = { group: g, lamp };

    // Poço de corte: parede cilíndrica que acompanha o relevo.
    const R = 7.5, n = 64, verts = [], idx = [];
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * Math.PI * 2;
      const x = S.x + Math.cos(a) * R, z = S.z + Math.sin(a) * R;
      verts.push(x, heightAt(x, z), z, x, this.shelterDepth - 1, z);
      if (i < n) { const k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
    }
    const wg = new THREE.BufferGeometry();
    wg.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
    wg.setIndex(idx);
    const wall = new THREE.Mesh(wg, this.strataMat);
    const floor = new THREE.Mesh(new THREE.CircleGeometry(R, 48), new THREE.MeshStandardMaterial({ color: 0x3b3328 }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(S.x, this.shelterDepth - 1, S.z);
    wall.visible = floor.visible = false;
    this.scene.add(wall, floor);
    this.cut = { wall, floor, R };
  }

  buildJammer() {
    const x = 8, z = 2;
    const g = new THREE.Group();
    const h = 9;
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const leg = cyl(0.08, 0.1, h + 0.4, 0x6a2c25, 5);
      leg.position.set(Math.cos(a) * 0.7, h / 2, Math.sin(a) * 0.7);
      leg.rotation.z = Math.cos(a) * 0.08; leg.rotation.x = -Math.sin(a) * 0.08;
      g.add(leg);
    }
    for (let y = 1.5; y < h; y += 1.8) g.add(box(1.5 - y * 0.08, 0.1, 1.5 - y * 0.08, 0x6a2c25, 0, y, 0));
    const dish = new THREE.Mesh(new THREE.SphereGeometry(1.1, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2.4), mat(0xcfc6b0, { side: THREE.DoubleSide }));
    dish.rotation.x = Math.PI / 2.2; dish.position.set(0, h - 0.5, 0.8);
    g.add(dish);
    const mk = this.marker("jam", true, 3.4); mk.position.set(0, h + 3, 0); g.add(mk);
    this.place(g, x, z);
    this.jammer = g;
    this.uniforms.uJam.value.set(x, z, 26, 0);

    const domeMat = new THREE.ShaderMaterial({
      uniforms: { uRed: this.uniforms.uRed, uTime: this.uniforms.uTime, uOpacity: { value: 0 } },
      vertexShader: domeVert, fragmentShader: domeFrag, transparent: true, depthWrite: false, side: THREE.DoubleSide
    });
    const dome = new THREE.Mesh(new THREE.SphereGeometry(26, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2), domeMat);
    dome.position.set(x, heightAt(x, z) - 4, z);
    dome.visible = false;
    this.scene.add(dome);
    this.dome = dome;
  }

  buildSatellites() {
    this.sats = [];
    for (let i = 0; i < 3; i++) {
      const g = new THREE.Group();
      g.add(box(1.2, 1.2, 1.6, 0xc9c2ae));
      g.add(box(4, 0.08, 1.2, 0x2a3f6b, -2.7, 0, 0), box(4, 0.08, 1.2, 0x2a3f6b, 2.7, 0, 0));
      g.position.set(-40 + i * 40, 62 + i * 4, -50 + i * 10);
      this.scene.add(g);
      const lineGeo = new THREE.BufferGeometry().setFromPoints([g.position.clone(), new THREE.Vector3(-20, heightAt(-20, 20), 20)]);
      const line = new THREE.Line(lineGeo, new THREE.LineDashedMaterial({ color: C.blue, dashSize: 1.4, gapSize: 1, transparent: true, opacity: 0.7 }));
      line.computeLineDistances();
      this.scene.add(line);
      this.sats.push({ g, line, phase: i * 2.1 });
    }
  }

  buildFiber() {
    const P = NODES.PC, S = NODES.ABR;
    const ctrl = [[S.x - 3, S.z + 4], [16, -6], [2, 16], [-18, 26], [-30, 34], [P.x + 3, P.z - 1]];
    const pts = ctrl.map(([x, z]) => new THREE.Vector3(x, Math.max(heightAt(x, z), WATER) + 0.35, z));
    this.fiberCurve = new THREE.CatmullRomCurve3(pts);
    const samples = this.fiberCurve.getSpacedPoints(220).map(p => new THREE.Vector3(p.x, Math.max(heightAt(p.x, p.z), WATER) + 0.3, p.z));
    this.fiberCurve = new THREE.CatmullRomCurve3(samples);
    const tube = new THREE.Mesh(new THREE.TubeGeometry(this.fiberCurve, 300, 0.18, 6), mat(0x2b4f86));
    this.scene.add(tube);
    this.fiber = tube;

    // Posto adversário de escuta: van + derivação no cabo + cofre de dados gravados.
    const tapT = 0.62;
    const tp = this.fiberCurve.getPointAt(tapT);
    const van = new THREE.Group();
    van.add(box(3, 1.6, 1.6, C.hostile, 0, 1.0, 0));
    van.add(box(1.1, 1.2, 1.6, 0x8a3a31, 1.9, 0.8, 0));
    for (const [wx, wz] of [[-1, 0.85], [1.2, 0.85], [-1, -0.85], [1.2, -0.85]]) {
      const w = cyl(0.4, 0.4, 0.3, 0x1d1d1b, 10); w.rotation.x = Math.PI / 2; w.position.set(wx, 0.4, wz); van.add(w);
    }
    const dish = new THREE.Mesh(new THREE.SphereGeometry(0.8, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2.5), mat(0xd8d0bd, { side: THREE.DoubleSide }));
    dish.position.set(-0.6, 2.3, 0); dish.rotation.x = -0.9;
    van.add(dish);
    const mk = this.marker("eye", true, 3); mk.position.set(0, 5, 0); van.add(mk);
    this.place(van, tp.x + 3.5, tp.z + 2.5);
    van.lookAt(tp.x, van.position.y, tp.z);
    const tapLine = this.ribbon([tp.clone(), van.position.clone().setY(van.position.y + 0.3)], 0.25, C.red, { lift: 0.1 });
    this.scene.add(tapLine);
    this.eve = { van, dish, tapT, marker: mk, vault: [] };
    MapWorld.PLACES.fibra = { target: [tp.x + 2, tp.y, tp.z + 1], dist: 64, az: -0.85, el: 0.88 };

    this.photons = [];
    const pg = new THREE.SphereGeometry(0.32, 10, 8);
    for (let i = 0; i < 14; i++) {
      const p = new THREE.Mesh(pg, new THREE.MeshBasicMaterial({ color: 0x9fd7ff }));
      p.visible = false;
      this.scene.add(p);
      this.photons.push({ mesh: p, t: i / 14 });
    }
    this.photonMode = "off";
  }

  buildHostilePosts() {
    this.dfPosts = [[-46, -34], [50, 30]].map(([x, z]) => {
      const g = new THREE.Group();
      const m = cyl(0.1, 0.16, 5, 0x6a2c25, 6); m.position.y = 2.5; g.add(m);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.08, 6, 16), mat(0x6a2c25));
      ring.position.y = 5; g.add(ring);
      const mk = this.marker("eye", true, 2.6); mk.position.y = 8; g.add(mk);
      return this.place(g, x, z);
    });
  }

  makeTruck(color = C.friendly, medical = true) {
    const g = new THREE.Group();
    g.add(box(3.4, 1.4, 1.6, color, -0.2, 1.15, 0));
    g.add(box(1.2, 1.1, 1.6, 0x46587a, 1.9, 1.0, 0));
    g.add(box(0.05, 0.55, 1.2, 0x9fb3c4, 2.5, 1.2, 0));
    if (medical) {
      g.add(box(1.0, 0.8, 0.02, 0xf2eee4, -0.3, 1.3, 0.81));
      g.add(box(0.2, 0.6, 0.03, C.red, -0.3, 1.3, 0.83), box(0.6, 0.2, 0.03, C.red, -0.3, 1.3, 0.83));
    }
    for (const wx of [-1.3, 0, 1.6]) for (const wz of [0.85, -0.85]) {
      const w = cyl(0.42, 0.42, 0.32, 0x1d1d1b, 10); w.rotation.x = Math.PI / 2; w.position.set(wx, 0.42, wz); g.add(w);
    }
    g.scale.setScalar(0.85);
    return g;
  }

  makeJeep() {
    const g = new THREE.Group();
    g.add(box(2.2, 0.9, 1.3, C.hostile, 0, 0.8, 0));
    g.add(box(0.9, 0.6, 1.2, 0x7c2f27, -0.3, 1.5, 0));
    for (const wx of [-0.8, 0.8]) for (const wz of [0.7, -0.7]) {
      const w = cyl(0.35, 0.35, 0.28, 0x1d1d1b, 8); w.rotation.x = Math.PI / 2; w.position.set(wx, 0.35, wz); g.add(w);
    }
    const cone = new THREE.Mesh(new THREE.ConeGeometry(3.2, 9, 20, 1, true), new THREE.MeshBasicMaterial({ color: C.red, transparent: true, opacity: 0.16, side: THREE.DoubleSide, depthWrite: false }));
    cone.rotation.z = Math.PI / 2; cone.position.set(5.4, 0.9, 0);
    g.add(cone);
    const mk = this.marker("patrol", true, 2.6); mk.position.y = 4.4; g.add(mk);
    return g;
  }

  makeDrone(color = C.friendly) {
    const g = new THREE.Group();
    g.add(box(0.8, 0.25, 0.8, color));
    g.rotors = [];
    for (const [x, z] of [[0.8, 0.8], [-0.8, 0.8], [0.8, -0.8], [-0.8, -0.8]]) {
      g.add(box(0.9, 0.08, 0.12, 0x2b2b27, x / 2, 0, z / 2));
      const r = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.03, 14), new THREE.MeshBasicMaterial({ color: 0x1d1d1b, transparent: true, opacity: 0.45 }));
      r.position.set(x, 0.12, z);
      g.add(r);
    }
    g.scale.setScalar(1.3);
    return g;
  }

  buildFleet() {
    this.trucks = [0, 1, 2].map(i => {
      const t = this.makeTruck();
      this.place(t, NODES.PC.x + 3 + i * 3.6, NODES.PC.z - 3 - i * 1.2);
      t.rotation.y = -0.6;
      return t;
    });
    this.fleetMarker = this.marker("log", false, 3);
    this.scene.add(this.fleetMarker);
    this.patrolUnits = [];
    this.landslideObjs = [];
    // Trânsito de suprimentos indo e voltando pelas estradas.
    this.supply = this.makeTruck(0x6b6f55, false);
    this.scene.add(this.supply);
    this.supplyCurve = this.roadCurve(["PC", "A", "C", "E", "G", "J"]);
    this.scout = this.makeTruck(0x56664a, false);
    this.place(this.scout, 18, -14);
    this.scout.visible = false;
  }

  buildAircraft() {
    // Helicóptero de evacuação em órbita sobre o posto de comando.
    const heli = new THREE.Group();
    const body = new THREE.Mesh(new THREE.SphereGeometry(1.2, 12, 8), mat(0x52606f));
    body.scale.set(1.6, 1, 1); heli.add(body);
    heli.add(box(3.6, 0.35, 0.35, 0x52606f, -2.6, 0.2, 0));
    heli.add(box(0.1, 1.0, 0.35, 0x52606f, -4.3, 0.6, 0));
    this.rotor = box(7.5, 0.06, 0.35, 0x1d1d1b, 0, 1.25, 0);
    this.rotor2 = box(0.35, 0.06, 7.5, 0x1d1d1b, 0, 1.25, 0);
    heli.add(this.rotor, this.rotor2);
    heli.add(box(1.0, 0.1, 0.1, 0x1d1d1b, -0.2, -1.1, 0.6), box(1.0, 0.1, 0.1, 0x1d1d1b, -0.2, -1.1, -0.6));
    this.heli = heli;
    this.scene.add(heli);

    // Avião de transporte em circuito alto.
    const plane = new THREE.Group();
    const fus = cyl(0.9, 0.7, 11, 0x6b7280, 10); fus.rotation.z = Math.PI / 2; plane.add(fus);
    plane.add(box(1.6, 0.18, 13, 0x5c636f, 0.6, 0.8, 0));
    plane.add(box(1.3, 2.2, 0.15, 0x5c636f, -5, 1.4, 0));
    plane.add(box(1.0, 0.12, 4.4, 0x5c636f, -5.1, 2.5, 0));
    for (const z of [-3.2, -1.6, 1.6, 3.2]) { const e = cyl(0.3, 0.3, 1.1, 0x3f444c, 8); e.rotation.z = Math.PI / 2; e.position.set(1.4, 0.5, z); plane.add(e); }
    plane.scale.setScalar(0.6);
    this.plane = plane;
    this.scene.add(plane);

    this.drones = [0, 1].map(() => { const d = this.makeDrone(); this.scene.add(d); return d; });
  }

  // ---------- cenário da Missão 3 ----------
  setScenario(scenario) {
    this.scenario = scenario;
    for (const o of this.landslideObjs) this.scene.remove(o);
    for (const p of this.patrolUnits) this.scene.remove(p.obj);
    this.landslideObjs = [];
    this.patrolUnits = [];
    for (const key of scenario.patrols) {
      const road = this.roads[key];
      const obj = this.makeJeep();
      this.scene.add(obj);
      this.patrolUnits.push({ obj, pts: road.pts, phase: Math.random() });
    }
  }

  dropLandslides(animated = true) {
    if (!this.scenario) return Promise.resolve();
    const jobs = this.scenario.landslides.map((key, k) => {
      const road = this.roads[key];
      const mid = road.pts[Math.floor(road.pts.length / 2)];
      const group = new THREE.Group();
      const rocks = [];
      for (let i = 0; i < 9; i++) {
        const r = new THREE.Mesh(new THREE.DodecahedronGeometry(0.5 + Math.random() * 0.6, 0), mat(C.rock));
        r.castShadow = true;
        const ox = (Math.random() - 0.5) * 3, oz = (Math.random() - 0.5) * 3;
        r.userData.end = new THREE.Vector3(mid.x + ox, heightAt(mid.x + ox, mid.z + oz) + 0.4, mid.z + oz);
        r.userData.start = r.userData.end.clone().add(new THREE.Vector3(4 + Math.random() * 3, 9 + Math.random() * 4, 3));
        r.position.copy(animated ? r.userData.start : r.userData.end);
        group.add(r);
        rocks.push(r);
      }
      const xMark = new THREE.Group();
      for (const s of [1, -1]) {
        const bar = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.12, 0.5), new THREE.MeshBasicMaterial({ color: C.red }));
        bar.rotation.y = s * Math.PI / 4;
        xMark.add(bar);
      }
      xMark.position.set(mid.x, mid.y + 1.6, mid.z);
      xMark.visible = !animated;
      group.add(xMark);
      this.scene.add(group);
      this.landslideObjs.push(group);
      if (!animated) return Promise.resolve();
      return this.wait(k * 500).then(() => this.tween(1400, t => {
        for (const r of rocks) { r.position.lerpVectors(r.userData.start, r.userData.end, ease.out(t)); r.rotation.x += 0.2; }
      })).then(() => { xMark.visible = true; this.puff(mid, 0x9b8a72, 18); this.shake = 0.6; });
    });
    return Promise.all(jobs);
  }

  // ---------- câmera ----------
  static PLACES = {
    overview: { target: [0, 6, 4], dist: 128, az: -0.5, el: 0.82 },
    intro: { target: [-4, 4, 6], dist: 110, az: -0.85, el: 0.62 },
    abrigo: { target: [27, 14, -21], dist: 96, az: 0.7, el: 0.95 },
    jammer: { target: [-12, 6, 20], dist: 80, az: -0.95, el: 0.72 },
    rotas: { target: [-6, 4, 6], dist: 118, az: -0.15, el: 1.1 },
    fibra: { target: [-8, 4, 14], dist: 86, az: -1.2, el: 0.8 },
    base: { target: [-40, 2, 36], dist: 46, az: -0.6, el: 0.6 },
    report: { target: [0, 4, 0], dist: 150, az: 0.3, el: 1.15 }
  };

  focus(name, { duration = 1800 } = {}) {
    const p = MapWorld.PLACES[name] || MapWorld.PLACES.overview;
    const from = { target: this.cam.target.clone(), dist: this.cam.dist, az: this.cam.az, el: this.cam.el };
    const to = { target: new THREE.Vector3(...p.target), dist: p.dist, az: p.az, el: p.el };
    this.camOffset.az *= 0.3; this.camOffset.el *= 0.3;
    if (this.reducedMotion || duration === 0) {
      Object.assign(this.cam, { target: to.target, dist: to.dist, az: to.az, el: to.el });
      return Promise.resolve();
    }
    return this.tween(duration, t => {
      const k = ease.inOut(t);
      this.cam.target.lerpVectors(from.target, to.target, k);
      this.cam.dist = from.dist + (to.dist - from.dist) * k;
      this.cam.az = from.az + (to.az - from.az) * k;
      this.cam.el = from.el + (to.el - from.el) * k;
    }, { realtime: true });
  }

  bindPointer() {
    const el = this.renderer.domElement;
    let drag = null;
    el.addEventListener("pointerdown", e => { drag = { x: e.clientX, y: e.clientY, az: this.camOffset.az, el: this.camOffset.el }; el.setPointerCapture(e.pointerId); });
    el.addEventListener("pointermove", e => {
      if (!drag) return;
      this.camOffset.az = drag.az - (e.clientX - drag.x) * 0.005;
      this.camOffset.el = THREE.MathUtils.clamp(drag.el + (e.clientY - drag.y) * 0.003, -0.35, 0.4);
    });
    const end = () => { drag = null; };
    el.addEventListener("pointerup", end);
    el.addEventListener("pointercancel", end);
    el.addEventListener("wheel", e => {
      this.camOffset.zoom = THREE.MathUtils.clamp(this.camOffset.zoom * (1 + Math.sign(e.deltaY) * 0.08), 0.55, 1.4);
    }, { passive: true });
  }

  // ---------- tempo e tweens ----------
  wait(ms) {
    return new Promise(res => this.tasks.add({ left: ms, done: res, update: null }));
  }
  tween(ms, update, { realtime = false } = {}) {
    return new Promise(res => this.tasks.add({ left: ms, total: ms, update, done: res, realtime }));
  }
  skip() { this.speed = 8; }

  pulseShelterHint() {
    const S = NODES.ABR;
    const top = new THREE.Vector3(S.x, heightAt(S.x, S.z), S.z);
    for (let i = 0; i < 3; i++) this.wait(i * 600).then(() => this.ring(top, { color: C.red, max: 9, dur: 1500 }));
  }

  setDaylight(v) {
    this.daylight = v;
  }

  // ---------- efeitos ----------
  ring(pos, { color = C.blue, max = 12, dur = 1600, y = 0.4, width = 0.35 } = {}) {
    const m = new THREE.Mesh(new THREE.RingGeometry(0.8, 0.8 + width, 48), new THREE.MeshBasicMaterial({ color, transparent: true, side: THREE.DoubleSide, depthWrite: false }));
    m.rotation.x = -Math.PI / 2;
    m.position.set(pos.x, pos.y + y, pos.z);
    this.scene.add(m);
    return this.tween(dur, t => {
      const s = 1 + (max - 1) * ease.out(t);
      m.scale.set(s, s, s);
      m.material.opacity = 1 - t;
    }).then(() => { this.scene.remove(m); m.geometry.dispose(); });
  }

  sphereWave(pos, { color = C.red, max = 10, dur = 1500, opacity = 0.35 } = {}) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 12), new THREE.MeshBasicMaterial({ color, transparent: true, depthWrite: false, wireframe: true }));
    m.position.copy(pos);
    this.scene.add(m);
    return this.tween(dur, t => {
      const s = 1 + (max - 1) * ease.out(t);
      m.scale.setScalar(s);
      m.material.opacity = opacity * (1 - t);
    }).then(() => this.scene.remove(m));
  }

  puff(pos, color = 0x6b6358, n = 24) {
    const g = new THREE.Group();
    const parts = [];
    for (let i = 0; i < n; i++) {
      const p = new THREE.Mesh(new THREE.IcosahedronGeometry(0.5 + Math.random() * 0.6, 0), new THREE.MeshStandardMaterial({ color, transparent: true, opacity: 0.85, flatShading: true }));
      p.position.copy(pos);
      p.userData.start = pos.clone();
      p.userData.v = new THREE.Vector3((Math.random() - 0.5) * 4, 2 + Math.random() * 4, (Math.random() - 0.5) * 4);
      g.add(p);
      parts.push(p);
    }
    this.scene.add(g);
    return this.tween(1800, t => {
      for (const p of parts) {
        const s = t * 1.8;
        p.position.copy(p.userData.start).addScaledVector(p.userData.v, s);
        p.position.y -= 0.6 * s * s;
        p.scale.setScalar(1 + t * 2);
        p.material.opacity = 0.85 * (1 - t);
      }
    }).then(() => this.scene.remove(g));
  }

  explosion(pos) {
    const flash = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 10), new THREE.MeshBasicMaterial({ color: 0xffb347, transparent: true }));
    flash.position.copy(pos).add(new THREE.Vector3(0, 0.8, 0));
    this.scene.add(flash);
    this.shake = 1.2;
    this.tween(500, t => { flash.scale.setScalar(1 + t * 5); flash.material.opacity = 1 - t; }).then(() => this.scene.remove(flash));
    const crater = new THREE.Mesh(new THREE.CircleGeometry(2, 16), new THREE.MeshBasicMaterial({ color: 0x2b2620, transparent: true, opacity: 0.75, depthWrite: false }));
    crater.rotation.x = -Math.PI / 2;
    crater.position.set(pos.x, heightAt(pos.x, pos.z) + 0.25, pos.z);
    this.scene.add(crater);
    this.temp.push(crater);
    return this.puff(pos, 0x4d463d, 20);
  }

  bearingLine(from, to, color = C.red) {
    const pts = [from.clone().setY(from.y + 5), to.clone().setY(to.y + 1)];
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color, transparent: true }));
    this.scene.add(line);
    this.temp.push(line);
    const dir = new THREE.Vector3().subVectors(pts[1], pts[0]);
    return this.tween(900, t => {
      geo.setFromPoints([pts[0], pts[0].clone().addScaledVector(dir, ease.out(t))]);
    });
  }

  // Traço de lápis dermatográfico ao longo de uma rota (desenhado aos poucos).
  greaseRoute(path, { color = C.blue, radius = 0.42, dur = 1600, opacity = 1 } = {}) {
    const pts = [];
    for (let i = 0; i < path.length - 1; i++) {
      const seg = this.roadPoints(path[i], path[i + 1], 1.2);
      pts.push(...(i ? seg.slice(1) : seg));
    }
    // Traço à mão: pequena oscilação lateral, como lápis sobre o acetato.
    const seed = path.length * 7 + path.join("").length;
    pts.forEach((p, i) => {
      p.y += 0.7;
      p.x += Math.sin(i * 0.9 + seed) * 0.22 + Math.sin(i * 2.7 + seed * 3) * 0.08;
      p.z += Math.cos(i * 1.1 + seed) * 0.22;
    });
    const curve = new THREE.CatmullRomCurve3(pts);
    const geo = new THREE.TubeGeometry(curve, pts.length * 3, radius, 6);
    const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color, transparent: opacity < 1, opacity, depthWrite: opacity === 1 }));
    m.renderOrder = 5;
    this.scene.add(m);
    this.temp.push(m);
    const total = geo.index.count;
    geo.setDrawRange(0, 0);
    const done = dur > 0
      ? this.tween(dur, t => geo.setDrawRange(0, Math.floor(total * ease.out(t)) - (Math.floor(total * ease.out(t)) % 3)))
      : Promise.resolve(geo.setDrawRange(0, total));
    return { mesh: m, curve, done };
  }

  driveAlong(obj, curve, dur, { offset = 0, onStep } = {}) {
    const look = new THREE.Vector3();
    return this.tween(dur, t => {
      const k = Math.min(1, Math.max(0, ease.inOut(t) - offset));
      const p = curve.getPointAt(k);
      obj.position.set(p.x, Math.max(heightAt(p.x, p.z), WATER) + 0.05, p.z);
      const q = curve.getPointAt(Math.min(1, k + 0.01));
      look.set(q.x, obj.position.y, q.z);
      if (look.distanceToSquared(obj.position) > 1e-4) {
        obj.lookAt(look);
        obj.rotateY(-Math.PI / 2);
      }
      onStep && onStep(k, p);
    });
  }

  roadCurve(path) {
    const pts = [];
    for (let i = 0; i < path.length - 1; i++) {
      const seg = this.roadPoints(path[i], path[i + 1], 1.2);
      pts.push(...(i ? seg.slice(1) : seg));
    }
    return new THREE.CatmullRomCurve3(pts);
  }

  clearTemp() {
    for (const o of this.temp) this.scene.remove(o);
    this.temp = [];
    for (const l of this.tempLabels || []) this.removeLabel(l);
    this.tempLabels = [];
  }

  tempLabel(text, pos, cls = "hostile") {
    const l = this.addLabel(text, pos.clone(), cls);
    (this.tempLabels || (this.tempLabels = [])).push(l);
    return l;
  }

  resetFleet() {
    this.trucks.forEach((t, i) => {
      t.position.set(NODES.PC.x + 3 + i * 3.6, heightAt(NODES.PC.x + 3 + i * 3.6, NODES.PC.z - 3 - i * 1.2), NODES.PC.z - 3 - i * 1.2);
      t.rotation.set(0, -0.6, 0);
      t.visible = true;
    });
  }

  setJamming(on) {
    this.jamTarget = on ? 1 : 0;
    this.dome.visible = true;
  }

  // ---------- sequências de cada decisão ----------
  async play(anim, ctx = {}) {
    this.speed = 1;
    this.clearTemp();
    const seq = this.sequences[anim];
    if (seq) await seq.call(this, ctx);
    this.speed = 1;
  }

  get sequences() {
    const S = NODES.ABR;
    const shelterTop = new THREE.Vector3(S.x, heightAt(S.x, S.z), S.z);
    return {
      "m1-gpr": async (ctx = {}) => {
        const at = new THREE.Vector3(21, 0, -11);
        this.scout.visible = true;
        this.place(this.scout, at.x, at.z);
        const p = this.scout.position.clone();
        for (let i = 0; i < 3; i++) {
          this.sphereWave(p.clone().add(new THREE.Vector3(0, 1, 0)), { color: C.red, max: 9, dur: 1100 });
          await this.wait(380);
        }
        await this.wait(400);
        await Promise.all(this.dfPosts.map(d => this.bearingLine(d.position, p)));
        await this.wait(500);
        for (let i = 0; i < 3; i++) {
          this.explosion(p.clone().add(new THREE.Vector3((Math.random() - 0.5) * 6, 0, (Math.random() - 0.5) * 6)));
          await this.wait(420);
        }
        await this.wait(900);
      },
      "m1-thermal": async (ctx = {}) => {
        const d = this.makeDrone();
        d.scale.setScalar(2.4);
        this.scene.add(d);
        this.temp.push(d);
        const cone = new THREE.Mesh(new THREE.ConeGeometry(4, 10, 20, 1, true), new THREE.MeshBasicMaterial({ color: 0xff8c2a, transparent: true, opacity: 0.18, side: THREE.DoubleSide, depthWrite: false }));
        cone.position.y = -5;
        d.add(cone);
        const path = new THREE.CatmullRomCurve3([[16, -4], [26, -10], [34, -18], [28, -24], [22, -14]].map(([x, z]) => new THREE.Vector3(x, heightAt(x, z) + 5, z)));
        const tag = this.tempLabel("Calor: nada sob 40 m de rocha", path.getPointAt(0), "hostile");
        await this.tween(3200, t => { d.position.copy(path.getPointAt(ease.inOut(t))); tag.pos.copy(d.position).add(new THREE.Vector3(0, 2.5, 0)); });
        tag.el.textContent = "Drone detectado";
        await this.bearingLine(this.dfPosts[1].position, d.position);
        cone.visible = false;
        const start = d.position.clone();
        await this.tween(1400, t => {
          d.position.set(start.x + t * 4, start.y - (start.y - heightAt(start.x, start.z)) * t * t, start.z);
          d.rotation.z += 0.3;
        });
        await this.explosion(d.position.clone());
      },
      "m1-grav": async (ctx = {}) => {
        const d = this.makeDrone(0x4f6787);
        this.scene.add(d);
        this.temp.push(d);
        const lanes = [];
        for (let i = 0; i < 5; i++) {
          const z = S.z - 12 + i * 6;
          lanes.push(i % 2 ? [S.x + 13, z] : [S.x - 13, z], i % 2 ? [S.x - 13, z] : [S.x + 13, z]);
        }
        const path = new THREE.CatmullRomCurve3(lanes.map(([x, z]) => new THREE.Vector3(x, heightAt(x, z) + 5, z)), false, "catmullrom", 0.1);
        await this.tween(4200, t => {
          d.position.copy(path.getPointAt(t));
          this.uniforms.uAnomaly.value.w = Math.min(1, t * 1.15);
          ctx.onProgress && ctx.onProgress(t);
        });
        this.revealShelter(true);
        await this.tween(1400, t => { this.uniforms.uHole.value.z = this.cut.R * ease.out(t); });
        await this.ring(shelterTop, { color: C.blue, max: 10, dur: 1400 });
      },
      "m2-drift": async (ctx = {}) => this.convoyRun({ mode: "drift" }),
      "m2-spoof": async (ctx = {}) => this.convoyRun({ mode: "spoof" }),
      "m2-qins": async (ctx = {}) => this.convoyRun({ mode: "qins" }),
      "m3-brute": async (ctx = {}) => {
        const routes = listSimpleRoutes(this.scenario, 26);
        for (let i = 0; i < routes.length; i++) {
          const r = this.greaseRoute(routes[i], { color: C.red, radius: 0.18, dur: 0, opacity: 0.55 });
          ctx.onProgress && ctx.onProgress(i / routes.length);
          await this.wait(200);
          this.scene.remove(r.mesh);
        }
        await this.wait(400);
      },
      "m3-planned": async (ctx = {}) => {
        const curve = this.roadCurve(PLANNED_ROUTE);
        const blockedKey = this.scenario.landslides.find(k => PLANNED_ROUTE.some((n, i) => i < PLANNED_ROUTE.length - 1 && edgeKey(n, PLANNED_ROUTE[i + 1]) === k));
        const road = this.roads[blockedKey];
        const mid = road.pts[Math.floor(road.pts.length / 2)];
        let stopAt = 1, best = Infinity;
        for (let i = 0; i <= 200; i++) {
          const d = curve.getPointAt(i / 200).distanceTo(mid);
          if (d < best) { best = d; stopAt = i / 200; }
        }
        stopAt = Math.max(0, stopAt - 0.03);
        this.greaseRoute(PLANNED_ROUTE, { color: C.blue, dur: 1200 });
        const trimmed = new THREE.CatmullRomCurve3(curve.getSpacedPoints(120).slice(0, Math.max(2, Math.floor(120 * stopAt))));
        await Promise.all(this.trucks.map((t, i) => this.wait(i * 350).then(() => this.driveAlong(t, trimmed, 3600 - i * 350))));
        this.shake = 0.5;
        const jeep = this.patrolUnits[0];
        if (jeep) await this.bearingLine(jeep.obj.position, this.trucks[0].position);
        await this.wait(900);
      },
      "m3-qaoa": async (ctx = {}) => {
        const routes = listSimpleRoutes(this.scenario, 40);
        const ghosts = routes.map(r => this.greaseRoute(r, { color: C.blue, radius: 0.14, dur: 700, opacity: 0.32 }));
        await this.tween(1600, t => {
          ghosts.forEach((g, i) => { g.mesh.material.opacity = 0.18 + 0.3 * Math.abs(Math.sin(t * 9 + i)); });
          ctx.onProgress && ctx.onProgress(t * 0.6);
        });
        await this.tween(900, t => { ghosts.forEach(g => { g.mesh.material.opacity = 0.32 * (1 - t); }); ctx.onProgress && ctx.onProgress(0.6 + t * 0.4); });
        ghosts.forEach(g => this.scene.remove(g.mesh));
        const best = ctx.best;
        const r = this.greaseRoute(best.path, { color: C.blue, radius: 0.5, dur: 1500 });
        await r.done;
        const curve = this.roadCurve(best.path);
        await Promise.all(this.trucks.map((t, i) => this.wait(i * 450).then(() => this.driveAlong(t, curve, 5200))));
      },
      "m4-rsa": async (ctx = {}) => this.signalRun({ mode: "rsa" }),
      "m4-vhf": async (ctx = {}) => this.signalRun({ mode: "vhf" }),
      "m4-qkd": async (ctx = {}) => this.signalRun({ mode: "qkd", onProgress: ctx.onProgress })
    };
  }

  revealShelter(on) {
    this.shelter.group.visible = on;
    this.cut.wall.visible = on;
    this.cut.floor.visible = on;
    this.shelter.lamp.intensity = on ? 30 : 0;
    if (!on) this.uniforms.uHole.value.z = 0;
    if (on && !this.shelterLabel) {
      this.shelterLabel = this.addLabel("Abrigo · 39,8 m", new THREE.Vector3(NODES.ABR.x, this.shelterDepth + 4, NODES.ABR.z), "friendly");
    }
  }

  async convoyRun({ mode }) {
    const path = ["PC", "A", "C", "F", "I"];
    const curve = this.roadCurve(path);
    const lead = this.trucks[0];
    const ghost = new THREE.Mesh(new THREE.RingGeometry(1, 1.25, 40), new THREE.MeshBasicMaterial({ color: C.blue, transparent: true, side: THREE.DoubleSide, depthWrite: false }));
    ghost.rotation.x = -Math.PI / 2;
    this.scene.add(ghost);
    this.temp.push(ghost);
    const drift = new THREE.Vector3(0, 0, 0);
    let jumped = false;
    const tag = this.tempLabel(mode === "qins" ? "Posição estimada" : "Posição estimada", lead.position, "friendly");
    const finalK = mode === "qins" ? 1 : 0.72;
    const sub = new THREE.CatmullRomCurve3(curve.getSpacedPoints(160).slice(0, Math.floor(160 * finalK)));
    const run = this.driveAlong(lead, sub, 5600, {
      onStep: (k, p) => {
        if (mode === "drift") drift.set(Math.pow(k, 2) * 14, 0, -Math.pow(k, 2) * 6);
        if (mode === "spoof" && k > 0.35 && !jumped) { jumped = true; drift.set(-16, 0, 14); this.shake = 0.3; }
        const gx = p.x + drift.x, gz = p.z + drift.z;
        ghost.position.set(gx, Math.max(heightAt(gx, gz), WATER) + 0.8, gz);
        const s = mode === "qins" ? 1 : 1 + k * (mode === "drift" ? 5 : 1.5);
        ghost.scale.set(s, s, s);
        tag.pos.set(gx, ghost.position.y + 3 + s * 0.6, gz);
        if (mode === "drift") tag.el.textContent = `Erro ${Math.round(k * k * 1450).toLocaleString("pt-BR")} m`;
        if (mode === "spoof") tag.el.textContent = jumped ? "Posição falsa · 3 km" : "Posição estimada";
        if (mode === "qins") tag.el.textContent = `Erro < 1 m`;
      }
    });
    const others = this.trucks.slice(1).map((t, i) => this.wait(500 + i * 400).then(() => this.driveAlong(t, sub, 5600 - 500 - i * 400)));
    await Promise.all([run, ...others]);
    if (mode === "drift") {
      const t = this.trucks[2];
      const start = t.position.clone();
      await this.tween(1300, k => {
        t.position.set(start.x + k * 4, start.y - k * k * 5, start.z - k * 2);
        t.rotation.x = k * 1.2;
      });
      this.puff(t.position.clone(), 0x7a6a55, 14);
      await this.wait(800);
    } else if (mode === "spoof") {
      await this.bearingLine(lead.position, ghost.position, C.blue);
      await this.wait(900);
    } else {
      await this.ring(lead.position, { color: C.blue, max: 6, dur: 1200 });
    }
  }

  async signalRun({ mode, onProgress }) {
    const eve = this.eve;
    if (mode === "vhf") {
      const ant = new THREE.Vector3(NODES.ABR.x, heightAt(NODES.ABR.x, NODES.ABR.z) + 3, NODES.ABR.z);
      await this.focus("overview", { duration: 1200 });
      this.tempLabel("Transmissão VHF", ant.clone().add(new THREE.Vector3(0, 4, 0)), "friendly");
      for (let i = 0; i < 4; i++) {
        this.sphereWave(ant, { color: C.blue, max: 70, dur: 2600, opacity: 0.6 });
        this.ring(ant, { color: C.blue, max: 60, dur: 2600, y: -2, width: 0.12 });
        await this.wait(500);
      }
      await this.wait(800);
      eve.dish.rotation.z = 0.8;
      this.tempLabel("Espectro gravado", eve.van.position.clone().add(new THREE.Vector3(0, 7, 0)), "hostile");
      await Promise.all(this.dfPosts.map(d => this.bearingLine(d.position, ant)));
      await this.stackVault(5);
      await this.wait(700);
      return;
    }
    this.photonMode = mode;
    if (mode === "rsa") {
      this.tempLabel("Cópia arquivada · decifrar depois", eve.van.position.clone().add(new THREE.Vector3(0, 7, 0)), "hostile");
      for (const p of this.photons) { p.mesh.visible = true; p.mesh.material.color.setHex(0xe8c35a); p.mesh.scale.setScalar(1.3); }
      await this.wait(1600);
      await this.stackVault(7);
      await this.wait(1200);
    } else {
      for (const p of this.photons) { p.mesh.visible = true; p.mesh.material.color.setHex(0x9fd7ff); p.mesh.scale.setScalar(0.9); }
      await this.tween(2200, t => onProgress && onProgress(t * 0.45));
      this.photonMode = "disturbed";
      for (const p of this.photons) p.mesh.material.color.setHex(0xff6b5a);
      const tp = this.fiberCurve.getPointAt(eve.tapT);
      await this.ring(tp, { color: C.red, max: 7, dur: 900 });
      await this.tween(1500, t => onProgress && onProgress(0.45 + t * 0.2));
      this.photonMode = "qkd";
      for (const p of this.photons) p.mesh.material.color.setHex(0x9fd7ff);
      eve.van.traverse(o => { if (o.material && o.material.color && o !== eve.marker) o.material = o.material.clone(), o.material.color.setHex(0x8f8a80); });
      eve.marker.material.opacity = 0.35;
      await this.tween(2000, t => onProgress && onProgress(0.65 + t * 0.35));
      await this.ring(new THREE.Vector3(NODES.PC.x, heightAt(NODES.PC.x, NODES.PC.z), NODES.PC.z), { color: C.blue, max: 8, dur: 1200 });
    }
    this.photonMode = mode === "qkd" ? "qkd" : "off";
    if (mode !== "qkd") for (const p of this.photons) p.mesh.visible = false;
  }

  async stackVault(n) {
    const base = this.eve.van.position.clone().add(new THREE.Vector3(-3, 0, -2));
    for (let i = 0; i < n; i++) {
      const b = box(1.1, 0.6, 0.8, 0x2f3029, base.x + (i % 3) * 1.2, base.y + 0.3 + Math.floor(i / 3) * 0.62, base.z);
      b.add(box(1.0, 0.08, 0.82, C.red, 0, 0.1, 0));
      this.scene.add(b);
      this.temp.push(b);
      const end = b.position.y;
      await this.tween(260, t => { b.position.y = end + (1 - ease.out(t)) * 3; });
    }
  }

  // ---------- loop ----------
  resize() {
    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.fov = w < 700 ? 52 : 38;
    this.camera.updateProjectionMatrix();
  }

  frame() {
    // Tarefas seguem o tempo real mesmo com poucos quadros por segundo.
    const rawDt = Math.min(this.clock.getDelta(), 0.5);
    const dt = rawDt * this.speed;
    this.time += rawDt;
    const t = this.time;
    this.uniforms.uTime.value = t;

    for (const task of [...this.tasks]) {
      task.left -= (task.realtime ? rawDt : dt) * 1000;
      try {
        if (task.update) task.update(Math.min(1, 1 - task.left / task.total));
      } catch (err) {
        console.error(err);
        task.left = 0;
      }
      if (task.left <= 0) { this.tasks.delete(task); task.done(); }
    }

    // luz do dia acompanha o relógio de sobrevida
    const day = this.uniforms.uDay.value += (this.daylight - this.uniforms.uDay.value) * 0.02;
    this.sun.intensity = 0.5 + 2.0 * day;
    this.hemi.intensity = 0.45 + 1.1 * day;
    this.nightLamp.intensity = (1 - day) * 900;
    this.renderer.toneMappingExposure = 1;

    // interferência
    const jamW = this.uniforms.uJam.value;
    jamW.w += ((this.jamTarget || 0) - jamW.w) * 0.04;
    this.dome.material.uniforms.uOpacity.value = jamW.w;
    this.dome.visible = jamW.w > 0.01;
    for (const s of this.sats) {
      s.g.position.x += Math.sin(t * 0.05 + s.phase) * 0.01;
      s.line.material.color.setHex(jamW.w > 0.5 ? C.red : C.blue);
      s.line.material.opacity = 0.7 * (1 - jamW.w * 0.6);
    }

    // aeronaves
    const hp = new THREE.Vector3(NODES.PC.x + Math.cos(t * 0.4) * 10, 14 + Math.sin(t * 0.7), NODES.PC.z + Math.sin(t * 0.4) * 8);
    this.heli.position.copy(hp);
    this.heli.rotation.y = -t * 0.4 - Math.PI / 2;
    this.rotor.rotation.y += 0.6; this.rotor2.rotation.y += 0.6;
    const pa = t * 0.07;
    this.plane.position.set(Math.cos(pa) * 82, 60, Math.sin(pa) * 66);
    // nariz em +x: aponta na direção da derivada da órbita
    this.plane.rotation.set(0, Math.atan2(-Math.cos(pa) * 66, -Math.sin(pa) * 82), 0);
    this.plane.rotateX(-0.22);
    this.drones.forEach((d, i) => {
      const a = t * (0.5 + i * 0.2) + i * 3;
      const cx = i ? -20 : -34, cz = i ? 20 : 30;
      d.position.set(cx + Math.cos(a) * 8, heightAt(cx, cz) + 9 + Math.sin(t * 2 + i), cz + Math.sin(a) * 8);
      d.rotation.y = -a;
    });

    // patrulhas
    for (const p of this.patrolUnits) {
      const k = (Math.sin(t * 0.25 + p.phase * 6) + 1) / 2;
      const f = k * (p.pts.length - 1);
      const i = Math.min(p.pts.length - 2, Math.floor(f));
      const a = p.pts[i], b = p.pts[i + 1];
      p.obj.position.lerpVectors(a, b, f - i);
      const dir = Math.cos(t * 0.25 + p.phase * 6) >= 0 ? 1 : -1;
      const ahead = dir > 0 ? b : a;
      p.obj.lookAt(ahead.x, p.obj.position.y, ahead.z);
      p.obj.rotateY(-Math.PI / 2);
    }

    if (this.supply) {
      const k = (Math.sin(t * 0.045) + 1) / 2;
      const p = this.supplyCurve.getPointAt(k);
      const q = this.supplyCurve.getPointAt(Math.min(1, Math.max(0, k + (Math.cos(t * 0.045) >= 0 ? 0.01 : -0.01))));
      this.supply.position.set(p.x, Math.max(heightAt(p.x, p.z), WATER) + 0.05, p.z);
      this.supply.lookAt(q.x, this.supply.position.y, q.z);
      this.supply.rotateY(-Math.PI / 2);
    }

    // marcador da frota acompanha a viatura líder
    const lead = this.trucks[0].position;
    this.fleetMarker.position.set(lead.x, lead.y + 5, lead.z);

    // fótons na fibra
    if (this.photonMode !== "off") {
      for (const p of this.photons) {
        p.t = (p.t + rawDt * (this.photonMode === "rsa" ? 0.08 : 0.12)) % 1;
        const tt = 1 - p.t;
        const pos = this.fiberCurve.getPointAt(tt);
        p.mesh.position.set(pos.x, pos.y + 0.4, pos.z);
        if (this.photonMode === "rsa" && Math.abs(tt - this.eve.tapT) < 0.01) this.copyToEve(pos);
      }
    }

    // câmera
    const az = this.cam.az + this.camOffset.az + (this.reducedMotion ? 0 : Math.sin(t * 0.05) * 0.03);
    const portrait = this.camera.aspect < 0.8;
    const el = THREE.MathUtils.clamp(this.cam.el + this.camOffset.el + (portrait ? 0.28 : 0), 0.25, 1.4);
    const dist = this.cam.dist * this.camOffset.zoom * (portrait ? 1.2 : 1);
    const target = this.cam.target;
    this.camera.position.set(
      target.x + Math.sin(az) * Math.cos(el) * dist,
      target.y + Math.sin(el) * dist,
      target.z + Math.cos(az) * Math.cos(el) * dist
    );
    if (this.shake > 0 && !this.reducedMotion) {
      this.camera.position.add(new THREE.Vector3((Math.random() - 0.5) * this.shake, (Math.random() - 0.5) * this.shake, 0));
      this.shake *= 0.9;
      if (this.shake < 0.02) this.shake = 0;
    }
    this.camera.lookAt(target);
    // Desloca o enquadramento para o alvo ficar acima dos cards de decisão.
    this.frameShift += (this.frameShiftTarget - this.frameShift) * 0.06;
    if (Math.abs(this.frameShift) > 0.002) {
      const w = this.renderer.domElement.clientWidth, h = this.renderer.domElement.clientHeight;
      this.camera.setViewOffset(w, h, 0, h * this.frameShift, w, h);
    } else if (this.camera.view && this.camera.view.enabled) {
      this.camera.clearViewOffset();
    }

    this.renderer.render(this.scene, this.camera);
    this.updateLabels();
  }

  copyToEve(pos) {
    const now = this.time;
    if (this._lastCopy && now - this._lastCopy < 0.25) return;
    this._lastCopy = now;
    const c = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.4), new THREE.MeshBasicMaterial({ color: C.red }));
    c.position.copy(pos);
    this.scene.add(c);
    const end = this.eve.van.position.clone().add(new THREE.Vector3(0, 1.5, 0));
    const start = pos.clone();
    this.tween(700, t => c.position.lerpVectors(start, end, t)).then(() => this.scene.remove(c));
  }

  updateLabels() {
    const w = this.renderer.domElement.clientWidth, h = this.renderer.domElement.clientHeight;
    const v = new THREE.Vector3();
    for (const l of this.labels) {
      v.copy(l.pos).project(this.camera);
      const show = v.z < 1 && Math.abs(v.x) < 1.1 && Math.abs(v.y) < 1.1;
      l.el.style.opacity = show ? "" : "0";
      if (show) l.el.style.transform = `translate(${((v.x + 1) / 2) * w}px, ${((1 - v.y) / 2) * h}px) translate(-50%, -50%)`;
    }
  }

  // Volta ao estado inicial de uma missão (para tentar de novo).
  resetMission(id) {
    this.clearTemp();
    this.photonMode = "off";
    for (const p of this.photons) p.mesh.visible = false;
    this.scout.visible = false;
    this.resetFleet();
    if (id === "m1") { this.uniforms.uAnomaly.value.w = 0; this.revealShelter(false); }
  }
}

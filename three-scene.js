// Three.js Tactical 3D Wireframe Terrain & Quantum Visualizer
class TacticalScene {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.terrain = null;
    this.scanRings = [];
    this.quantumBeam = null;
    this.routeLine = null;
    this.jammingActive = false;
    this.shelterMarker = null;
    this.droneMarker = null;
    this.clock = new THREE.Clock();

    this.init();
  }

  init() {
    const width = this.container.clientWidth || 500;
    const height = this.container.clientHeight || 400;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x060c14, 0.018);

    this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    this.camera.position.set(0, 32, 45);
    this.camera.lookAt(0, -2, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);

    this.buildTerrain();
    this.buildTacticalElements();
    this.setupListeners();
    this.animate();
  }

  buildTerrain() {
    const size = 70;
    const segments = 45;
    const geometry = new THREE.PlaneGeometry(size, size, segments, segments);
    geometry.rotateX(-Math.PI / 2);

    const pos = geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      // Generate mountain pass and rugged relief
      let y = Math.sin(x * 0.12) * Math.cos(z * 0.12) * 4.5;
      y += Math.sin(x * 0.28 + 1.2) * Math.sin(z * 0.25) * 2.8;
      // Ridge lines
      y += Math.cos((x + z) * 0.1) * 3.0;
      pos.setY(i, y);
    }
    geometry.computeVertexNormals();

    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffcc,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });

    this.terrain = new THREE.Mesh(geometry, wireframeMaterial);
    this.scene.add(this.terrain);

    // Deep grid floor
    const grid = new THREE.GridHelper(size, 20, 0x0088aa, 0x032838);
    grid.position.y = -6;
    this.scene.add(grid);
  }

  buildTacticalElements() {
    // Shelter Marker (Target at underground depth)
    const markerGeo = new THREE.SphereGeometry(1.2, 16, 16);
    const markerMat = new THREE.MeshBasicMaterial({
      color: 0xff0055,
      wireframe: true,
      transparent: true,
      opacity: 0.8
    });
    this.shelterMarker = new THREE.Mesh(markerGeo, markerMat);
    this.shelterMarker.position.set(12, -4, -10);
    this.shelterMarker.visible = false;
    this.scene.add(this.shelterMarker);

    // Drone / Recon Vehicle
    const droneGeo = new THREE.ConeGeometry(0.8, 2, 6);
    droneGeo.rotateX(Math.PI / 2);
    const droneMat = new THREE.MeshBasicMaterial({
      color: 0x00ffaa,
      wireframe: true
    });
    this.droneMarker = new THREE.Mesh(droneGeo, droneMat);
    this.droneMarker.position.set(-20, 10, 20);
    this.scene.add(this.droneMarker);
  }

  triggerQuantumScan() {
    window.sound.quantumPulse();
    this.shelterMarker.visible = true;

    // Create expanding pulse rings
    for (let i = 0; i < 3; i++) {
      const ringGeo = new THREE.RingGeometry(0.5, 1.2, 32);
      ringGeo.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x00ffcc,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.9
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.copy(this.shelterMarker.position);
      ring.userData = { scaleSpeed: 0.15 + i * 0.05, maxScale: 18, delay: i * 0.25, time: 0 };
      this.scene.add(ring);
      this.scanRings.push(ring);
    }
  }

  triggerJamming() {
    this.jammingActive = true;
    window.sound.alarm();
    if (this.terrain) {
      this.terrain.material.color.setHex(0xff2244);
      this.terrain.material.opacity = 0.65;
    }
  }

  clearJamming() {
    this.jammingActive = false;
    if (this.terrain) {
      this.terrain.material.color.setHex(0x00ffcc);
      this.terrain.material.opacity = 0.35;
    }
  }

  drawQuantumRoute() {
    if (this.routeLine) {
      this.scene.remove(this.routeLine);
    }
    const points = [
      new THREE.Vector3(-20, 10, 20),
      new THREE.Vector3(-10, 6, 12),
      new THREE.Vector3(0, 3, 4),
      new THREE.Vector3(6, 1, -2),
      new THREE.Vector3(12, -4, -10)
    ];
    const curve = new THREE.CatmullRomCurve3(points);
    const curvePoints = curve.getPoints(50);
    const geometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
    const material = new THREE.LineBasicMaterial({ color: 0x00ffff, linewidth: 2 });
    this.routeLine = new THREE.Line(geometry, material);
    this.scene.add(this.routeLine);
    window.sound.scan();
  }

  triggerQKDBeam() {
    if (this.quantumBeam) {
      this.scene.remove(this.quantumBeam);
    }
    const points = [
      new THREE.Vector3(12, -4, -10),
      new THREE.Vector3(0, 25, 0)
    ];
    const geom = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineDashedMaterial({
      color: 0x00ff88,
      dashSize: 1,
      gapSize: 0.5,
      linewidth: 3
    });
    this.quantumBeam = new THREE.Line(geom, mat);
    this.quantumBeam.computeLineDistances();
    this.scene.add(this.quantumBeam);
    window.sound.success();
  }

  setupListeners() {
    window.addEventListener('resize', () => {
      if (!this.container) return;
      const width = this.container.clientWidth;
      const height = this.container.clientHeight;
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    const delta = this.clock.getDelta();
    const elapsed = this.clock.getElapsedTime();

    // Subtle terrain rotation
    if (this.terrain) {
      this.terrain.rotation.y = Math.sin(elapsed * 0.15) * 0.08;
    }

    // Expand scan rings
    for (let i = this.scanRings.length - 1; i >= 0; i--) {
      const ring = this.scanRings[i];
      ring.scale.x += ring.userData.scaleSpeed;
      ring.scale.z += ring.userData.scaleSpeed;
      ring.material.opacity -= 0.012;
      if (ring.scale.x >= ring.userData.maxScale || ring.material.opacity <= 0) {
        this.scene.remove(ring);
        this.scanRings.splice(i, 1);
      }
    }

    // Jamming flicker
    if (this.jammingActive && this.terrain) {
      this.terrain.material.opacity = 0.4 + Math.sin(elapsed * 25) * 0.25;
    }

    // Drone hover & orbit
    if (this.droneMarker) {
      this.droneMarker.position.y = 8 + Math.sin(elapsed * 1.5) * 1.2;
    }

    this.renderer.render(this.scene, this.camera);
  }
}

// Advanced Tactical 3D Simulation Engine (Three.js)
// Real-time Military Relief, Air/Ground Assets, Underground Cross-Section, Threat Systems

class TacticalScene {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.clock = new THREE.Clock();

    // Scene Elements
    this.terrain = null;
    this.stealthJet = null;
    this.rescueVehicle = null;
    this.undergroundBunker = null;
    this.jammingTower = null;
    this.jammingDome = null;
    this.fiberLine = null;
    this.eavesdropPost = null;
    this.patrolZones = [];
    this.scanWaves = [];
    this.optimalRouteSpline = null;
    this.jetTrailParticles = [];
    this.qkdPhotonBeam = null;

    // States
    this.jammingActive = false;
    this.eavesdropActive = false;
    this.bunkerDiscovered = false;
    this.routeSolved = false;

    this.init();
  }

  init() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x040810, 0.012);

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.set(0, 36, 52);
    this.camera.lookAt(0, 0, -4);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x040810, 1);
    this.container.appendChild(this.renderer.domElement);

    // Ambient & Tactical Lights
    const ambientLight = new THREE.AmbientLight(0x0b253a, 1.2);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x00e5ff, 1.4);
    dirLight.position.set(30, 50, 20);
    this.scene.add(dirLight);

    this.buildTerrain();
    this.buildStealthJet();
    this.buildRescueVehicle();
    this.buildUndergroundBunker();
    this.buildJammingTower();
    this.buildFiberLineAndEavesdrop();
    this.buildHazards();
    this.setupListeners();
    this.animate();
  }

  buildTerrain() {
    const size = 90;
    const segments = 60;
    const geometry = new THREE.PlaneGeometry(size, size, segments, segments);
    geometry.rotateX(-Math.PI / 2);

    const pos = geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);

      // Rugged Mountain Pass Topography
      let y = Math.sin(x * 0.09) * Math.cos(z * 0.09) * 6.5;
      y += Math.sin(x * 0.22 + 1.4) * Math.sin(z * 0.18) * 3.8;
      // Ridge lines & Valleys
      const distFromCenter = Math.sqrt(x * x + z * z);
      if (distFromCenter < 18) {
        y -= 2.5; // Natural valley pass for the convoy
      } else {
        y += Math.cos((x + z) * 0.08) * 4.2;
      }
      pos.setY(i, y);
    }
    geometry.computeVertexNormals();

    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      wireframe: true,
      transparent: true,
      opacity: 0.25
    });

    this.terrain = new THREE.Mesh(geometry, wireMat);
    this.terrain.position.y = 0;
    this.scene.add(this.terrain);

    // Deep grid floor below ground
    const grid = new THREE.GridHelper(size, 30, 0x0088bb, 0x031828);
    grid.position.y = -8;
    this.scene.add(grid);
  }

  buildStealthJet() {
    const jetGroup = new THREE.Group();

    // Swept delta-wing stealth body
    const bodyGeo = new THREE.ConeGeometry(1.6, 6, 4);
    bodyGeo.rotateX(Math.PI / 2);
    bodyGeo.scale(1.8, 0.4, 1.2);
    const bodyMat = new THREE.MeshBasicMaterial({ color: 0x00ffaa, wireframe: true });
    const jetBody = new THREE.Mesh(bodyGeo, bodyMat);
    jetGroup.add(jetBody);

    // Twin angled vertical fins
    const finGeo = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      -0.8, 0, -1.5,   -1.3, 1.2, -2.5,   -0.5, 0, -2.5,
       0.8, 0, -1.5,    1.3, 1.2, -2.5,    0.5, 0, -2.5
    ]);
    finGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    const finMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff, wireframe: true });
    const fins = new THREE.Mesh(finGeo, finMat);
    jetGroup.add(fins);

    jetGroup.position.set(-25, 20, 20);
    this.stealthJet = jetGroup;
    this.scene.add(this.stealthJet);
  }

  buildRescueVehicle() {
    const convoy = new THREE.Group();

    // Armored 8x8 chassis
    const bodyGeo = new THREE.BoxGeometry(2.4, 1.4, 4.8);
    const bodyMat = new THREE.MeshBasicMaterial({ color: 0x33bbff, wireframe: true });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1.0;
    convoy.add(body);

    // Medical Cross symbol on roof
    const crossHGeo = new THREE.BoxGeometry(1.6, 0.1, 0.5);
    const crossVGeo = new THREE.BoxGeometry(0.5, 0.1, 1.6);
    const crossMat = new THREE.MeshBasicMaterial({ color: 0x00ff88 });
    const crossH = new THREE.Mesh(crossHGeo, crossMat);
    const crossV = new THREE.Mesh(crossVGeo, crossMat);
    crossH.position.set(0, 1.75, 0);
    crossV.position.set(0, 1.75, 0);
    convoy.add(crossH);
    convoy.add(crossV);

    // Forward Searchlight Beam
    const lightBeamGeo = new THREE.ConeGeometry(2.5, 10, 8, 1, true);
    lightBeamGeo.rotateX(-Math.PI / 2);
    lightBeamGeo.translate(0, 0, 5);
    const lightBeamMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide
    });
    const searchlight = new THREE.Mesh(lightBeamGeo, lightBeamMat);
    searchlight.position.set(0, 1.2, 2.4);
    convoy.add(searchlight);

    convoy.position.set(-20, 1.5, 16);
    this.rescueVehicle = convoy;
    this.scene.add(this.rescueVehicle);
  }

  buildUndergroundBunker() {
    const bunker = new THREE.Group();

    // 40m Subterranean Cavity Chamber
    const roomGeo = new THREE.BoxGeometry(5, 3, 5);
    const roomMat = new THREE.MeshBasicMaterial({ color: 0x00ffaa, wireframe: true });
    const room = new THREE.Mesh(roomGeo, roomMat);
    bunker.add(room);

    // Underground Medical Beacon
    const beaconGeo = new THREE.SphereGeometry(0.8, 12, 12);
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0x00ff88 });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    bunker.add(beacon);

    // Vertical Borehole / Secret Access shaft
    const shaftGeo = new THREE.CylinderGeometry(0.4, 0.4, 12, 8);
    const shaftMat = new THREE.MeshBasicMaterial({ color: 0x006655, wireframe: true, transparent: true, opacity: 0.4 });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    shaft.position.y = 6;
    bunker.add(shaft);

    bunker.position.set(16, -6.5, -12); // Deep underground (under mountain pass)
    bunker.visible = false;
    this.undergroundBunker = bunker;
    this.scene.add(this.undergroundBunker);
  }

  buildJammingTower() {
    const tower = new THREE.Group();

    // Lattice electronic warfare mast
    const mastGeo = new THREE.CylinderGeometry(0.2, 1.6, 9, 4);
    const mastMat = new THREE.MeshBasicMaterial({ color: 0xff2a4b, wireframe: true });
    const mast = new THREE.Mesh(mastGeo, mastMat);
    tower.add(mast);

    // Radome array emitter
    const domeGeo = new THREE.SphereGeometry(1.4, 8, 8);
    const domeMat = new THREE.MeshBasicMaterial({ color: 0xff0033, wireframe: true });
    const dome = new THREE.Mesh(domeGeo, domeMat);
    dome.position.y = 5;
    tower.add(dome);

    // Jamming Interference Sphere (Pulsing Dome)
    const bubbleGeo = new THREE.SphereGeometry(18, 24, 24);
    const bubbleMat = new THREE.MeshBasicMaterial({
      color: 0xff2a4b,
      wireframe: true,
      transparent: true,
      opacity: 0.18
    });
    this.jammingDome = new THREE.Mesh(bubbleGeo, bubbleMat);
    this.jammingDome.position.y = 5;
    this.jammingDome.visible = false;
    tower.add(this.jammingDome);

    tower.position.set(-8, 5, -8);
    this.jammingTower = tower;
    this.scene.add(this.jammingTower);
  }

  buildFiberLineAndEavesdrop() {
    // Optical fiber cable on the ground
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(16, -6.5, -12),
      new THREE.Vector3(12, 0, -4),
      new THREE.Vector3(2, 0, 8),
      new THREE.Vector3(-14, 0, 14)
    ]);
    const geom = new THREE.TubeGeometry(curve, 35, 0.15, 6, false);
    const mat = new THREE.MeshBasicMaterial({ color: 0x0088ff, wireframe: true });
    this.fiberLine = new THREE.Mesh(geom, mat);
    this.scene.add(this.fiberLine);

    // Eavesdropping Outpost Node (The Spy 'Eve' Tapping the Cable)
    const tapGroup = new THREE.Group();
    const tapBoxGeo = new THREE.BoxGeometry(2, 1.2, 2);
    const tapBoxMat = new THREE.MeshBasicMaterial({ color: 0xffaa00, wireframe: true });
    const tapBox = new THREE.Mesh(tapBoxGeo, tapBoxMat);
    tapGroup.add(tapBox);

    // Sniffer radar dish
    const dishGeo = new THREE.ConeGeometry(1.2, 1.5, 8, 1, true);
    dishGeo.rotateX(-Math.PI / 3);
    const dishMat = new THREE.MeshBasicMaterial({ color: 0xff8800, wireframe: true });
    const dish = new THREE.Mesh(dishGeo, dishMat);
    dish.position.set(0, 1.4, 0);
    tapGroup.add(dish);

    tapGroup.position.set(2, 1.8, 8);
    this.eavesdropPost = tapGroup;
    this.scene.add(this.eavesdropPost);
  }

  buildHazards() {
    // Landslide barrier debris (Mission 3 obstacle)
    const rocks = new THREE.Group();
    for (let i = 0; i < 7; i++) {
      const rockGeo = new THREE.DodecahedronGeometry(1.2 + Math.random() * 0.8, 0);
      const rockMat = new THREE.MeshBasicMaterial({ color: 0x885533, wireframe: true });
      const rock = new THREE.Mesh(rockGeo, rockMat);
      rock.position.set(-6 + Math.random() * 4, 1.5 + Math.random() * 0.5, 6 + Math.random() * 3);
      rocks.add(rock);
    }
    this.scene.add(rocks);

    // Enemy Patrol Search Cones (Red ground hazard circles)
    const patrolPositions = [
      new THREE.Vector3(6, 2, 2),
      new THREE.Vector3(-12, 3, -6)
    ];
    patrolPositions.forEach((pos, idx) => {
      const circleGeo = new THREE.RingGeometry(2.5, 3.2, 16);
      circleGeo.rotateX(-Math.PI / 2);
      const circleMat = new THREE.MeshBasicMaterial({
        color: 0xff2a4b,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.4
      });
      const patrol = new THREE.Mesh(circleGeo, circleMat);
      patrol.position.copy(pos);
      patrol.userData = { initialX: pos.x, offset: idx * Math.PI };
      this.patrolZones.push(patrol);
      this.scene.add(patrol);
    });
  }

  // Tactical Triggers
  revealUndergroundBunker() {
    this.bunkerDiscovered = true;
    this.undergroundBunker.visible = true;

    // Trigger expanding quantum gravity scan waves
    for (let i = 0; i < 4; i++) {
      const waveGeo = new THREE.RingGeometry(0.8, 1.6, 32);
      waveGeo.rotateX(-Math.PI / 2);
      const waveMat = new THREE.MeshBasicMaterial({
        color: 0x00ff88,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.95
      });
      const wave = new THREE.Mesh(waveGeo, waveMat);
      wave.position.copy(this.undergroundBunker.position);
      wave.userData = { speed: 0.12 + i * 0.04, maxRadius: 26 };
      this.scene.add(wave);
      this.scanWaves.push(wave);
    }
  }

  activateJamming() {
    this.jammingActive = true;
    if (this.jammingDome) this.jammingDome.visible = true;
    if (this.terrain) {
      this.terrain.material.color.setHex(0xff2a4b);
      this.terrain.material.opacity = 0.5;
    }
  }

  clearJamming() {
    this.jammingActive = false;
    if (this.jammingDome) this.jammingDome.visible = false;
    if (this.terrain) {
      this.terrain.material.color.setHex(0x00e5ff);
      this.terrain.material.opacity = 0.25;
    }
  }

  renderOptimalQuantumRoute() {
    this.routeSolved = true;
    if (this.optimalRouteSpline) this.scene.remove(this.optimalRouteSpline);

    const safePoints = [
      new THREE.Vector3(-20, 1.5, 16),
      new THREE.Vector3(-14, 2, 10),
      new THREE.Vector3(-4, 2.5, 1),
      new THREE.Vector3(4, 2, -5),
      new THREE.Vector3(12, 1, -10),
      new THREE.Vector3(16, -6.5, -12)
    ];
    const curve = new THREE.CatmullRomCurve3(safePoints);
    const tubeGeo = new THREE.TubeGeometry(curve, 50, 0.25, 8, false);
    const tubeMat = new THREE.MeshBasicMaterial({
      color: 0x00ff88,
      wireframe: true
    });
    this.optimalRouteSpline = new THREE.Mesh(tubeGeo, tubeMat);
    this.scene.add(this.optimalRouteSpline);
  }

  triggerQKDShield() {
    if (this.qkdPhotonBeam) this.scene.remove(this.qkdPhotonBeam);

    // Laser photon conduit to satellite
    const points = [
      new THREE.Vector3(16, -6.5, -12),
      new THREE.Vector3(0, 32, 0)
    ];
    const geom = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineDashedMaterial({
      color: 0x00ffaa,
      dashSize: 1.5,
      gapSize: 0.8,
      linewidth: 3
    });
    this.qkdPhotonBeam = new THREE.Line(geom, mat);
    this.qkdPhotonBeam.computeLineDistances();
    this.scene.add(this.qkdPhotonBeam);

    // Neutralize enemy wiretap outpost
    if (this.eavesdropPost) {
      this.eavesdropPost.children.forEach(c => c.material.color.setHex(0x555555));
    }
  }

  setupListeners() {
    window.addEventListener('resize', () => {
      if (!this.container) return;
      const width = this.container.clientWidth || window.innerWidth;
      const height = this.container.clientHeight || window.innerHeight;
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    });

    // Gentle camera orbit on mouse move
    window.addEventListener('mousemove', (e) => {
      const mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      const mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
      this.camera.position.x = mouseX * 8;
      this.camera.position.y = 36 + mouseY * 4;
      this.camera.lookAt(0, -2, -4);
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    const elapsed = this.clock.getElapsedTime();

    // Jet Flight Path (Looped figure-eight reconnaissance over terrain)
    if (this.stealthJet) {
      const t = elapsed * 0.45;
      const jetX = Math.sin(t) * 28;
      const jetZ = Math.sin(t * 2) * 14;
      this.stealthJet.position.set(jetX, 18 + Math.cos(t) * 3, jetZ);
      this.stealthJet.rotation.y = -Math.atan2(Math.cos(t * 2) * 28, Math.cos(t) * 28) + Math.PI / 2;
      this.stealthJet.rotation.z = Math.sin(t) * 0.35; // Bank angle
    }

    // Rescue Vehicle along pass
    if (this.rescueVehicle && !this.routeSolved) {
      this.rescueVehicle.position.x = -20 + Math.sin(elapsed * 0.5) * 1.5;
    } else if (this.rescueVehicle && this.routeSolved) {
      // Progress convoy forward along path
      const moveProgress = (Math.sin(elapsed * 0.4) + 1) / 2;
      this.rescueVehicle.position.x = -20 + moveProgress * 32;
      this.rescueVehicle.position.z = 16 - moveProgress * 24;
    }

    // Jamming Dome pulsing
    if (this.jammingActive && this.jammingDome) {
      const pulse = 1 + Math.sin(elapsed * 12) * 0.08;
      this.jammingDome.scale.set(pulse, pulse, pulse);
    }

    // Expand Quantum Scan Waves
    for (let i = this.scanWaves.length - 1; i >= 0; i--) {
      const wave = this.scanWaves[i];
      wave.scale.x += wave.userData.speed;
      wave.scale.z += wave.userData.speed;
      wave.material.opacity -= 0.01;
      if (wave.scale.x >= wave.userData.maxRadius || wave.material.opacity <= 0) {
        this.scene.remove(wave);
        this.scanWaves.splice(i, 1);
      }
    }

    // Patrol Zones Oscillating
    this.patrolZones.forEach(pz => {
      pz.position.x = pz.userData.initialX + Math.sin(elapsed * 1.2 + pz.userData.offset) * 4.5;
    });

    this.renderer.render(this.scene, this.camera);
  }
}

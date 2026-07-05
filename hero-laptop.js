  import * as THREE from 'three';

  const container = document.getElementById('hero3DScene');
  const reduceMotion3D = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (container) {
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(44, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0.85, 0.55, 5.0);
    camera.lookAt(0, -0.14, -0.15);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // lighting tuned to the site's blue brand palette
    scene.add(new THREE.AmbientLight(0x8fa6d9, 0.6));

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.7);
    keyLight.position.set(3, 4, 5);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x7d9bdb, 2.4);
    rimLight.position.set(-4, 2, -3);
    scene.add(rimLight);

    const fillLight = new THREE.PointLight(0x2648a8, 1.6, 20);
    fillLight.position.set(-2, -1, 3);
    scene.add(fillLight);

    const screenLight = new THREE.PointLight(0x6fa8ff, 1.4, 6);
    screenLight.position.set(0, 0.3, 1.4);
    scene.add(screenLight);

    // ---------- build one single laptop object ----------
    const pivot = new THREE.Group();
    scene.add(pivot);

    const laptop = new THREE.Group();
    pivot.add(laptop);

    const bodyColor = 0x141824;
    const bodyMat = new THREE.MeshStandardMaterial({ color: bodyColor, metalness: 0.75, roughness: 0.32 });
    const edgeMat = new THREE.MeshStandardMaterial({ color: 0x0a0d16, metalness: 0.6, roughness: 0.4 });

    // base / keyboard deck
    const baseW = 3.2, baseD = 2.1, baseH = 0.14;
    const base = new THREE.Mesh(new THREE.BoxGeometry(baseW, baseH, baseD, 1, 1, 1), bodyMat);
    base.position.y = -0.85;
    laptop.add(base);

    // subtle bevel/lip along the front edge of the base
    const lip = new THREE.Mesh(new THREE.BoxGeometry(baseW * 0.998, 0.03, 0.06), edgeMat);
    lip.position.set(0, -0.85 - baseH / 2 - 0.01, baseD / 2 - 0.02);
    laptop.add(lip);

    // keyboard deck inset (darker plate with key-like grid via emissive-less texture-free trick: small raised keys)
    const deckPlate = new THREE.Mesh(
      new THREE.BoxGeometry(baseW * 0.88, 0.02, baseD * 0.62),
      new THREE.MeshStandardMaterial({ color: 0x0d1120, metalness: 0.5, roughness: 0.6 })
    );
    deckPlate.position.set(0, -0.85 + baseH / 2 + 0.011, -0.08);
    laptop.add(deckPlate);

    const keyMat = new THREE.MeshStandardMaterial({ color: 0x1c2436, metalness: 0.3, roughness: 0.7 });
    const keyGeo = new THREE.BoxGeometry(0.145, 0.014, 0.12);
    const keyCols = 13, keyRows = 4;
    const keyAreaW = baseW * 0.80, keyAreaD = baseD * 0.42;
    // Keys must be centered on the deck plate (z = -0.08), not measured from
    // an arbitrary offset — the old formula pushed row 4 out to z ≈ -1.09,
    // past the back edge of the base entirely, which is why the keyboard
    // looked broken/floating off the laptop. This keeps every row inside
    // the deck plate's actual bounds.
    const deckCenterZ = -0.08;
    for (let r = 0; r < keyRows; r++) {
      for (let c = 0; c < keyCols; c++) {
        const key = new THREE.Mesh(keyGeo, keyMat);
        const x = -keyAreaW / 2 + (c + 0.5) * (keyAreaW / keyCols);
        const z = deckCenterZ - keyAreaD / 2 + (r + 0.5) * (keyAreaD / keyRows);
        key.position.set(x, -0.85 + baseH / 2 + 0.022, z);
        laptop.add(key);
      }
    }

    // trackpad
    const trackpad = new THREE.Mesh(
      new THREE.BoxGeometry(0.85, 0.012, 0.55),
      new THREE.MeshStandardMaterial({ color: 0x0a0d16, metalness: 0.4, roughness: 0.5 })
    );
    trackpad.position.set(0, -0.85 + baseH / 2 + 0.011, 0.62);
    laptop.add(trackpad);

    // screen assembly (hinged group so it can be angled like an open laptop)
    const hinge = new THREE.Group();
    hinge.position.set(0, -0.85 + baseH / 2, -baseD / 2 + 0.06);
    laptop.add(hinge);

    const screenW = 3.06, screenH = 1.98, screenT = 0.09;

    // outer lid (back of screen, brand-blue brushed metal)
    const lid = new THREE.Mesh(
      new THREE.BoxGeometry(screenW, screenH, screenT),
      new THREE.MeshStandardMaterial({ color: 0x1c2c5e, metalness: 0.8, roughness: 0.28 })
    );
    lid.position.set(0, screenH / 2, -screenT / 2);
    hinge.add(lid);

    // logo mark on the lid back
    const logoRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.16, 0.012, 12, 40),
      new THREE.MeshStandardMaterial({ color: 0x7d9bdb, metalness: 0.9, roughness: 0.2, emissive: 0x2648a8, emissiveIntensity: 0.4 })
    );
    logoRing.position.set(0, screenH / 2, -screenT - 0.006);
    hinge.add(logoRing);

    // bezel (front frame)
    const bezel = new THREE.Mesh(
      new THREE.BoxGeometry(screenW, screenH, 0.03),
      new THREE.MeshStandardMaterial({ color: 0x0a0a0a, metalness: 0.4, roughness: 0.5 })
    );
    bezel.position.set(0, screenH / 2, 0.015);
    hinge.add(bezel);

    // display panel (glowing, shows soft "site" chips like the brand mock)
    const displayW = screenW * 0.92, displayH = screenH * 0.90;
    const display = new THREE.Mesh(
      new THREE.PlaneGeometry(displayW, displayH),
      new THREE.MeshStandardMaterial({
        color: 0x050505,
        emissive: 0x0f1830,
        emissiveIntensity: 1.1,
        roughness: 0.25,
        metalness: 0.1
      })
    );
    display.position.set(0, screenH / 2, 0.032);
    hinge.add(display);

    // soft top glow band on the screen
    const glowBand = new THREE.Mesh(
      new THREE.PlaneGeometry(displayW * 0.94, displayH * 0.4),
      new THREE.MeshBasicMaterial({ color: 0x3f6fd6, transparent: true, opacity: 0.16 })
    );
    glowBand.position.set(0, screenH / 2 + displayH * 0.22, 0.033);
    hinge.add(glowBand);

    // UI "code line" chip bars on screen, echoing the site palette —
    // denser rows so it reads like an editor full of code, matching the
    // reference mock (alternating red/blue/gold/teal/purple line segments).
    const chipData = [
      { w: 0.20, x: -0.62, y: 0.34, color: 0xff7878 },
      { w: 0.34, x: -0.36, y: 0.34, color: 0x9fc1ff },
      { w: 0.24, x: 0.02, y: 0.34, color: 0xffd678 },

      { w: 0.18, x: -0.62, y: 0.25, color: 0x7ee0c0 },
      { w: 0.30, x: -0.38, y: 0.25, color: 0xc9a6ff },
      { w: 0.20, x: -0.03, y: 0.25, color: 0xffd678 },

      { w: 0.22, x: -0.62, y: 0.16, color: 0xff7878 },
      { w: 0.28, x: -0.34, y: 0.16, color: 0x9fc1ff },

      { w: 0.36, x: -0.55, y: 0.07, color: 0x3a4a78 },
      { w: 0.16, x: -0.14, y: 0.07, color: 0x7ee0c0 },

      { w: 0.20, x: -0.62, y: -0.02, color: 0xc9a6ff },
      { w: 0.30, x: -0.36, y: -0.02, color: 0xffd678 },
      { w: 0.14, x: 0.00, y: -0.02, color: 0xff7878 },

      { w: 0.24, x: -0.60, y: -0.11, color: 0x9fc1ff },
      { w: 0.26, x: -0.30, y: -0.11, color: 0x7ee0c0 },

      { w: 0.45, x: -0.48, y: -0.20, color: 0x3a4a78 },

      { w: 0.16, x: -0.62, y: -0.29, color: 0xffd678 },
      { w: 0.22, x: -0.40, y: -0.29, color: 0xc9a6ff },

      { w: 0.34, x: -0.52, y: -0.38, color: 0x2648a8 }
    ];
    chipData.forEach(c => {
      const chip = new THREE.Mesh(
        new THREE.PlaneGeometry(c.w, 0.045),
        new THREE.MeshBasicMaterial({ color: c.color, transparent: true, opacity: 0.9 })
      );
      chip.position.set(c.x, screenH / 2 + c.y, 0.034);
      hinge.add(chip);
    });

    // open the lid to a natural laptop angle
    // At rotation.x = 0 the screen already stands straight up (a 90°-open
    // book/laptop). A small further negative rotation reclines it back
    // slightly, like a real laptop open to ~110°.
    hinge.rotation.x = -0.36; // ~ -20.6deg recline from vertical

    // frame the whole thing, then tilt/rotate the pivot for a nice 3/4 view
    const box = new THREE.Box3().setFromObject(laptop);
    const center = box.getCenter(new THREE.Vector3());
    laptop.position.sub(center);
    laptop.position.y += 0.1;

    pivot.rotation.x = 0.03;
    const baseYaw = -0.42; // starting angle — the laptop spins continuously from here
    pivot.rotation.y = baseYaw;

    function resize3D() {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.render(scene, camera);
    }
    window.addEventListener('resize', resize3D);
    resize3D();

    let rafId3D;
    const clock3D = { start: performance.now() };
    function animate3D() {
      const t = (performance.now() - clock3D.start) / 1000;
      // continuous full 360° rotation, left to right, forever — not a
      // back-and-forth sway. rotation.y just keeps increasing; three.js
      // wraps the angle automatically, so this spins smoothly without limit.
      pivot.rotation.y = baseYaw + t * 0.4;
      pivot.rotation.x = 0.03 + Math.sin(t * 0.25) * 0.012;
      renderer.render(scene, camera);
      rafId3D = requestAnimationFrame(animate3D);
    }

    if (!reduceMotion3D) {
      animate3D();
    } else {
      renderer.render(scene, camera);
    }

    // pause rendering when the tab isn't visible to save battery/CPU
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (rafId3D) cancelAnimationFrame(rafId3D);
      } else if (!reduceMotion3D) {
        animate3D();
      }
    });
  }

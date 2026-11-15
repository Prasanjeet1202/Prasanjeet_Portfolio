
import * as THREE from "three";

(() => {
  const canvas = document.getElementById("hero3dCanvas");
  const hero = document.querySelector(".hero");
  const wrapper = document.querySelector(".hero-3d");

  if (!canvas || !hero || !wrapper) return;

  const isMobile = window.innerWidth <= 768;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !isMobile,
    alpha: true,
    powerPreference: "high-performance"
  });

  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    36,
    1,
    0.1,
    100
  );

  camera.position.set(0, 0, 7.8);

  const sculpture = new THREE.Group();
  scene.add(sculpture);

  const chromeMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xc9c9c6,
    metalness: 0.94,
    roughness: 0.19,
    clearcoat: 1,
    clearcoatRoughness: 0.12,
    side: THREE.DoubleSide
  });

  const edgeMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x777b80,
    metalness: 0.95,
    roughness: 0.22
  });

  const copperMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x9b3d20,
    metalness: 0.85,
    roughness: 0.24,
    clearcoat: 1
  });

  function createRibbon() {
    const geometry = new THREE.BufferGeometry();

    const LOOP_SEGMENTS = 280;
    const WIDTH_SEGMENTS = 24;
    const WIDTH = 0.62;

    const positions = [];
    const uvs = [];
    const indices = [];

    for (let i = 0; i <= LOOP_SEGMENTS; i++) {
      const t = (i / LOOP_SEGMENTS) * Math.PI * 2;

      const center = new THREE.Vector3(
        1.32 * Math.cos(t),
        1.62 * Math.sin(t),
        0.38 * Math.sin(2 * t)
      );

      const tangent = new THREE.Vector3(
        -1.32 * Math.sin(t),
        1.62 * Math.cos(t),
        0.76 * Math.cos(2 * t)
      ).normalize();

      const radial = new THREE.Vector3(
        Math.cos(t),
        Math.sin(t),
        0
      ).normalize();

      const binormal = new THREE.Vector3()
        .crossVectors(tangent, radial)
        .normalize();

      const twist = 0.55 * Math.sin(2 * t);
      const bow = 0.13 * Math.sin(3 * t);

      for (let j = 0; j <= WIDTH_SEGMENTS; j++) {
        const v = j / WIDTH_SEGMENTS;
        const across = (v - 0.5) * WIDTH;

        const twistedRadial = radial.clone()
          .multiplyScalar(Math.cos(twist))
          .add(
            binormal.clone().multiplyScalar(Math.sin(twist))
          )
          .normalize();

        const point = center.clone()
          .add(twistedRadial.multiplyScalar(across))
          .add(
            binormal.clone().multiplyScalar(
              bow * Math.sin(v * Math.PI)
            )
          );

        positions.push(point.x, point.y, point.z);
        uvs.push(i / LOOP_SEGMENTS, v);
      }
    }

    for (let i = 0; i < LOOP_SEGMENTS; i++) {
      for (let j = 0; j < WIDTH_SEGMENTS; j++) {
        const a = i * (WIDTH_SEGMENTS + 1) + j;
        const b = a + WIDTH_SEGMENTS + 1;

        indices.push(a, b, a + 1);
        indices.push(b, b + 1, a + 1);
      }
    }

    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
    );

    geometry.setAttribute(
      "uv",
      new THREE.Float32BufferAttribute(uvs, 2)
    );

    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    return geometry;
  }

  const ribbon = new THREE.Mesh(
    createRibbon(),
    chromeMaterial
  );

  sculpture.add(ribbon);

  function createEdgeCurve(side, material) {
    const points = [];
    const segments = 280;

    for (let i = 0; i <= segments; i++) {
      const t = (i / segments) * Math.PI * 2;

      const center = new THREE.Vector3(
        1.32 * Math.cos(t),
        1.62 * Math.sin(t),
        0.38 * Math.sin(2 * t)
      );

      const tangent = new THREE.Vector3(
        -1.32 * Math.sin(t),
        1.62 * Math.cos(t),
        0.76 * Math.cos(2 * t)
      ).normalize();

      const radial = new THREE.Vector3(
        Math.cos(t),
        Math.sin(t),
        0
      ).normalize();

      const binormal = new THREE.Vector3()
        .crossVectors(tangent, radial)
        .normalize();

      const twist = 0.55 * Math.sin(2 * t);

      const twistedRadial = radial.clone()
        .multiplyScalar(Math.cos(twist))
        .add(
          binormal.clone().multiplyScalar(Math.sin(twist))
        )
        .normalize();

      const point = center.clone().add(
        twistedRadial.multiplyScalar(side * 0.31)
      );

      points.push(point);
    }

    const curve = new THREE.CatmullRomCurve3(
      points,
      true
    );

    const geometry = new THREE.TubeGeometry(
      curve,
      280,
      0.012,
      8,
      true
    );

    return new THREE.Mesh(geometry, material);
  }

  sculpture.add(
    createEdgeCurve(-1, edgeMaterial)
  );

  sculpture.add(
    createEdgeCurve(1, copperMaterial)
  );

  const secondaryCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1.5, -0.9, -0.35),
    new THREE.Vector3(-1.1, -1.5, -0.1),
    new THREE.Vector3(0.1, -1.65, 0.15),
    new THREE.Vector3(1.35, -0.8, 0.3),
    new THREE.Vector3(1.65, 0.35, 0.1)
  ]);

  const secondaryArc = new THREE.Mesh(
    new THREE.TubeGeometry(
      secondaryCurve,
      180,
      0.025,
      12,
      false
    ),
    chromeMaterial
  );

  sculpture.add(secondaryArc);

  // Studio lighting

  scene.add(
    new THREE.AmbientLight(0xffffff, 0.65)
  );

  const keyLight = new THREE.DirectionalLight(
    0xffffff,
    3.2
  );

  keyLight.position.set(-3, 4, 5);
  scene.add(keyLight);

  const softbox = new THREE.PointLight(
    0xffffff,
    28,
    20
  );

  softbox.position.set(3, 2, 4);
  scene.add(softbox);

  const warmRim = new THREE.PointLight(
    0xd94719,
    18,
    16
  );

  warmRim.position.set(2, -3, 2);
  scene.add(warmRim);

  const coolRim = new THREE.PointLight(
    0x8da8c9,
    12,
    16
  );

  coolRim.position.set(-4, -1, -2);
  scene.add(coolRim);

  // Initial positioning

  function setLayout() {
    const mobile = window.innerWidth <= 768;

    if (mobile) {
      sculpture.position.set(1.02, -0.02, -0.1);
      sculpture.scale.setScalar(0.47);
    } else {
      sculpture.position.set(1.62, 0.02, 0);
      sculpture.scale.setScalar(0.72);
    }

    sculpture.rotation.set(
      -0.12,
      -0.28,
      -0.08
    );
  }

  setLayout();

  // Responsive renderer

  function resize() {
    const width = wrapper.clientWidth;
    const height = wrapper.clientHeight;

    if (!width || !height) return;

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, window.innerWidth <= 768 ? 1.2 : 1.6)
    );

    renderer.setSize(width, height, false);

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  window.addEventListener("resize", () => {
    setLayout();
    resize();
  });

  resize();

  // Scroll animation

  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    gsap.to(sculpture.rotation, {
      y: sculpture.rotation.y + Math.PI * 1.15,
      x: sculpture.rotation.x + Math.PI * 0.24,
      z: sculpture.rotation.z + Math.PI * 0.12,
      ease: "none",
      scrollTrigger: {
        trigger: hero,
        start: "top top",
        end: "bottom top",
        scrub: 1
      }
    });

    gsap.to(sculpture.position, {
      y: -0.42,
      x: window.innerWidth <= 768 ? 0.92 : 1.48,
      ease: "none",
      scrollTrigger: {
        trigger: hero,
        start: "top top",
        end: "bottom top",
        scrub: 1
      }
    });

    gsap.to(sculpture.scale, {
      x: sculpture.scale.x * 1.08,
      y: sculpture.scale.y * 1.08,
      z: sculpture.scale.z * 1.08,
      ease: "none",
      scrollTrigger: {
        trigger: hero,
        start: "top top",
        end: "bottom top",
        scrub: 1
      }
    });
  }

  // Render only when hero is visible

  let animationFrame;
  let isVisible = true;

  function animate() {
    if (!isVisible) return;

    animationFrame = requestAnimationFrame(animate);

    renderer.render(scene, camera);
  }

  const observer = new IntersectionObserver(
    entries => {
      isVisible = entries[0].isIntersecting;

      if (isVisible) {
        cancelAnimationFrame(animationFrame);
        animate();
      } else {
        cancelAnimationFrame(animationFrame);
      }
    },
    { threshold: 0.01 }
  );

  observer.observe(hero);

  animate();

  wrapper.classList.add("is-ready");
})();

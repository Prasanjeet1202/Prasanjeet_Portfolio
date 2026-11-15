
import * as THREE from "three";

(() => {
    "use strict";

    const canvas = document.getElementById("hero3dCanvas");
    const hero = document.querySelector(".hero");
    const wrapper = document.querySelector(".hero-3d");

    if (!canvas || !hero || !wrapper) return;

    // Respect devices without WebGL.
    let renderer;

    try {
        renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: window.innerWidth > 768,
            alpha: true,
            powerPreference: "low-power"
        });
    } catch (error) {
        console.warn("3D hero could not start:", error);
        return;
    }

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
        38,
        1,
        0.1,
        100
    );

    camera.position.set(0, 0, 7.5);

    // Main sculpture group
    const sculpture = new THREE.Group();
    scene.add(sculpture);

    // Metallic material
    const chromeMaterial = new THREE.MeshStandardMaterial({
        color: 0xaaa9a5,
        metalness: 0.92,
        roughness: 0.22
    });

    const orangeMaterial = new THREE.MeshStandardMaterial({
        color: 0xd94719,
        metalness: 0.78,
        roughness: 0.28,
        emissive: 0x4a1005,
        emissiveIntensity: 0.65
    });

    // Main twisted sculpture
    const mainGeometry = new THREE.TorusKnotGeometry(
        1.35,
        0.32,
        220,
        32,
        2,
        3
    );

    const mainSculpture = new THREE.Mesh(
        mainGeometry,
        chromeMaterial
    );

    sculpture.add(mainSculpture);

    // Inner orange metallic ring
    const ringGeometry = new THREE.TorusGeometry(
        0.88,
        0.025,
        12,
        140
    );

    const innerRing = new THREE.Mesh(
        ringGeometry,
        orangeMaterial
    );

    innerRing.rotation.x = Math.PI / 2.5;
    innerRing.rotation.y = Math.PI / 5;

    sculpture.add(innerRing);

    // Outer floating ring
    const outerRing = new THREE.Mesh(
        new THREE.TorusGeometry(1.95, 0.012, 8, 160),
        orangeMaterial
    );

    outerRing.rotation.x = Math.PI / 2.7;
    outerRing.rotation.y = Math.PI / 3.5;

    sculpture.add(outerRing);

    // Small floating metallic spheres
    const particleGeometry = new THREE.SphereGeometry(0.035, 12, 12);

    const particlePositions = [
        [-2.2, 0.9, 0],
        [2.1, -0.8, 0.3],
        [-1.8, -1.2, 0.5],
        [1.8, 1.2, -0.4],
        [0.1, 2.0, 0.2],
        [-0.3, -2.0, -0.2]
    ];

    particlePositions.forEach((position, index) => {
        const particle = new THREE.Mesh(
            particleGeometry,
            index % 2 === 0 ? orangeMaterial : chromeMaterial
        );

        particle.position.set(...position);
        sculpture.add(particle);
    });

    // Lighting
    const ambientLight = new THREE.AmbientLight(
        0xffffff,
        1.0
    );
    scene.add(ambientLight);

    const keyLight = new THREE.PointLight(
        0xffffff,
        65,
        15
    );
    keyLight.position.set(2.5, 3.5, 4);
    scene.add(keyLight);

    const orangeLight = new THREE.PointLight(
        0xff4b19,
        85,
        12
    );
    orangeLight.position.set(-3, -1, 2);
    scene.add(orangeLight);

    const rimLight = new THREE.PointLight(
        0x8d9cff,
        35,
        12
    );
    rimLight.position.set(1, -3, -3);
    scene.add(rimLight);

    // Initial sculpture position
    sculpture.position.set(1.35, 0, 0);
    sculpture.scale.setScalar(0.88);

    // Responsive renderer
    function resizeScene() {
        const width = hero.clientWidth;
        const height = hero.clientHeight;

        if (!width || !height) return;

        const pixelRatio = Math.min(
            window.devicePixelRatio || 1,
            window.innerWidth <= 768 ? 1.25 : 1.6
        );

        renderer.setPixelRatio(pixelRatio);
        renderer.setSize(width, height, false);

        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        // Adjust sculpture position for smaller screens
        if (width <= 768) {
            sculpture.position.x = 0.35;
            sculpture.scale.setScalar(0.68);
        } else {
            sculpture.position.x = 1.35;
            sculpture.scale.setScalar(0.88);
        }
    }

    resizeScene();

    window.addEventListener("resize", resizeScene);

    // Scroll-controlled movement
    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    if (
        !reducedMotion &&
        window.gsap &&
        window.ScrollTrigger
    ) {
        gsap.registerPlugin(ScrollTrigger);

        const scrollAnimation = gsap.timeline({
            scrollTrigger: {
                trigger: hero,
                start: "top top",
                end: "bottom top",
                scrub: 1
            }
        });

        scrollAnimation
            .to(sculpture.rotation, {
                y: Math.PI * 1.8,
                x: Math.PI * 0.65,
                z: Math.PI * 0.25,
                ease: "none"
            }, 0)
            .to(sculpture.position, {
                y: -0.75,
                x: 0.1,
                ease: "none"
            }, 0)
            .to(camera.position, {
                z: 6.2,
                ease: "none"
            }, 0)
            .to(sculpture.scale, {
                x: 1.05,
                y: 1.05,
                z: 1.05,
                ease: "none"
            }, 0);
    }

    // Static fallback for reduced motion or missing GSAP
    // No continuous animation loop is needed.

    let animationFrame;
    let isVisible = true;

    const observer = new IntersectionObserver((entries) => {
        isVisible = entries[0].isIntersecting;

        if (isVisible) {
            render();
        } else if (animationFrame) {
            cancelAnimationFrame(animationFrame);
            animationFrame = null;
        }
    });

    function render() {
        if (!isVisible) return;

        renderer.render(scene, camera);
        animationFrame = requestAnimationFrame(render);
    }

    observer.observe(hero);

    wrapper.classList.add("is-ready");

    render();

})();

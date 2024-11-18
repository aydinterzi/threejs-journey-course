import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";

const canvas = document.querySelector("canvas.webgl");

const scene = new THREE.Scene();
const fontloader = new FontLoader();

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  1000
);
camera.position.set(0, 0, 5);

scene.add(camera);

const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

const cardGeometry = new THREE.PlaneGeometry(3, 2);
const cardMaterial = new THREE.MeshStandardMaterial({
  color: 0x0077ff,
  side: THREE.DoubleSide,
});
const card = new THREE.Mesh(cardGeometry, cardMaterial);
scene.add(card);

fontloader.load("/fonts/helvetiker_regular.typeface.json", (font) => {
  const textGeometry = new TextGeometry("Aydin Terzi", {
    font: font,
    size: 0.2,
    depth: 0.05,
    bevelEnabled: true,
    bevelThickness: 0.01,
    bevelSize: 0.01,
  });

  const textMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const text = new THREE.Mesh(textGeometry, textMaterial);
  textGeometry.center();
  text.position.set(0, 0, 0.05);
  scene.add(text);
});

// const axesHelper = new THREE.AxesHelper();
// scene.add(axesHelper);
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Ortam ışığı
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(2, 2, 2); // Işığı yukarıdan ekle
scene.add(pointLight);

const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();

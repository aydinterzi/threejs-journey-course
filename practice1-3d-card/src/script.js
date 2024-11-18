import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";

const canvas = document.querySelector("canvas.webgl");

const scene = new THREE.Scene();
const fontloader = new FontLoader();
const textureLoader = new THREE.TextureLoader();

const cardTexture = textureLoader.load(
  "/textures/fabric_leather_01_diff_4k.jpg"
);
cardTexture.colorSpace = THREE.SRGBColorSpace;

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
camera.position.set(0, 0, 8);

scene.add(camera);

const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

const cardGeometry = new THREE.PlaneGeometry(6, 3);
const cardMaterial = new THREE.MeshStandardMaterial({
  map: cardTexture,
  side: THREE.DoubleSide,
});
const card = new THREE.Mesh(cardGeometry, cardMaterial);
scene.add(card);

fontloader.load("/fonts/helvetiker_regular.typeface.json", (font) => {
  const nameGeometry = new TextGeometry("Aydin Terzi", {
    font: font,
    size: 0.3,
    depth: 0.05,
  });
  const nameMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
  const nameText = new THREE.Mesh(nameGeometry, nameMaterial);
  nameGeometry.center();
  nameText.position.set(0, 1.2, 0.03); // Üst-orta
  card.add(nameText);

  // Meslek
  const jobGeometry = new TextGeometry("Frontend Developer", {
    font: font,
    size: 0.2,
    depth: 0.05,
  });
  const jobMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
  const jobText = new THREE.Mesh(jobGeometry, jobMaterial);
  jobGeometry.center();
  jobText.position.set(0, 0.8, 0.03); // İsim altında
  card.add(jobText);

  const marginLeft = -2.8;
  // Mail Adresi
  const mailGeometry = new TextGeometry("Mail: aydinterzi7@gmail.com", {
    font: font,
    size: 0.15,
    depth: 0.05,
  });
  const mailMaterial = new THREE.MeshStandardMaterial({ color: 0x555555 });
  const mailText = new THREE.Mesh(mailGeometry, mailMaterial);
  mailText.position.set(marginLeft, -0.5, 0.03); // Sol-alt
  card.add(mailText);

  // GitHub Adresi
  const githubGeometry = new TextGeometry("GitHub: github.com/aydinterzi", {
    font: font,
    size: 0.15,
    depth: 0.05,
  });
  const githubMaterial = new THREE.MeshStandardMaterial({ color: 0x555555 });
  const githubText = new THREE.Mesh(githubGeometry, githubMaterial);
  githubText.position.set(marginLeft, -0.8, 0.03); // Sol-alt
  card.add(githubText);

  // Medium Adresi
  const mediumGeometry = new TextGeometry(
    "Medium: https://medium.com/@aydinterzi7",
    {
      font: font,
      size: 0.15,
      depth: 0.05,
    }
  );
  const mediumMaterial = new THREE.MeshStandardMaterial({ color: 0x555555 });
  const mediumText = new THREE.Mesh(mediumGeometry, mediumMaterial);
  mediumText.position.set(marginLeft, -1.1, 0.03); // Sol-alt
  card.add(mediumText);
  // İş Yeri
  const companyGeometry = new TextGeometry("OBSS", {
    font: font,
    size: 0.15,
    depth: 0.05,
  });
  const companyMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
  const companyText = new THREE.Mesh(companyGeometry, companyMaterial);
  companyGeometry.center();
  companyText.position.set(2.4, -1.05, 0.03); // Sağ-alt
  card.add(companyText);
});

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

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

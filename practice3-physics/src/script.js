import * as THREE from "three";
import * as CANNON from "cannon-es";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// Scene, Camera ve Renderer Kurulumu
const canvas = document.querySelector("canvas.webgl");
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(0, 5, 10);
scene.add(camera);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(sizes.width, sizes.height);

// Cannon.js Dünya Kurulumu
const world = new CANNON.World();
world.gravity.set(0, -9.82, 0);

// Zemin için materyal tanımla
const groundMaterial = new CANNON.Material("ground");
const sphereMaterial = new CANNON.Material("sphere");

const contactMaterial = new CANNON.ContactMaterial(
  groundMaterial,
  sphereMaterial,
  {
    friction: 0.1,
    restitution: 0.7,
  }
);
world.addContactMaterial(contactMaterial);

// Zemin oluştur
const groundShape = new CANNON.Plane();
const groundBody = new CANNON.Body({
  mass: 0,
  material: groundMaterial,
});
groundBody.addShape(groundShape);
groundBody.quaternion.setFromAxisAngle(
  new CANNON.Vec3(-1, 0, 0),
  Math.PI * 0.5
);
world.addBody(groundBody);

const groundMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10),
  new THREE.MeshBasicMaterial({ color: 0x808080 })
);
groundMesh.rotation.x = -Math.PI * 0.5;
scene.add(groundMesh);

// Top oluştur
const sphereShape = new CANNON.Sphere(0.5);
const sphereBody = new CANNON.Body({
  mass: 1,
  position: new CANNON.Vec3(0, 3, 0),
  shape: sphereShape,
  material: sphereMaterial,
});
world.addBody(sphereBody);

const sphereMesh = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 32, 32),
  new THREE.MeshBasicMaterial({ color: 0xff0000 })
);
sphereMesh.position.set(0, 3, 0);
scene.add(sphereMesh);

const clock = new THREE.Clock();

const tick = () => {
  const deltaTime = clock.getDelta();
  world.step(1 / 60, deltaTime, 3);
  controls.update();
  sphereMesh.position.copy(sphereBody.position);
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
};

tick();

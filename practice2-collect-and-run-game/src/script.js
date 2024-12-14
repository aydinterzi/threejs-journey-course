import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const canvas = document.querySelector("canvas.webgl");

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.01,
  10000
);
camera.position.z = 5;
camera.position.y = 5;

scene.add(camera);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(sizes.width, sizes.height);

const raycaster = new THREE.Raycaster();

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

const mouse = new THREE.Vector2();

window.addEventListener("mousemove", (event) => {
  mouse.x = (event.clientX / sizes.width) * 2 - 1;
  mouse.y = -(event.clientY / sizes.height) * 2 + 1;
});

const keys = {};

window.addEventListener("keydown", (event) => {
  keys[event.key] = true;
});

window.addEventListener("keyup", (event) => {
  keys[event.key] = false;
});

let clock = new THREE.Clock();

const handleMovement = (delta) => {
  const speed = 5;
  if (keys["ArrowUp"]) {
    character.position.z -= speed * delta;
  }
  if (keys["ArrowDown"]) {
    character.position.z += speed * delta;
  }
  if (keys["ArrowLeft"]) {
    character.position.x -= speed * delta;
  }
  if (keys["ArrowRight"]) {
    character.position.x += speed * delta;
  }
};

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10),
  new THREE.MeshBasicMaterial({ color: "red" })
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

const character = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ color: "blue" })
);
character.position.y += character.geometry.parameters.height / 2;
scene.add(character);

const updateCamera = () => {
  camera.position.x = character.position.x;
  camera.position.z = character.position.z + 8;
  camera.lookAt(character.position);
};

const randomObjects = [];

const placeRandomObjects = (count) => {
  for (let i = 0; i < count; i++) {
    const randomPosition = new THREE.Vector3(
      (Math.random() - 0.5) * ground.geometry.parameters.width,
      0.5,
      (Math.random() - 0.5) * ground.geometry.parameters.height
    );

    const objectMesh = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshBasicMaterial({ color: "white" })
    );

    objectMesh.position.copy(randomPosition);
    randomObjects.push(objectMesh);
    scene.add(objectMesh);
  }
};

placeRandomObjects(10);

const collectObjects = () => {
  randomObjects.forEach((object, index) => {
    const distance = character.position.distanceTo(object.position);
    if (distance < 1) {
      createParticleEffect(object.position);
      scene.remove(object);
      randomObjects.splice(index, 1);
    }
  });
};

const createParticleEffect = (position) => {
  const particleGeometry = new THREE.SphereGeometry(0.1, 8, 8);
  const particleMaterial = new THREE.MeshBasicMaterial({ color: "yellow" });
  const particle = new THREE.Mesh(particleGeometry, particleMaterial);

  particle.position.copy(position);
  scene.add(particle);

  setTimeout(() => {
    scene.remove(particle);
  }, 500);
};

const tick = () => {
  const delta = clock.getDelta();
  handleMovement(delta);
  collectObjects();
  controls.update();
  updateCamera();
  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
};

tick();

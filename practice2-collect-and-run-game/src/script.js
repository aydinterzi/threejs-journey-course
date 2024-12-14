import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const canvas = document.querySelector("canvas.webgl");

const gltfLoader = new GLTFLoader();

let mixer = null;
let char = null;
let currentAction = null; // Mevcut animasyonu takip eder
let walkAction = null;
let runAction = null;
let idleAction = null;

// GLTF modeli yükleniyor
gltfLoader.load("./models/Fox/glTF/Fox.gltf", (gltf) => {
  char = gltf.scene;
  char.scale.set(0.025, 0.025, 0.025);
  scene.add(char);

  // Animation Mixer
  mixer = new THREE.AnimationMixer(char);

  // Animasyonları tanımlıyoruz
  idleAction = mixer.clipAction(gltf.animations[0]); // Survey
  walkAction = mixer.clipAction(gltf.animations[1]); // Walk
  runAction = mixer.clipAction(gltf.animations[2]); // Run

  // Varsayılan olarak idle animasyonu oynat
  currentAction = idleAction;
  currentAction.play();
});

const textureLoader = new THREE.TextureLoader();

const groundTextures = {
  color: textureLoader.load("./textures/ground/Ground082S_1K-JPG_Color.jpg"),
  ambientOcclusion: textureLoader.load(
    "./textures/ground/Ground082S_1K-JPG_AmbientOcclusion.jpg"
  ),
  displacement: textureLoader.load(
    "./textures/ground/Ground082S_1K-JPG_Displacement.jpg"
  ),
  normal: textureLoader.load(
    "./textures/ground/Ground082S_1K-JPG_NormalGL.jpg"
  ),
  roughness: textureLoader.load(
    "./textures/ground/Ground082S_1K-JPG_Roughness.jpg"
  ),
};

groundTextures.color.repeat.set(8, 8);
groundTextures.color.wrapS = THREE.RepeatWrapping;
groundTextures.color.wrapT = THREE.RepeatWrapping;

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.01,
  10000
);

camera.position.y = 30;

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
  const speed = keys["Shift"] ? 10 : 5; // Shift tuşu ile hızlı koşma
  let isMoving = false;

  if (char) {
    if (keys["ArrowUp"]) {
      char.position.z -= speed * delta;
      isMoving = true;
    }
    if (keys["ArrowDown"]) {
      char.position.z += speed * delta;
      isMoving = true;
    }
    if (keys["ArrowLeft"]) {
      char.position.x -= speed * delta;
      isMoving = true;
    }
    if (keys["ArrowRight"]) {
      char.position.x += speed * delta;
      isMoving = true;
    }
  }

  if (mixer) {
    if (isMoving) {
      const targetAction = keys["Shift"] ? runAction : walkAction;
      if (currentAction !== targetAction) {
        currentAction.crossFadeTo(targetAction, 0.3, true);
        targetAction.reset().play();
        currentAction = targetAction;
      }
    } else {
      if (currentAction !== idleAction) {
        currentAction.crossFadeTo(idleAction, 0.3, true);
        idleAction.reset().play();
        currentAction = idleAction;
      }
    }

    mixer.update(delta);
  }
};

const directionalLight = new THREE.DirectionalLight("#ffffff", 1);
directionalLight.position.set(10, 20, 5);
directionalLight.castShadow = true;
scene.add(directionalLight);

const ambientLight = new THREE.AmbientLight("#ffccaa", 0.3); // Hafif sıcak ton
scene.add(ambientLight);

const groundMaterial = new THREE.MeshStandardMaterial({
  map: groundTextures.color,
  aoMap: groundTextures.ambientOcclusion,
  displacementMap: groundTextures.displacement,
  normalMap: groundTextures.normal,
  roughnessMap: groundTextures.roughness,
});

const groundGeometry = new THREE.PlaneGeometry(50, 50, 64, 64);
groundGeometry.setAttribute(
  "uv2",
  new THREE.BufferAttribute(groundGeometry.attributes.uv.array, 2)
);

const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const character = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ color: "blue" })
);
character.position.y += character.geometry.parameters.height / 2;
scene.add(character);

const updateCamera = () => {
  if (char) {
    const targetPosition = new THREE.Vector3(
      char.position.x,
      char.position.y + 5,
      char.position.z + 10
    );

    camera.position.lerp(targetPosition, 0.1);
    camera.lookAt(char.position);
  }
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

const addTrees = () => {
  for (let i = 0; i < 5; i++) {
    const tree = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 1, 5, 8),
      new THREE.MeshStandardMaterial({ color: "green" })
    );
    tree.position.set(
      (Math.random() - 0.5) * 40,
      2.5,
      (Math.random() - 0.5) * 40
    );
    scene.add(tree);
  }
};
addTrees();

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
  const particleGeometry = new THREE.BufferGeometry();
  const particleCount = 50;
  const positions = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = position.x + (Math.random() - 0.5) * 2;
    positions[i * 3 + 1] = position.y + (Math.random() - 0.5) * 2;
    positions[i * 3 + 2] = position.z + (Math.random() - 0.5) * 2;
  }

  particleGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );

  const particleMaterial = new THREE.PointsMaterial({
    color: "yellow",
    size: 0.1,
  });

  const particles = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particles);

  setTimeout(() => {
    scene.remove(particles);
  }, 1000);
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

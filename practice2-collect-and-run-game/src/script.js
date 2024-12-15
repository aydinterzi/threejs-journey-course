import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// Scene, Camera, Renderer setup
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

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

const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.shadowMap.enabled = true;

// Orbit Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// Lights
const directionalLight = new THREE.DirectionalLight("#ffffff", 1);
directionalLight.position.set(5, 10, 5);
directionalLight.castShadow = true;
scene.add(directionalLight);

const ambientLight = new THREE.AmbientLight("#ffffff", 0.5);
scene.add(ambientLight);

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

// Textures for Ground
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

groundTextures.color.repeat.set(10, 10);
groundTextures.color.wrapS = THREE.RepeatWrapping;
groundTextures.color.wrapT = THREE.RepeatWrapping;

// Ground
const groundGeometry = new THREE.PlaneGeometry(50, 50, 64, 64);
const groundMaterial = new THREE.MeshStandardMaterial({
  map: groundTextures.color,
  aoMap: groundTextures.ambientOcclusion,
  displacementMap: groundTextures.displacement,
  normalMap: groundTextures.normal,
  roughnessMap: groundTextures.roughness,
});
groundGeometry.setAttribute(
  "uv2",
  new THREE.BufferAttribute(groundGeometry.attributes.uv.array, 2)
);

const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// GLTF Model (Fox)
const gltfLoader = new GLTFLoader();
let mixer = null;
let fox = null;
let currentAction = null;
const actions = {};

// Fox modelini yükleme
gltfLoader.load("./models/Fox/glTF/Fox.gltf", (gltf) => {
  fox = gltf.scene;
  fox.scale.set(0.025, 0.025, 0.025);
  fox.position.set(0, 0, 0);
  scene.add(fox);

  // Animasyon Mixer'i kur
  mixer = new THREE.AnimationMixer(fox);

  // Animasyonları actions nesnesine ekle
  actions.idle = mixer.clipAction(gltf.animations[0]); // Idle
  actions.walk = mixer.clipAction(gltf.animations[1]); // Walk
  actions.run = mixer.clipAction(gltf.animations[2]); // Run

  // Varsayılan animasyon: Idle
  setAction(actions.idle);
});

const setAction = (action) => {
  if (currentAction === action) return;

  if (currentAction) {
    currentAction.fadeOut(0.5); // Geçişi yumuşat
  }

  currentAction = action;
  currentAction.reset().fadeIn(0.5).play(); // Yeni animasyonu oynat
};

// Movement and Animation Handling
const keys = {};
window.addEventListener("keydown", (event) => (keys[event.key] = true));
window.addEventListener("keyup", (event) => (keys[event.key] = false));

const handleMovement = (delta) => {
  if (!fox) return;

  const speed = keys["Shift"] ? 10 : 5;
  const direction = new THREE.Vector3();
  let isMoving = false;

  if (keys["ArrowUp"]) {
    fox.position.z -= speed * delta;
    direction.z = -1;
    isMoving = true;
  }
  if (keys["ArrowDown"]) {
    fox.position.z += speed * delta;
    direction.z = 1;
    isMoving = true;
  }
  if (keys["ArrowLeft"]) {
    fox.position.x -= speed * delta;
    direction.x = -1;
    isMoving = true;
  }
  if (keys["ArrowRight"]) {
    fox.position.x += speed * delta;
    direction.x = 1;
    isMoving = true;
  }

  if (isMoving) {
    fox.lookAt(
      fox.position.x + direction.x,
      fox.position.y,
      fox.position.z + direction.z
    );
    if (speed > 3) {
      setAction(actions.run);
    } else {
      setAction(actions.walk);
    }
  } else {
    setAction(actions.idle);
  }

  if (mixer) mixer.update(delta);
};

// Random Objects (Collectibles)
const randomObjects = [];

const placeRandomObjects = (count) => {
  for (let i = 0; i < count; i++) {
    const randomPosition = new THREE.Vector3(
      (Math.random() - 0.5) * 40,
      0.5,
      (Math.random() - 0.5) * 40
    );

    const objectMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 16, 16),
      new THREE.MeshStandardMaterial({ color: "yellow" })
    );
    objectMesh.position.copy(randomPosition);
    objectMesh.castShadow = true;

    randomObjects.push(objectMesh);
    scene.add(objectMesh);
  }
};
placeRandomObjects(10);

// Collect Objects
const collectObjects = () => {
  randomObjects.forEach((object, index) => {
    if (fox && fox.position.distanceTo(object.position) < 1) {
      createParticleEffect(object.position);
      scene.remove(object);
      randomObjects.splice(index, 1);
    }
  });
};

// Particle Effect
const createParticleEffect = (position) => {
  const particleGeometry = new THREE.BufferGeometry();
  const particleCount = 30;
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
    color: "orange",
    size: 0.1,
  });

  const particles = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particles);

  setTimeout(() => {
    scene.remove(particles);
  }, 1000);
};

// Rastgele Ağaçları Eklemek İçin Fonksiyon
const addTrees = (count) => {
  for (let i = 0; i < count; i++) {
    // Gövde
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.2, 2, 8),
      new THREE.MeshStandardMaterial({ color: "#8B4513" }) // Kahverengi
    );

    // Yapraklar
    const foliage = new THREE.Mesh(
      new THREE.ConeGeometry(1, 3, 8),
      new THREE.MeshStandardMaterial({ color: "green" }) // Yeşil
    );

    // Ağaç Pozisyonu
    const x = (Math.random() - 0.5) * 40;
    const z = (Math.random() - 0.5) * 40;
    const y = 1; // Zemin seviyesine oturtmak için

    trunk.position.set(x, y, z);
    foliage.position.set(x, y + 2.5, z); // Gövdenin üstüne yaprakları yerleştirmek için

    // Gölgeleri etkinleştir
    trunk.castShadow = true;
    foliage.castShadow = true;

    // Ağacı sahneye ekle
    scene.add(trunk);
    scene.add(foliage);
  }
};

// 10 adet rastgele ağaç ekleyelim
addTrees(10);

// Animation Loop
const clock = new THREE.Clock();
const tick = () => {
  const delta = clock.getDelta();

  handleMovement(delta);
  collectObjects();
  controls.update();

  if (fox) {
    camera.position.lerp(
      new THREE.Vector3(
        fox.position.x,
        fox.position.y + 5,
        fox.position.z + 10
      ),
      0.1
    );
    camera.lookAt(fox.position);
  }

  renderer.render(scene, camera);
  requestAnimationFrame(tick);
};

tick();

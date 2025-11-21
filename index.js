import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const moveButton = document.querySelector("#move")
const resetButton = document.querySelector("#reset")
let moveSun = false

moveButton.addEventListener("click", () => {
  if (!moveSun) {
    moveButton.textContent = "❌ Stop Sun"
  } else {
    moveButton.textContent = "☀️ Move Sun"

  }
  moveSun = !moveSun
})

resetButton.addEventListener("click", () => {
  moveSun = false
  moveButton.textContent = "☀️ Move Sun"
  sun.position.z = 5
})

const raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2()
const scene = new THREE.Scene();
const windowSizes = {
  width: window.innerWidth,
  height: window.innerHeight
}
const canvas = document.querySelector("#exp-canvas")
const loader = new GLTFLoader();

//const camera = new THREE.PerspectiveCamera(75, windowSizes.width / windowSizes.height, 0.1, 1000);
const aspect = windowSizes.width / windowSizes.height
const camera = new THREE.OrthographicCamera(-aspect * 50, aspect * 50, 50, -50, 1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
const controls = new OrbitControls(camera, canvas);

renderer.setSize(windowSizes.width, windowSizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.shadowMap.enabled = true
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.75

//camera.position()
camera.position.x = 34;
camera.position.y = 20
camera.position.z = -16;
controls.update();
const file = './portifolio.glb'

loader.load(file, function (glb) {
  glb.scene.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true
      child.receiveShadow = true
    }
  })
  scene.add(glb.scene);
}, undefined, function (error) {
  console.error(error);
});

const sun = new THREE.DirectionalLight(0xFFFFFF);
sun.castShadow = true
sun.position.set(75, 25, 5)
sun.target.position.set(50, 0, 0)
sun.shadow.mapSize.width = 4096
sun.shadow.mapSize.height = 4096
sun.shadow.camera.left = -100
sun.shadow.camera.right = 100
sun.shadow.camera.top = 100
sun.shadow.camera.bottom = -100
sun.shadow.normalBias = 0.2
scene.add(sun);

// const shadowHelper = new THREE.CameraHelper(camera)
// scene.add(shadowHelper)

// const helper = new THREE.DirectionalLightHelper(sun, 5);
// scene.add(helper);


function handleResize() {
  windowSizes.width = window.innerWidth
  windowSizes.height = window.innerHeight
  const aspect = windowSizes.width / windowSizes.height
  camera.left = -aspect * 50
  camera.right = aspect * 50
  camera.top = 50
  camera.bottom = -50

  camera.updateProjectionMatrix()
  renderer.setSize(windowSizes.width, windowSizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  controls.update();
  renderer.render(scene, camera);
}

window.addEventListener("resize", handleResize)

function onPointMove(event) {
  pointer.x = (event.clientX / windowSizes.width) * 2 - 1
  pointer.y = -(event.clientX / windowSizes.height) * 2 + 1
}

window.addEventListener("pointermove", onPointMove)

function render() {
  raycaster.setFromCamera(pointer, camera)
  const intersects = raycaster.intersectObjects(scene.children)
  for (let index = 0; index < intersects.length; index++) {
    intersects[index].object.material.color.set(0xff0000)
  }
}

function movingSun() {
  if (sun.position.z < 250) {
    sun.position.z += 0.1
  }
  if (sun.position.z > 249) {
    sun.position.z = 0
  }
}

function animate() {
  renderer.render(scene, camera);
  //render()
  if (moveSun) {
    movingSun()
  }
}
renderer.setAnimationLoop(animate);
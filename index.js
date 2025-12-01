import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Octree } from "three/addons/math/Octree.js";
import { Capsule } from "three/addons/math/Capsule.js";

const file = './scene.glb'
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

// ----------------- Physics -----------------
const gravity = 30
const character_capsule_radius = 0.35
const character_capsule_height = 1
const jump_height = 10
const move_speed = 3


let character = {
  instance: null,
  isMoving: false,
  spawnPosition: new THREE.Vector3()
}

let playerOnFloor = false
let playerVelocity = new THREE.Vector3()
let targetRotation = 0

const colliderOctree = new Octree()
const playerCollider = new Capsule(
  new THREE.Vector3(0, character_capsule_radius, 0),
  new THREE.Vector3(0, character_capsule_height, 0),
  character_capsule_radius
)


const moveUp = document.querySelector("#moveUp")
const moveDown = document.querySelector("#moveDown")
const moveLeft = document.querySelector("#moveLeft")
const moveRight = document.querySelector("#moveRight")

const modalContent = {
  "Flower": {
    title: "Flower",
    content: "You found a flower🌹!",
    view: ""
  },
  "BigTree": {
    title: "Big Tree",
    content: "You found a big tree🌳!",
    view: ""
  },
  "Car": {
    title: "Car",
    content: "You found a red car🚗!",
    view: ""
  },
  "Grass": {
    title: "Grass",
    content: "You found a grass🌿!",
    view: ""
  },
  "Board": {
    title: "Hey there!",
    content: "You found a secret 👽!",
    view: "https://github.com/julianoventola/3D-Scene"
  },
}

const modal = document.querySelector(".modal")
const modalTitle = document.querySelector(".modal-title")
const modalDescription = document.querySelector(".modal-description")
const modalClose = document.querySelector(".modal-exit")
const modalVisit = document.querySelector(".modal-visit")

function hiddeModal() {
  modal.classList.add("hidden")
  modalClose.removeEventListener("click", hiddeModal)
}

function showModal(id) {
  const content = modalContent[id]
  if (content) {
    modal.classList.remove("hidden")
    modalTitle.textContent = content.title
    modalDescription.textContent = content.content
    modalClose.addEventListener("click", hiddeModal)
    if (content.view === "") {
      modalVisit.classList.add("hidden")
    } else {
      modalVisit.classList.remove("hidden")
      modalVisit.setAttribute("href", content.view)
    }
  }
}


const raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2()
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x568420);
const windowSizes = {
  width: window.innerWidth,
  height: window.innerHeight
}
const canvas = document.querySelector("#exp-canvas")
const loader = new GLTFLoader();

let intersectedObject = ""
const intersectObjects = []
const intersectObjectsNames = [
  "Flower",
  "BigTree",
  "Car",
  "Grass",
  "Board",
]


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
renderer.toneMappingExposure = 1.7

//camera.position()
camera.position.x = 34;
camera.position.y = 20
camera.position.z = -16;
controls.update();


function respawnCharacter() {
  character.instance.position.copy(character.spawnPosition)
  playerCollider.start.copy(character.spawnPosition).add(new THREE.Vector3(0, character_capsule_radius, 0))
  playerCollider.end.copy(character.spawnPosition).add(new THREE.Vector3(0, character_capsule_height, 0))
  playerVelocity.set(0, 0, 0)
  character.isMoving = false
}

loader.load(file, function (glb) {
  glb.scene.traverse((child) => {
    if (intersectObjectsNames.includes(child.name)) {
      intersectObjects.push(child)
    }
    if (child.isMesh) {
      child.castShadow = true
      child.receiveShadow = true
      colliderOctree.fromGraphNode(child)
    }

    if (child.name == "Character") {
      character.instance = child
      character.spawnPosition.copy(child.position)
      playerCollider.start.copy(child.position).add(new THREE.Vector3(0, character_capsule_radius, 0))
      playerCollider.end.copy(child.position).add(new THREE.Vector3(0, character_capsule_height, 0))
    }

    if (child.name.includes("Collision")) {
      colliderOctree.fromGraphNode(child)
      child.visible = false
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
  pointer.y = -(event.clientY / windowSizes.height) * 2 + 1
}

function onClick() {
  if (intersectedObject != "Scene") {
    console.log(intersectedObject);

    showModal(intersectedObject.split("0")[0])
  }
}

window.addEventListener("pointermove", onPointMove)
window.addEventListener("click", onClick)

function movingSun() {
  if (sun.position.z < 250) {
    sun.position.z += 0.1
  }
  if (sun.position.z > 249) {
    sun.position.z = 0
  }
}

function playerCollisions() {
  const result = colliderOctree.capsuleIntersect(playerCollider);
  playerOnFloor = false;

  if (result) {
    playerOnFloor = result.normal.y > 0
    playerCollider.translate(result.normal.multiplyScalar(result.depth))

    if (playerOnFloor) {
      character.isMoving = false
      playerVelocity.x = 0
      playerVelocity.z = 0
    }
  }
}

function updatePlayer() {
  if (!character.instance) {
    return
  }

  if (character.instance.position.y < -10) {
    respawnCharacter()
    return
  }

  if (!playerOnFloor) {
    playerVelocity.y -= gravity * 0.035
  }

  playerCollider.translate(playerVelocity.clone().multiplyScalar(0.035))
  playerCollisions()

  character.instance.position.copy(playerCollider.start)
  character.instance.position.y -= character_capsule_radius

  let rotationDiff =
    ((((targetRotation - character.instance.rotation.y) % (2 * Math.PI)) +
      3 * Math.PI) %
      (2 * Math.PI)) -
    Math.PI;
  let finalRotation = character.instance.rotation.y + rotationDiff;

  character.instance.rotation.y = THREE.MathUtils.lerp(
    character.instance.rotation.y,
    finalRotation,
    0.1
  )
}


function onKeyDown(event) {
  if (character.isMoving) {
    return
  }

  switch (event.key.toLowerCase()) {
    case "w":
    case "arrowup":
      playerVelocity.x -= move_speed
      targetRotation = Math.PI
      break;

    case "s":
    case "arrowdown":
      playerVelocity.x += move_speed
      targetRotation = 0
      break;

    case "a":
    case "arrowleft":
      playerVelocity.z += move_speed
      targetRotation = -Math.PI / 2
      break;

    case "d":
    case "arrowright":
      playerVelocity.z -= move_speed
      targetRotation = Math.PI / 2
      break;
    default:
      break;
  }
  //moveCharacter(playerVelocity, targetRotation)
  playerVelocity.y = jump_height
  character.isMoving = true
}

window.addEventListener("keydown", onKeyDown)
moveUp.addEventListener("click", () => {
  onKeyDown({ key: "w" })
})
moveDown.addEventListener("click", () => {
  onKeyDown({ key: "s" })
})
moveLeft.addEventListener("click", () => {
  onKeyDown({ key: "a" })
})
moveRight.addEventListener("click", () => {
  onKeyDown({ key: "d" })
})


function animate() {
  updatePlayer()
  renderer.render(scene, camera);

  raycaster.setFromCamera(pointer, camera)
  const intersects = raycaster.intersectObjects(scene.children)

  if (intersects.length > 1) {
    document.body.style.cursor = "pointer"
  } else {
    document.body.style.cursor = "default"
    intersectedObject = ""
  }
  for (let index = 0; index < intersects.length; index++) {
    intersectedObject = intersects[0].object.parent.name
  }

  if (moveSun) {
    movingSun()
  }
}
renderer.setAnimationLoop(animate);
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

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

let character = {
  instance: null,
  moveDistance: 3,
  jumpHeight: 1,
  isMoving: false,
  movingDuration: 0.2
}

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

loader.load(file, function (glb) {
  glb.scene.traverse((child) => {
    if (intersectObjectsNames.includes(child.name)) {
      intersectObjects.push(child)
    }
    if (child.isMesh) {
      child.castShadow = true
      child.receiveShadow = true
    }

    if (child.name == "Character") {
      character.instance = child
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

function moveCharacter(targetPositon, targetRotation) {
  character.isMoving = true

  const t1 = gsap.timeline({
    onComplete: () => {
      character.isMoving = false
    }
  })

  t1.to(character.instance.position, {
    x: targetPositon.x,
    z: targetPositon.z,
    duration: character.movingDuration
  })

  t1.to(character.instance.rotation,
    {
      y: targetRotation,
      duration: character.movingDuration
    },
    0)

  t1.to(character.instance.position, {
    y: character.instance.position.y + character.jumpHeight,
    duration: character.movingDuration / 2,
    yoyo: true,
    repeat: 1
  }, 0)
}


function onKeyDown(event) {
  if (character.isMoving) {
    return
  }

  const targetPostion = new THREE.Vector3().copy(character.instance.position)
  let targetRotation = 0

  switch (event.key.toLowerCase()) {
    case "w":
    case "arrowup":
      targetPostion.x -= character.moveDistance
      targetRotation = Math.PI
      break;

    case "s":
    case "arrowdown":
      targetPostion.x += character.moveDistance
      targetRotation = 0
      break;

    case "a":
    case "arrowleft":
      targetPostion.z += character.moveDistance
      targetRotation = -Math.PI / 2
      break;

    case "d":
    case "arrowright":
      targetPostion.z -= character.moveDistance
      targetRotation = Math.PI / 2
      break;
    default:
      break;
  }
  moveCharacter(targetPostion, targetRotation)

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
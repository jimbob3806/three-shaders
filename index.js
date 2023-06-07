import * as THREE from "three"

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

import { ASCIIPass } from "./ASCIIPass"
import { ASCIIBloomPass } from "./ASCIIBloomPass"

const scene = new THREE.Scene();
const clock = new THREE.Clock();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 5000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const geometry = new THREE.BoxGeometry(100, 100, 100)
const material = new THREE.MeshNormalMaterial()
const cube = new THREE.Mesh( geometry, material );
cube.position.x = 175

// scene.add( cube );


let mixer

let loader = new GLTFLoader()
loader.load( "https://www.stivaliserna.com/assets/rocket/rocket.gltf",
    (gltf) => {
        const rocket = gltf.scene;
        rocket.name = "rocket"
        rocket.position.x = 0;
        rocket.position.y = 0;
        rocket.position.z = 0;
        // scene.add(rocket);
    }
)
loader.load( "./chess11.gltf",
    (gltf) => {
        const rocket = gltf.scene;
        rocket.name = "rocket"
        rocket.position.x = 0;
        rocket.position.y = 0;
        rocket.position.z = 0;
        // scene.add(rocket);
    }
)
loader.load( "./lemmingLP.gltf",
    (gltf) => {

        gltf.scene.position.x = 0
        gltf.scene.position.y = 0
        gltf.scene.position.z = 0

        scene.add(gltf.scene)

        mixer = new THREE.AnimationMixer(gltf.scene)
        const action = mixer.clipAction(gltf.animations[2])
        action.play()
    }
)

camera.position.set(10, 10, 10)

const controls = new OrbitControls( camera, renderer.domElement )

const light1 = new THREE.PointLight(0x404040, 10)
light1.position.set(50, 50, 50)
scene.add(light1)

const light2 = new THREE.PointLight(0x404040, 2)
light2.position.set(50, 50, -50)
scene.add(light2)

const light3 = new THREE.PointLight(0x404040, 2)
light3.position.set(-50, 50, 50)
scene.add(light3)

const light4 = new THREE.PointLight(0x404040, 2)
light4.position.set(-50, 50, -50)
scene.add(light4)


const composer = new EffectComposer(renderer)

const renderPass = new RenderPass( scene, camera );
composer.addPass( renderPass );

const asciiPass = new ASCIIPass()
composer.addPass(asciiPass)

// const asciiBloomPass = new ASCIIBloomPass()
// composer.addPass(asciiBloomPass)

const animate = function () {
    requestAnimationFrame( animate );

    cube.rotation.x += 0.01;
    cube.rotation.y += 0.02;

    controls.update()
    if (mixer) mixer.update(clock.getDelta())

    composer.render()
}

animate()

// TODO:

// dither options
// sample size options
// char options
// different sized chars
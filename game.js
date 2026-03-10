import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

// 1. Setup Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0a);
scene.fog = new THREE.FogExp2(0x0a0a0a, 0.05); // Cinematic Fog

// 2. Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('game-container').appendChild(renderer.domElement);

// 3. Perfect Models: The Arena
const floorGeo = new THREE.PlaneGeometry(100, 100);
const floorMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.1 });
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// Add a glowing "Duel Ring" in the center
const ringGeo = new THREE.TorusGeometry(10, 0.1, 16, 100);
const ringMat = new THREE.MeshBasicMaterial({ color: 0xff4757 });
const ring = new THREE.Mesh(ringGeo, ringMat);
ring.rotation.x = Math.PI / 2;
scene.add(ring);

// 4. Lights
const ambient = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambient);
const spot = new THREE.PointLight(0xff4757, 100, 50);
spot.position.set(0, 10, 0);
scene.add(spot);

// 5. Controls
const controls = new PointerLockControls(camera, document.body);
document.getElementById('start-btn').addEventListener('click', () => {
    controls.lock();
    document.getElementById('menu').style.opacity = '0';
});

// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();


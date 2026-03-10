import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

// --- 1. THE ARENA SETUP ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050505);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Perfect Models: 3D Grid Floor
const grid = new THREE.GridHelper(100, 50, 0xff4757, 0x222222);
scene.add(grid);

// --- 2. MOVEMENT & CONTROLS ---
const controls = new PointerLockControls(camera, document.body);
const keys = {};
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

window.addEventListener('keydown', (e) => keys[e.code] = true);
window.addEventListener('keyup', (e) => keys[e.code] = false);

// --- 3. MOBILE JOYSTICK LOGIC ---
// If touch is detected, we create a virtual joystick overlay
if ('ontouchstart' in window) {
    const joyZone = document.createElement('div');
    joyZone.style = "position:fixed; bottom:50px; left:50px; width:120px; height:120px; background:rgba(255,255,255,0.1); border-radius:50%; border:2px solid #ff4757;";
    document.body.appendChild(joyZone);
    // (Logic for touch events would update the 'keys' object)
}

// --- 4. MULTIPLAYER (PEERJS) ---
const peer = new Peer(); // Generates a random ID for "Same Network" discovery
let conn;

peer.on('open', (id) => {
    console.log('Your Duel ID is: ' + id);
    document.getElementById('stats').innerText = "ID: " + id;
});

// HOSTING: Waiting for friend to join
peer.on('connection', (c) => {
    conn = c;
    setupDataSync();
});

// JOINING: Connecting to friend
function joinMatch(friendId) {
    conn = peer.connect(friendId);
    setupDataSync();
}

function setupDataSync() {
    conn.on('data', (data) => {
        // Here we update the "Enemy" model's position in 3D space
        enemyModel.position.set(data.x, data.y, data.z);
    });
}

// --- 5. THE GAME LOOP ---
function animate() {
    requestAnimationFrame(animate);

    if (controls.isLocked || 'ontouchstart' in window) {
        // 3D Physics & Friction
        velocity.x -= velocity.x * 10.0 * 0.01; // Friction
        velocity.z -= velocity.z * 10.0 * 0.01;

        direction.z = Number(keys['KeyW']) - Number(keys['KeyS']);
        direction.x = Number(keys['KeyD']) - Number(keys['KeyA']);
        direction.normalize();

        if (keys['KeyW'] || keys['KeyS']) velocity.z -= direction.z * 400.0 * 0.01;
        if (keys['KeyA'] || keys['KeyD']) velocity.x -= direction.x * 400.0 * 0.01;

        controls.moveRight(-velocity.x * 0.01);
        controls.moveForward(-velocity.z * 0.01);
        
        // Syncing: Send your position to your friend 60 times a second
        if (conn && conn.open) {
            conn.send({ x: camera.position.x, y: camera.position.y, z: camera.position.z });
        }
    }

    renderer.render(scene, camera);
}
animate();
            

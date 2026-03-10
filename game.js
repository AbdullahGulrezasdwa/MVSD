import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

// --- 1. CORE SCENE SETUP ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050505);
scene.fog = new THREE.FogExp2(0x050505, 0.1);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Perfect Models: Grid Arena
const grid = new THREE.GridHelper(100, 40, 0xff4757, 0x222222);
scene.add(grid);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

// --- 2. PLAYER & WEAPON ---
const gunGroup = new THREE.Group();
const barrel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.03, 0.4),
    new THREE.MeshStandardMaterial({ color: 0x222222 })
);
barrel.rotation.x = Math.PI / 2;
gunGroup.add(barrel);
camera.add(gunGroup);
gunGroup.position.set(0.2, -0.2, -0.4);
scene.add(camera);

// Enemy Model (The Capsule)
const enemyModel = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.4, 1, 4, 16),
    new THREE.MeshStandardMaterial({ color: 0xff4757, emissive: 0xff0000 })
);
enemyModel.position.set(0, 1, -10);
scene.add(enemyModel);

// --- 3. PHYSICS & MOVEMENT ---
const controls = new PointerLockControls(camera, document.body);
const velocity = new THREE.Vector3();
const keys = {};

window.addEventListener('keydown', (e) => keys[e.code] = true);
window.addEventListener('keyup', (e) => keys[e.code] = false);

document.getElementById('start-btn').onclick = () => {
    controls.lock();
    document.getElementById('menu').style.display = 'none';
};

// --- 4. COMBAT (RAYCASTING) ---
const raycaster = new THREE.Raycaster();
const shoot = () => {
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    const hits = raycaster.intersectObject(enemyModel);
    if (hits.length > 0) {
        if (conn) conn.send({ type: 'HIT' });
        console.log("TAGGED!");
    }
};

window.addEventListener('mousedown', () => { if(controls.isLocked) shoot(); });

// --- 5. MULTIPLAYER (PEERJS) ---
const peer = new Peer();
let conn;

peer.on('open', (id) => {
    document.getElementById('my-id').innerText = "YOUR ID: " + id;
    document.getElementById('stats').innerText = "STATUS: ONLINE (IDLE)";
});

peer.on('connection', (c) => {
    conn = c;
    document.getElementById('menu').style.display = 'none';
    handleData();
});

document.getElementById('join-btn').onclick = () => {
    const id = document.getElementById('join-id').value;
    conn = peer.connect(id);
    document.getElementById('menu').style.display = 'none';
    handleData();
};

function handleData() {
    conn.on('data', (data) => {
        if (data.type === 'HIT') {
            camera.position.set(Math.random()*10, 1.6, Math.random()*10); // Respawn
        } else {
            enemyModel.position.set(data.x, data.y - 1, data.z);
        }
    });
}

// Mobile Setup
if ('ontouchstart' in window) {
    const fire = document.getElementById('mobile-fire');
    fire.style.display = 'block';
    fire.onclick = shoot;
}

// --- 6. GAME LOOP ---
function animate() {
    requestAnimationFrame(animate);

    if (controls.isLocked || 'ontouchstart' in window) {
        // Kinetic Friction calculation
        velocity.x -= velocity.x * 10.0 * 0.01;
        velocity.z -= velocity.z * 10.0 * 0.01;

        if (keys['KeyW']) velocity.z -= 4.0 * 0.01;
        if (keys['KeyS']) velocity.z += 4.0 * 0.01;
        if (keys['KeyA']) velocity.x -= 4.0 * 0.01;
        if (keys['KeyD']) velocity.x += 4.0 * 0.01;

        controls.moveRight(-velocity.x);
        controls.moveForward(-velocity.z);

        // Network Sync
        if (conn && conn.open) {
            conn.send({ x: camera.position.x, y: camera.position.y, z: camera.position.z });
        }
    }
    renderer.render(scene, camera);
}
animate();
    

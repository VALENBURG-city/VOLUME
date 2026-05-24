import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111); 


const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(2, 2, 5);
camera.lookAt(0, 0, 0);


const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true; 


document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('scene-container');
    if (container) {
        container.appendChild(renderer.domElement);
    } else {
        console.warn('Контейнер #scene-container не найден, добавляем в body');
        document.body.appendChild(renderer.domElement);
    }
});


const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; 
controls.autoRotate = false;
controls.enableZoom = true;
controls.zoomSpeed = 1.2;
controls.rotateSpeed = 1.0;



const ambientLight = new THREE.AmbientLight(0x404060);
scene.add(ambientLight);


const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(2, 3, 2);
directionalLight.castShadow = true;
directionalLight.receiveShadow = true;
scene.add(directionalLight);


const backLight = new THREE.DirectionalLight(0xffffff, 0.5);
backLight.position.set(-2, 1, -2);
scene.add(backLight);


const fillLight = new THREE.PointLight(0x4466cc, 0.3);
fillLight.position.set(0, -1, 0);
scene.add(fillLight);



const gridHelper = new THREE.GridHelper(10, 20, 0x888888, 0x444444);
gridHelper.position.y = -0.5;
scene.add(gridHelper);


const loader = new GLTFLoader();
let loadedModel = null;

loader.load('CASETTE.glb',
    (gltf) => {
        loadedModel = gltf.scene;
        scene.add(loadedModel);
        
        
        const box = new THREE.Box3().setFromObject(loadedModel);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        
        const maxDim = Math.max(size.x, size.y, size.z);
        const distance = maxDim * 1.5;
        camera.position.set(distance * 0.8, distance * 0.6, distance);
        controls.target.copy(center);
        controls.update();
        
        console.log('Модель успешно загружена!');
        console.log(`Размер модели: ${size.x.toFixed(2)} x ${size.y.toFixed(2)} x ${size.z.toFixed(2)}`);
    },
    (xhr) => {
        const percent = (xhr.loaded / xhr.total) * 100;
        console.log(`📥 Загружено: ${percent.toFixed(2)}%`);
    },
    (error) => {
        console.error('Ошибка при загрузке модели:', error);
        console.warn('Убедитесь, что файл "CASETTE.glb" находится в правильной папке и доступен по пути');
        
        
        showErrorMessage('Не удалось загрузить модель CASETTE.glb');
    }
);


function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.position = 'absolute';
    errorDiv.style.top = '20px';
    errorDiv.style.left = '20px';
    errorDiv.style.background = 'rgba(255,0,0,0.8)';
    errorDiv.style.color = 'white';
    errorDiv.style.padding = '10px 20px';
    errorDiv.style.borderRadius = '8px';
    errorDiv.style.fontFamily = 'monospace';
    errorDiv.style.zIndex = '1000';
    errorDiv.textContent = ` ${message}`;
    
    const container = document.getElementById('scene-container') || document.body;
    container.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.style.opacity = '0';
        setTimeout(() => errorDiv.remove(), 2000);
    }, 5000);
}


let lastTime = 0;

function animate() {
    requestAnimationFrame(animate);
    controls.update(); 
    
    
    
    
    
    
    renderer.render(scene, camera);
}
animate();


window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

console.log('3D сцена инициализирована, ожидаем загрузку модели...');
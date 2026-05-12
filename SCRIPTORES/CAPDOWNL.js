import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// --- Инициализация ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xFFFFFF); // Тёмно-серый фон

// Камера (угол обзора, соотношение сторон, ближняя и дальняя плоскость)
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(2, 2, 5);
camera.lookAt(0, 0, 0);

// Рендерер (то, что рисует картинку)
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.getElementById('scene-container').appendChild(renderer.domElement);

// --- Управление ---
// const controls = new OrbitControls(camera, renderer.domElement);
// controls.enableDamping = true; // Плавный "инерционный" поворот

// --- Освещение (чтобы модель не была чёрной) ---
// AmbientLight — общий, фоновый свет
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

// DirectionalLight — яркий свет, как от солнца
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 2, 1);
scene.add(directionalLight);

// Добавим свет сзади, чтобы подсветить контуры
const backLight = new THREE.DirectionalLight(0xffffff, 0.5);
backLight.position.set(-1, 1, -1);
scene.add(backLight);

// --- Загрузка модели (ЗАМЕНИТЕ НА ВАШ ФАЙЛ) ---
const loader = new GLTFLoader();
loader.load('/MEDIA/MODELS3D/CASETTE.glb', // <-- Укажите путь к вашему .glb файлу
    (gltf) => {
        const model = gltf.scene;
        scene.add(model);
        console.log('Модель успешно загружена!');
    },
);

// --- Анимация (pet-проект) ---
function animate() {
    requestAnimationFrame(animate);
    controls.update(); // Обновляем камеру
    renderer.render(scene, camera); // Рисуем кадр
}
animate();

// Умная подстройка размера при изменении окна браузера
window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
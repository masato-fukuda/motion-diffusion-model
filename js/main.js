import * as THREE from 'three';
// マウスで視点を操作するためのOrbitControlsをインポート
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// OBJファイルを読み込むためのOBJLoaderをインポート
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

// --- 基本設定 -------------------------------------------
// シーン
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xdddddd); // 背景色

// カメラ
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 15); // カメラの位置を調整

// レンダラー
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// ライト
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // 環境光
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // 平行光
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

// マウス操作（OrbitControls）
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // 滑らかな操作感

// --- OBJシーケンスの設定 --------------------------------
const loader = new OBJLoader();
const totalFrames = 100; // あなたのOBJファイルの総数に合わせて変更
const filePrefix = './obj/frame_'; // ファイルの接頭辞
const fileSuffix = '.obj'; // ファイルの拡張子

let currentFrame = 0;
let currentModel = null;

function loadModel(frame) {
    // 3桁のゼロ埋め（例: 1 -> "001"）
    const frameNumber = frame.toString().padStart(3, '0');
    const filePath = `${filePrefix}${frameNumber}${fileSuffix}`;

    loader.load(filePath, (obj) => {
        // もし既にモデルが表示されていれば削除
        if (currentModel) {
            scene.remove(currentModel);
        }
        
        // 新しいモデルをシーンに追加
        currentModel = obj;
        scene.add(currentModel);
    }, undefined, (error) => {
        console.error(`Error loading model ${filePath}`, error);
    });
}

// --- アニメーションループ ---------------------------------
function animate() {
    requestAnimationFrame(animate);

    // フレームを更新（6フレームごとにモデルを切り替える例）
    if (renderer.info.render.frame % 6 === 0) {
        loadModel(currentFrame);
        currentFrame = (currentFrame + 1) % totalFrames; // 次のフレームへ
    }
    
    controls.update(); // マウス操作を更新
    renderer.render(scene, camera); // レンダリング
}

// 最初のモデルを読み込んでアニメーションを開始
loadModel(0);
animate();

// ウィンドウサイズが変更された時にリサイズ
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
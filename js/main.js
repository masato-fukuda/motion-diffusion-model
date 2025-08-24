import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

// --- 基本設定 (変更なし) --------------------------------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xdddddd);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 15);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// --- 🎬 アニメーション制御用の設定 -----------------------
const loader = new OBJLoader();
let animationState = {
    isPlaying: false,
    currentSet: null, // "01", "02" などを保持
    currentFrame: 0,
    totalFrames: 100, // ★各セットの総フレーム数（必要ならセットごとに変更）
    filePrefix: './obj/',
    fileSuffix: '.obj'
};
let currentModel = null;

// --- 📂 モデル読み込み関数 -----------------------------
function loadModel(frame) {
    if (!animationState.isPlaying || !animationState.currentSet) return;

    // 3桁のゼロ埋め
    const frameNumber = frame.toString().padStart(3, '0');
    // フォルダパスを動的に生成
    const filePath = `${animationState.filePrefix}${animationState.currentSet}/frame_${frameNumber}${animationState.fileSuffix}`;

    loader.load(filePath, (obj) => {
        if (currentModel) {
            scene.remove(currentModel);
        }
        currentModel = obj;
        scene.add(currentModel);
    }, undefined, (error) => {
        console.error(`モデルの読み込みエラー: ${filePath}`, error);
        // エラーが起きたら再生を停止
        animationState.isPlaying = false;
    });
}

// --- 🔄 アニメーションループ関数 --------------------------
function animate() {
    requestAnimationFrame(animate);

    // 再生中の場合のみフレームを更新
    if (animationState.isPlaying) {
        // 6フレームごとにモデルを切り替える（速度調整）
        if (renderer.info.render.frame % 6 === 0) {
            loadModel(animationState.currentFrame);
            // フレームを次に進め、最後に達したら0に戻す（ループ処理）
            animationState.currentFrame = (animationState.currentFrame + 1) % animationState.totalFrames;
        }
    }
    
    controls.update();
    renderer.render(scene, camera);
}

// --- ▶️ 再生を開始する関数 -------------------------------
function startPlayback(setNumber) {
    // 既に同じセットを再生中の場合は何もしない
    if (animationState.currentSet === setNumber && animationState.isPlaying) {
        return;
    }

    console.log(`Set ${setNumber} の再生を開始します`);
    animationState.currentSet = setNumber;
    animationState.currentFrame = 0; // フレームをリセット
    animationState.isPlaying = true;

    // 最初のモデルを即座に読み込む
    loadModel(animationState.currentFrame);
}

// --- 🔘 ボタンのイベントリスナーを設定 --------------------
document.getElementById('play01').addEventListener('click', () => {
    startPlayback('01');
});

document.getElementById('play02').addEventListener('click', () => {
    startPlayback('02');
});

// --- ウィンドウリサイズ処理 (変更なし) ----------------------
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- 🚀 初期化 -----------------------------------------
animate(); // アニメーションループを開始（最初は何も再生されない）

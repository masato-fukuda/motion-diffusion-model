import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

// --- 基本設定 (変更なし) ---
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

// --- HTML要素の取得 ---
const infoDisplay = document.getElementById('info-display'); // ★追加

// --- アニメーション制御用の設定 ---
const loader = new OBJLoader();
let animationState = {
    isPlaying: false,
    currentSet: null,
    currentFrame: 0,
    totalFrames: 200, // ★各自の環境に合わせて変更してください
    filePrefix: './obj/',
    fileSuffix: '.obj'
};
let currentModel = null;


// --- 📂 モデル読み込み関数 (変更なし) ---
function loadModel(frame) {
    if (!animationState.isPlaying || !animationState.currentSet) return;
    const frameNumber = frame.toString().padStart(3, '0');
    const filePath = `${animationState.filePrefix}${animationState.currentSet}/frame${frameNumber}${animationState.fileSuffix}`;
    loader.load(filePath, (obj) => {
        if (currentModel) scene.remove(currentModel);
        currentModel = obj;
        const boundingBox = new THREE.Box3().setFromObject(currentModel);
        const size = new THREE.Vector3();
        boundingBox.getSize(size);
        const maxDimension = Math.max(size.x, size.y, size.z);
        const desiredSize = 10.0;
        const scaleFactor = desiredSize / maxDimension;
        currentModel.scale.set(scaleFactor, scaleFactor, scaleFactor);
        const center = new THREE.Vector3();
        boundingBox.getCenter(center);
        currentModel.position.sub(center.multiplyScalar(scaleFactor));
        scene.add(currentModel);
    }, undefined, (error) => {
        console.error(`モデルの読み込みエラー: ${filePath}`, error);
        animationState.isPlaying = false;
    });
}

// ▼▼▼ テキスト読み込み用の関数を新設 ▼▼▼
/**
 * meta.txtファイルを読み込んで画面に表示する関数
 * @param {string} setNumber - フォルダ番号 ('01', '02'など)
 */
function loadAndDisplayText(setNumber) {
    const filePath = `${animationState.filePrefix}${setNumber}/meta.txt`;
    
    // fetch APIを使ってテキストファイルを取得
    fetch(filePath)
        .then(response => {
            // response.okがtrueでなければエラーを投げる
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text(); // レスポンスをテキストとして解釈
        })
        .then(text => {
            // 取得したテキストを表示エリアに設定
            infoDisplay.innerText = text;
        })
        .catch(error => {
            // エラーが発生した場合
            console.error('meta.txtの読み込みに失敗しました:', error);
            infoDisplay.innerText = `meta.txt' の読み込みに失敗しました。`;
        });
}
// ▲▲▲ ここまで ▲▲▲


// --- 🔄 アニメーションループ関数 (変更なし) ---
function animate() {
    requestAnimationFrame(animate);
    if (animationState.isPlaying) {
        if (renderer.info.render.frame % 6 === 0) {
            loadModel(animationState.currentFrame);
            animationState.currentFrame = (animationState.currentFrame + 1) % animationState.totalFrames;
        }
    }
    controls.update();
    renderer.render(scene, camera);
}

// --- ▶️ 再生を開始する関数 (★変更あり) ---
function startPlayback(setNumber) {
    if (animationState.currentSet === setNumber && animationState.isPlaying) return;

    console.log(`Set ${setNumber} の再生を開始します`);
    animationState.currentSet = setNumber;
    animationState.currentFrame = 0;
    animationState.isPlaying = true;
    
    loadModel(animationState.currentFrame); // 3Dモデルの再生を開始
    loadAndDisplayText(setNumber); // ★meta.txtの読み込みを開始
}

// --- 🔘 ボタンのイベントリスナー (変更なし) ---
document.getElementById('play01').addEventListener('click', () => startPlayback('01'));
document.getElementById('play02').addEventListener('click', () => startPlayback('02'));

// --- ウィンドウリサイズ処理 (変更なし) ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- 🚀 初期化 (変更なし) ---
animate();


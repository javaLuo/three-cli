$(function() {
  FastClick.attach(document.body);
  init3boss();
  initHelper();
  initOrbitControl();
  window.addEventListener('resize', resize, false);
  animate();
});
const container = document.getElementById('canvas-box'); // 容器
let scene; // 场景
let camera; // 相机
let renderer; // 渲染器
let stats; // 帧率辅助器

/** 初始化三要素 **/
function init3boss() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1500);
  renderer = new THREE.WebGLRenderer();

  camera.position.set(0, 0, -50);
  renderer.setSize(window.innerWidth, window.innerHeight, true);
  container.appendChild(renderer.domElement);
}

/** 窗体大小改变时重置分辨率等参数 **/
function resize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

/** 辅助对象 **/
function initHelper() {
  stats = new Stats();
  container.appendChild(stats.dom);
  scene.add(new THREE.AxesHelper(5)); // 三位坐标轴
  scene.add(new THREE.CameraHelper(camera)); // 相机视锥体
}

/** 初始化镜头控制器 **/
function initOrbitControl() {
  cameraControls = new THREE.OrbitControls(camera, container);
  cameraControls.target.set(0, 0, 0);
  cameraControls.maxDistance = 200;
  cameraControls.minDistance = 10;
  cameraControls.update();
}

/** 动画循环 **/
function animate() {
  requestAnimationFrame(animate);
  render();
  stats.update();
}

/** 渲染内容 **/
function render() {
  renderer.render(scene, camera);
}

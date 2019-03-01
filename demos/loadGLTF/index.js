$(function() {
  FastClick.attach(document.body);
  init3boss();
  initHelper();
  initOrbitControl();
  loadGLTF();
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
  renderer.gammaOutput = true; // 所有纹理和颜色需要乘以gamma输出，颜色会亮丽许多
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
  // scene.add(new THREE.CameraHelper(camera)); // 相机视锥体
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
const clock = new THREE.Clock();
function render() {
  if (animateMixer) {
    animateMixer.update(clock.getDelta());
  }
  renderer.render(scene, camera);
}

/** ==== 加载GLTF模型 ==== **/
function loadGLTF() {
  const loader = new THREE.GLTFLoader();
  loader.load('./model/scene.gltf', function(gltf) {
    console.log('加载完毕：', gltf);
    scene.add(gltf.scene);
    initAnimations(gltf); // 处理动画
  });
}

/** 处理所有动画 **/
let animations; // 模型拥有的所有动画
let animateMixer; // 动画混合器
let animateNo = 0; // 当前播放的哪一个动画
let action; // 当前操作的动作对象
function initAnimations(gltf) {
  animations = gltf.animations;
  console.log('数组？', animations.length);
  animateMixer = new THREE.AnimationMixer(gltf.scene);
  // 监听动画播放结束，开始下一个动画，循环模式是LoopOnce时才会触发
  animateMixer.addEventListener('finished', function(e) {
    console.log('结束？', animateNo);
    animateNo = animateNo >= animations.length - 1 ? 0 : animateNo + 1;
    playAnimations(animations[animateNo]);
  });
  // 每一个循环结束，触发一次，循环模式不是LoopOnce时有效
  animateMixer.addEventListener('loop', function(e) {
    console.log('loop结束：', e);
    action.stop();
    animateNo = animateNo >= animations.length - 1 ? 0 : animateNo + 1;
    playAnimations(animations[animateNo]);
  });
  playAnimations(animations[animateNo]);
}

/** 执行特定动画 **/
function playAnimations(clip) {
  action = animateMixer.clipAction(clip);
  action.clampWhenFinished = true; // 动作完成时是否保持最后一帧动作
  // action.loop = THREE.LoopOnce; // 循环的次数
  // action.reset();
  action.play();
}

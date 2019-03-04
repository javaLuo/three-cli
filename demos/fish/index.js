$(function() {
  FastClick.attach(document.body);
  init3boss();
  initHelper();
  initOrbitControl();
  initWorld();
  initGround();
  initPins();
  test();
  initCircle();
  window.addEventListener('resize', resize, false);
  animate();
});
const container = document.getElementById('canvas-box'); // 容器
let world; // 物理世界对象
let scene; // 场景
let camera; // 相机
let renderer; // 渲染器
let stats; // 帧率辅助器

let BodyGround = []; // 地面对象
let BodyPin = []; // 针头对象

/** 初始化三要素 **/
function init3boss() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(53, window.innerWidth / window.innerHeight, 0.1, 1000);
  renderer = new THREE.WebGLRenderer();

  camera.position.set(0, 0, 50);
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  camera.fov = Math.atan(1) * 2 * (180 / Math.PI);
  camera.updateProjectionMatrix();

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
  //cameraControls.maxDistance = 200;
  //cameraControls.minDistance = 10;
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
  if (world == null) return;

  world.step(); // 更新world
  sphere.position.copy(sphere_body.getPosition());
  sphere.quaternion.copy(sphere_body.getQuaternion());
  for(let i=body_cic.length-1;i;i--){
    cic[i].position.copy(body_cic[i].getPosition());
    cic[i].quaternion.copy(body_cic[i].getQuaternion());
  }
  renderer.render(scene, camera);
}

/** 创建world **/
function initWorld() {
  world = new OIMO.World({
    timestep: 1 / 60, // 刷新频率
    iterations: 8, // 迭代次数
    broadphase: 2, // 物理类型？1蛮力计算，2扫描和修剪，3卷积树
    info: false, // 是否输出统计信息
    worldscale: 1, // 世界缩放比例
    random: true, // 随机因子
    gravity: [0, -9.8, 0], // 重力加速度矢量
  });
}

/** 创建ground **/
function initGround() {
  const material = new THREE.MeshBasicMaterial({ color: 0x002200, transparent: true, opacity: 0.1 });
  const material1 = new THREE.MeshBasicMaterial({ color: 0x002200, transparent: true, opacity: 0.8 });
  const material2 = new THREE.MeshBasicMaterial({ color: 0x000022, transparent: true, opacity: 0.2 });
  const material3 = new THREE.MeshBasicMaterial({ color: 0x220000, transparent: true, opacity: 0.2 });
  const geometry = new THREE.BoxBufferGeometry((window.innerWidth / window.innerHeight) * 100, 100, 1);

  const cube = new THREE.Mesh(geometry, material);
  cube.position.set(0, 0, 0.1);

  const cube_back = new THREE.Mesh(geometry, material1);
  cube_back.position.set(0, 0, -10);

  const cube_left = new THREE.Mesh(geometry, material2);
  cube_left.rotation.set(0, Math.PI / 2, 0);
  cube_left.position.set(-(window.innerWidth / window.innerHeight) * 50, 0, 0);

  const cube_right = cube_left.clone();
  cube_right.position.set((window.innerWidth / window.innerHeight) * 50, 0, 0);

  const cube_top = new THREE.Mesh(geometry, material3);
  cube_top.rotation.set(Math.PI / 2, 0, 0);
  cube_top.position.set(0, 50, 0);

  const cube_bottom = cube_top.clone();
  cube_bottom.position.set(0, -50, 0);
  scene.add(cube);
  scene.add(cube_back);
  scene.add(cube_left);
  scene.add(cube_right);
  scene.add(cube_top);
  scene.add(cube_bottom);

  world.add({ size: [(window.innerWidth / window.innerHeight) * 100, 100, 1], pos: [0, 0, 0.1], world }); // 正面
  world.add({ size: [(window.innerWidth / window.innerHeight) * 100, 100, 1], pos: [0, 0, -10], world }); // 背面
  world.add({ size: [(window.innerWidth / window.innerHeight) * 100, 100, 1], pos: [-(window.innerWidth / window.innerHeight) * 50, 0, 0], rot: [0, 90, 0], world }); // 左边
  world.add({ size: [(window.innerWidth / window.innerHeight) * 100, 100, 1], pos: [(window.innerWidth / window.innerHeight) * 50, 0, 0], rot: [0, 90, 0], world }); // 右边
  world.add({ size: [(window.innerWidth / window.innerHeight) * 100, 100, 1], pos: [0, 50, 0], rot: [90, 0, 0], world }); // 上边
  world.add({ size: [(window.innerWidth / window.innerHeight) * 100, 100, 1], pos: [0, -50, 0], rot: [90, 0, 0], world }); // 下边
}

/** 测试小球 **/
let sphere;
let sphere_body;
function test() {
  var geometry = new THREE.SphereGeometry(2, 12, 12);
  var material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  sphere = new THREE.Mesh(geometry, material);
  scene.add(sphere);

  sphere_body = world.add({
    type: 'sphere', // type of shape : sphere, box, cylinder
    size: [2], // size of shape
    pos: [0, 40, -7], // start position in degree
    rot: [0, 0, 0], // start rotation in degree
    move: true, // dynamic or statique
    density: 1,
    friction: 0.2,
    restitution: 0.2,
    belongsTo: 1, // The bits of the collision groups to which the shape belongs.
    collidesWith: 0xffffffff, // The bits of the collision groups with which the shape collides.
  });

  sphere.position.copy(sphere_body.getPosition());
  sphere.quaternion.copy(sphere_body.getQuaternion());
}

/** 初始化所有的pin **/
function initPins() {
  const size = [2, 2, 5, 2, 6, 6, 1, 20, 1];
  const pos = [
    ((-window.innerWidth / window.innerHeight) * 100) / 2 / 2, -20, -7.5,
    ((-window.innerWidth / window.innerHeight) * 100) / 2 / 2, -20, -4,
    ((-window.innerWidth / window.innerHeight) * 100) / 2 / 2, -10, -4
  ];

  const box = new THREE.BoxGeometry(size[0], size[1], size[2]);
  const box2 = new THREE.SphereBufferGeometry(size[3], size[4], size[5]);
  const box3 = new THREE.ConeBufferGeometry(0.5, 20, 12, 24);

  const m = new THREE.MeshBasicMaterial({ color: 0xaaaaaa });

  const c = new THREE.Mesh(box, m);
  const c2 = new THREE.Mesh(box2, m);
  const c3 = new THREE.Mesh(box3, m);

  scene.add(c);
  scene.add(c2);
  scene.add(c3);

  const body1 = world.add({
    type: 'box',
    size: [size[0], size[1], size[2]],
    pos: [pos[0], pos[1], pos[2]],
    world: world,
  });
  const body2 = world.add({
    type: 'box',
    size: [size[3]],
    pos: [pos[3], pos[4], pos[5]],
    world: world,
  });
  const body3 = world.add({
    type: 'box',
    size: [size[6], size[7], size[8]],
    pos: [pos[6], pos[7], pos[8]],
    world: world,
  });
  c.position.copy(body1.getPosition());
  c2.position.copy(body2.getPosition());
  c3.position.copy(body3.getPosition());

  const rc = c.clone();
  const rc2 = c2.clone();
  const rc3 = c3.clone();
  scene.add(rc);
  scene.add(rc2);
  scene.add(rc3);

  const rbody1 = world.add({
    type: 'box',
    size: [size[0], size[1], size[2]],
    pos: [-pos[0], pos[1], pos[2]],
    world: world,
  });
  const rbody2 = world.add({
    type: 'box',
    size: [size[3]],
    pos: [-pos[3], pos[4], pos[5]],
    world: world,
  });
  const rbody3 = world.add({
    type: 'box',
    size: [size[6], size[7], size[8]],
    pos: [-pos[6], pos[7], pos[8]],
    world: world,
  });

  rc.position.copy(rbody1.getPosition());
  rc2.position.copy(rbody2.getPosition());
  rc3.position.copy(rbody3.getPosition());
  // scene.add(meshPin);
}

/** 初始化10个小圆圈 **/
const cic = [];
const body_cic = [];
function initCircle(){
  var geometry = new THREE.TorusBufferGeometry( 4, 0.6, 8, 32 );
  var material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
  

  const types = ['box','box','box','box','box','box'];
  const sizes = [
    1.2,4,1.2,
    1.2,4,1.2,
    1.2,4,1.2,
    1.2,4,1.2,
    1.2,4,1.2,
    1.2,4,1.2
  ];
  const ros = [
    0,0,0,
    0,0,30,
    0,0,-30,
    0,0,0,
    0,0,30,
    0,0,-30
  ];
  
  const pos = [
    -Math.sqrt(12),0,0,
    -Math.sqrt(12)/2, (4- Math.sqrt(3)/2),0,
    Math.sqrt(12)/2, (4- Math.sqrt(3)/2),0,
    Math.sqrt(12),0,0,
    Math.sqrt(12)/2,-(4- Math.sqrt(3)/2),0,
    -Math.sqrt(12),-(4- Math.sqrt(3)/2),0
  ];


  for(let i=0;i<10;i++){
    const wc = world.add({
      type: types,
      size: sizes,
      pos:[0,0,0],
      posShape: pos,
      move:true,
      name: `cic${i}`
    });
    const c = new THREE.Mesh( geometry, material );
    cic.push(c);
    body_cic.push(wc);
    scene.add(c);
  }
}
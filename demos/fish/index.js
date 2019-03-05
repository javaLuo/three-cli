const container = document.getElementById('canvas-box'); // 容器
let world; // 物理世界对象
let scene; // 场景
let camera; // 相机
let renderer; // 渲染器
let stats; // 帧率辅助器

let BodyGround = []; // 地面对象
let BodyPin = []; // 针头对象
let cic = [];
let body_cic = [];
let boxW,boxH; // 容器真实宽高，px
let threeW, threeH; // three中的盒子宽高
$(function() {
  FastClick.attach(document.body);

  boxW = container.offsetWidth;
  boxH = container.offsetHeight;
  threeH = 100;
  threeW = (boxW / boxH) * threeH;

  $("#btn_left").on('click', {type: "left"}, onBtnClick);
  $("#btn_right").on('click', {type: "right"}, onBtnClick);

  init3boss();
  initHelper();
  initOrbitControl();
  initWorld();
  initGround();
  initPins();
  test();
  initCircle();
  initLights();
  window.addEventListener('resize', resize, false);
  animate();
});

/** 初始化三要素 **/
function init3boss() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(53, boxW / boxH, 0.1, 1000);
  renderer = new THREE.WebGLRenderer();

  camera.position.set(0, 0, 50);
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  // 100前景ground高度，50-相机到ground的距离
  camera.fov = Math.atan((100/2)/50) * 2 * (180 / Math.PI);
  camera.updateProjectionMatrix();

  renderer.setSize(boxW, boxH, true);
  renderer.gammaOutput = true; // 所有纹理和颜色需要乘以gamma输出，颜色会亮丽许多
  container.appendChild(renderer.domElement);
}

/** 窗体大小改变时重置分辨率等参数 **/
function resize() {
  boxW = container.offsetWidth;
  boxH = container.offsetHeight;
  camera.aspect = boxW / boxH;
  camera.updateProjectionMatrix();
  renderer.setSize(boxW, boxH);
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
  for(let i=0;i < body_cic.length;i++){
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
  const material = new THREE.MeshBasicMaterial({ color: 0x002200, transparent: true, opacity: 0 });
  const material1 = new THREE.MeshBasicMaterial({ color: 0x002200, transparent: true, opacity: 1 });
  const material2 = new THREE.MeshBasicMaterial({ color: 0x000022, transparent: true, opacity: 1 });
  const material3 = new THREE.MeshBasicMaterial({ color: 0x220000, transparent: true, opacity: 1 });
  const geometry = new THREE.BoxBufferGeometry(threeW, threeH, 1);

  const cube = new THREE.Mesh(geometry, material); // 正面
  cube.position.set(0, 0, 0.1);

  const cube_back = new THREE.Mesh(geometry, material1); // 背面
  cube_back.position.set(0, 0, -10); // 正面与背面距离10

  const cube_left = new THREE.Mesh(geometry, material2); // 左边
  cube_left.rotation.set(0, Math.PI / 2, 0);
  cube_left.position.set(-threeW/2, 0, 0);

  const cube_right = cube_left.clone(); // 右边
  cube_right.position.set(threeW/2, 0, 0);

  const cube_top = new THREE.Mesh(geometry, material3); // 上边
  cube_top.rotation.set(Math.PI / 2, 0, 0);
  cube_top.position.set(0, threeH/2, 0);

  const cube_bottom = cube_top.clone(); // 下边
  cube_bottom.position.set(0, -threeH/2, 0);
  scene.add(cube);
  scene.add(cube_back);
  scene.add(cube_left);
  scene.add(cube_right);
  scene.add(cube_top);
  scene.add(cube_bottom);

  world.add({ size: [threeW, threeH, 2], pos: [0, 0, 0.1], world }); // 正面
  world.add({ size: [threeW, threeH, 2], pos: [0, 0, -10], world }); // 背面
  world.add({ size: [threeW, threeH, 2], pos: [-threeW/2, 0, 0], rot: [0, 90, 0], world }); // 左边
  world.add({ size: [threeW, threeH, 2], pos: [threeW/2, 0, 0], rot: [0, 90, 0], world }); // 右边
  world.add({ size: [threeW, threeH, 2], pos: [0, threeH/2, 0], rot: [90, 0, 0], world }); // 上边
  world.add({ size: [threeW, threeH, 2], pos: [0, -threeH/2, 0], rot: [90, 0, 0], world }); // 下边
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
    pos: [-14, 50, -4], // start position in degree
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

/** 光 */
function initLights(){
  scene.add(new THREE.AmbientLight(0x222222));
  const l2 = new THREE.DirectionalLight(0xcccccc, 1);
  l2.position.set(0,-100,0);
  scene.add(l2);
}

/** 初始化所有的pin **/
function initPins() {
  const size = [2, 2, 5, 3.6, 12, 12, 1, 20, 1];
  const pos = [
    ((-boxW / boxH) * 100) / 2 / 2, -20, -7.5,
    ((-boxW / boxH) * 100) / 2 / 2, -20, -4,
    ((-boxW / boxH) * 100) / 2 / 2, -10, -4
  ];

  const box = new THREE.BoxGeometry(size[0], size[1], size[2]);
  const box2 = new THREE.SphereBufferGeometry(size[3], size[4], size[5]);
  const box3 = new THREE.ConeBufferGeometry(1.4, 24, 24, 24);

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
function initCircle(){
  const geometry = new THREE.TorusBufferGeometry( 4, 0.6, 8, 32 );
  const material = [
    new THREE.MeshLambertMaterial( { color: 0xeeee00 } ),
    new THREE.MeshLambertMaterial( { color: 0x6688cc } ),
    new THREE.MeshLambertMaterial( { color: 0xcc8866 } )
  ]

  const types = ['box','box','box','box','box','box','box','box','box','box','box','box'];
  const sizes = [
    1,2.2,1,
    1,2.2,1,
    1,2.2,1,
    1,2.2,1,
    1,2.2,1,
    1,2.2,1,
    1,2.2,1,
    1,2.2,1,
    1,2.2,1,
    1,2.2,1,
    1,2.2,1,
    1,2.2,1,
  ];
  
  const ros = [
    0,0,0,
    0,0, -30,
    0,0,-60,
    0,0,-90,
    0,0,60,
    0,0,30,
    0,0,0,
    0,0, -30 ,
    0,0,-60,
    0,0, 90,
    0,0,60,
    0,0,30,
  ];

  const l = 3.5; // 圆心到顶点距离
  const r_d = (Math.cos(Math.PI/180 * 15) * l); // 圆心到边距离

  const pos = [
    -r_d,0,0,
    -Math.cos(Math.PI/180 * 30) * r_d, Math.sin(Math.PI/180 * 30) * r_d,0,
    -Math.cos(Math.PI/180 * 60) * r_d, Math.sin(Math.PI/180 * 60) * r_d,0,
    0,r_d,0,
    Math.cos(Math.PI/180 * 60) * r_d, Math.sin(Math.PI/180 * 60) * r_d, 0,
    Math.cos(Math.PI/180 * 30) * r_d, Math.sin(Math.PI/180 * 30) * r_d,0,
    r_d,0,0,
    Math.cos(Math.PI/180 * 30) * r_d, -Math.sin(Math.PI/180 * 30) * r_d,0,
    Math.cos(Math.PI/180 * 60) * r_d, -Math.sin(Math.PI/180 * 60) * r_d, 0,
    0,-r_d,0,
    -Math.cos(Math.PI/180 * 60) * r_d, -Math.sin(Math.PI/180 * 60) * r_d,0,
    -Math.cos(Math.PI/180 * 30) * r_d, -Math.sin(Math.PI/180 * 30) * r_d,0,
  ];

/** test **/
// const g = new THREE.Group();
// const gg = new THREE.BoxGeometry(sizes[0],sizes[1],sizes[2]);
// const c1 = new THREE.Mesh(gg, material);
// const pi = Math.PI/180;
// c1.position.set(pos[0],pos[1],pos[2]);
// c1.rotation.set(ros[0]*pi,ros[1]*pi,ros[2]*pi);

// const c2 = c1.clone();
// c2.position.set(pos[3],pos[4],pos[5]);
// c2.rotation.set(ros[3]*pi,ros[4]*pi,ros[5]*pi);

// const c3 = c1.clone();
// c3.position.set(pos[6],pos[7],pos[8]);
// c3.rotation.set(ros[6]*pi,ros[7]*pi,ros[8]*pi);

// const c4 = c1.clone();
// c4.position.set(pos[9],pos[10],pos[11]);
// c4.rotation.set(ros[9]*pi,ros[10]*pi,ros[11]*pi);

// const c5 = c1.clone();
// c5.position.set(pos[12],pos[13],pos[14]);
// c5.rotation.set(ros[12]*pi,ros[13]*pi,ros[14]*pi);

// const c6 = c1.clone();
// c6.position.set(pos[15],pos[16],pos[17]);
// c6.rotation.set(ros[15]*pi,ros[16]*pi,ros[17]*pi);

// const c7 = c1.clone();
// c7.position.set(pos[18],pos[19],pos[20]);
// c7.rotation.set(ros[18]*pi,ros[19]*pi,ros[20]*pi);

// const c8 = c1.clone();
// c8.position.set(pos[21],pos[22],pos[23]);
// c8.rotation.set(ros[21]*pi,ros[22]*pi,ros[23]*pi);

// const c9 = c1.clone();
// c9.position.set(pos[24],pos[25],pos[26]);
// c9.rotation.set(ros[24]*pi,ros[25]*pi,ros[26]*pi);

// const c10 = c1.clone();
// c10.position.set(pos[27],pos[28],pos[29]);
// c10.rotation.set(ros[27]*pi,ros[28]*pi,ros[29]*pi);

// const c11 = c1.clone();
// c11.position.set(pos[30],pos[31],pos[32]);
// c11.rotation.set(ros[30]*pi,ros[31]*pi,ros[32]*pi);

// const c12 = c1.clone();
// c12.position.set(pos[33],pos[34],pos[35]);
// c12.rotation.set(ros[33]*pi,ros[34]*pi,ros[35]*pi);

// g.add(c1);
// g.add(c2);
// g.add(c3);
// g.add(c4);
// g.add(c5);
// g.add(c6);
// g.add(c7);
// g.add(c8);
// g.add(c9);
// g.add(c10);
// g.add(c11);
// g.add(c12);

// scene.add(g);

  for(let i=0;i<10;i++){
    let x,y;
    if(i<5){
      x = -20 + i*10;
      y = 40;
    } else {
      x = -70 +i*10;
      y = 30;
    }
    const wc = world.add({
      type: types,
      size: sizes,
      posShape: pos,
      pos: [x,y,-5],
      rot: ros,
      move:true ,
      name: `cic${i}`
    });

    const c = new THREE.Mesh( geometry, material[i%3] );
    cic.push(c);
    body_cic.push(wc);
    scene.add(c);
  }
}

/** 左边按钮被点击 **/
function onBtnClick(event){
  const t = event.data.type;
  const center = new THREE.Vector3(-threeW/2,-threeH/2,0);
  let m, force;

  for(let i=0;i<body_cic.length;i++){
    const p = cic[i].position;
    // const power = {x: pos.x - threeW/2 + 10}
    if(t === 'left'){
      body_cic[i].applyImpulse(p, {x: 300,y:1000,z:-100});
    } else {
      body_cic[i].applyImpulse(p, {x: -300,y:1000,z:-100});
    }
  }
}

<template>
  <div id="container">
    <div class="el_cls_pcd_box" ref="el_ref_pcd_box">
      <button
        :class="{
          'selected-aov-btn': selectedAovIndex === index,
          'uns-aov-btn': selectedAovIndex !== index,
        }"
        :style="{ left: `calc(3vw + ${index * 120}px)` }"
        v-for="(item, index) in aovNameList"
        :key="index"
        @click="clickAOV(index)"
      >
        {{ $t("Buttons.Button" + (index + 1)) }}
      </button>
    </div>
  </div>
</template>
      
<script>
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"; //"three的针对相机的轨道控制器"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { clone } from "three/examples/jsm/utils/SkeletonUtils";
//three
let t_scene = null;
//资源
import floorTexture from "/assets/texture-carpet-2.png";
import wallTexture from "/assets/texture-carpet-1.png";
import screenTexture from "/assets/screen-1.png";

let human_models = [
  {
    path: "/assets/gltfs/male_2_new(2).glb",
    an_walk_clip_name: "Rig|man_idle",
    an_idle_clip_name: "Rig|man_idle",
    model_origin_rotate_x: Math.PI / 2,
    model_origin_rotate_y: Math.PI / 2,
    obstract_human_model: null, //在加载完毕后赋值
    obstract_human_gltf: null, //在加载完毕后赋值
    height: 1.82403,
    width: 0.435992,
    thickness: 0.290654,
  },
];

export default {
  name: "FusionAlgorithm",
  components: {},
  watch: {
    gltf_loaded_count(value) {
      console.log(value);
      if (value == human_models.length) {
        const THIS = this;
        //话题message
        this.r_fusion_listner.subscribe(function (message) {
          console.log(message);
          // const now = new Date();
          // const milliseconds = now.getTime();
          // console.log(milliseconds);
          THIS.updateObstracleToScene(message);
        });
        this.resetCameraView(0);
      }
    },
  },
  data() {
    return {
      //
      ros: null,
      //
      t_camera: null,
      t_renderer: null,
      t_orbitControl: null,
      pcd_canvas_width: 0,
      pcd_canvas_height: 0,
      //
      shouldDoReRender: false,
      //
      selectedAovIndex: 0,
      //
      aovNameList: [
        this.$t("Buttons.Button1"),
        this.$t("Buttons.Button2"),
        this.$t("Buttons.Button3"),
      ],
      //三视图相机坐标
      aovPointList: [
        new THREE.Vector3(
          0.04863317975457897,
          -4.637427658825402,
          1.9364927503943365
        ),
        new THREE.Vector3(
          0.1604982648090563,
          0.12374679350199147,
          11.472517101296571
        ),
        new THREE.Vector3(
          -5.775984515479597,
          0.13267900462905732,
          1.4288224252425863
        ),
      ],
      aovDirectionList: [
        new THREE.Vector3(
          0.03702500503275326,
          -3.6376242617817094,
          1.9204173798065598
        ),
        new THREE.Vector3(
          0.160523643512375,
          0.13941592302534198,
          0.08729195868031897,
          10.472639869964693
        ),
        new THREE.Vector3(
          -4.777613178262525,
          0.1584434252814009,
          1.3779218589211244
        ),
      ],
      //3dbox信息集合 id : 3dbox
      threeDboxes: {},
      //动画时钟
      clock: new THREE.Clock(),
      //
      gltf_loaders: [],
      //
      gltf_loaded_count: 0,
    };
  },
  computed: {},
  methods: {
    ros_init() {
      const THIS = this;
      this.ros = new ROSLIB.Ros({
        url: THIS.$ros_socket_url,
      });
      this.r_fusion_listner = new ROSLIB.Topic({
        ros: this.ros,
        name: "/lidar_camera_fusion_obstacles",
        messageType: "perception_fusion_msgs/PerceptionObstacles",
      });
      // 连接成功的回调
      this.ros.on("connection", function () {
        console.log("Connected to websocket server.");
      });

      // 连接错误的回调
      this.ros.on("error", function (error) {
        console.log("Error connecting to websocket server: ", error);
      });

      // 连接关闭的回调
      this.ros.on("close", function () {
        console.log("Connection to websocket server closed.");
      });
    },
    ros_unsubscribe() {
      if (this.r_fusion_listner) this.r_fusion_listner.unsubscribe();
    },
    resetCameraView(index) {
      const target_v = this.aovPointList[index];
      const target_l = this.aovDirectionList[index];
      this.t_camera.position.set(target_v.x, target_v.y, target_v.z);
      this.t_camera.lookAt(target_l.x, target_l.y, target_l.z);
      this.t_camera.updateProjectionMatrix();
    },
    /**
     * 更新某人物模型状态，包括动画更新、位置更新
     *
     * @param {Boolean} isNew - 是否是新建的人物
     * @param {Object3D} obj - 人物模型
     * @param {Vector3} target_position - 即将到达的位置
     * @param {Float} theta - 转向角
     * @param {Float} height - 人物高度
     * @returns void
     */
    updateObstracleState(isNew, obj, target_position, theta, height) {
      const min_walk_threshold = 0.05; //最小移动阈值，单位米
      const target_human_info = human_models[obj.index_of_models];
      const target_gltf = target_human_info.obstract_human_gltf;
      const an_idle_clip_name = target_human_info.an_idle_clip_name;
      const an_walk_clip_name = target_human_info.an_walk_clip_name;
      if (isNew) {
        let mixer = new THREE.AnimationMixer(obj);
        target_gltf.animations.forEach((clip) => {
          if (clip.name == an_idle_clip_name) {
            mixer.clipAction(clip).play();
          }
        });
        obj.mixer = mixer;
        obj.rotation.y = target_human_info.model_origin_rotate_y + theta; //朝向
        obj.position.set(target_position.x, target_position.y, 0); //位置
      } else {
        if (
          Math.abs(parseFloat(obj.position.x) - parseFloat(target_position.x)) <
            min_walk_threshold &&
          Math.abs(parseFloat(obj.position.y) - parseFloat(target_position.y)) <
            min_walk_threshold
        ) {
          //未超过移动阈值，判断为非移动状态
          target_gltf.animations.forEach((clip) => {
            if (clip.name == an_idle_clip_name) {
              obj.mixer.clipAction(clip).play();
            }
            if (clip.name == an_walk_clip_name) {
              obj.mixer.clipAction(clip).stop();
            }
          });
          obj.rotation.y = target_human_info.model_origin_rotate_y + theta; //朝向
          obj.position.set(target_position.x, target_position.y, 0); //位置
        } else {
          target_gltf.animations.forEach((clip) => {
            if (clip.name == an_idle_clip_name) {
              obj.mixer.clipAction(clip).stop();
            }
            if (clip.name == an_walk_clip_name) {
              obj.mixer.clipAction(clip).play();
            }
          });
          obj.rotation.y = target_human_info.model_origin_rotate_y + theta; //朝向
          obj.position.set(target_position.x, target_position.y, 0); //位置
        }
        //** 这里为了防止模型变形，三个轴的缩放全部用高度比作为比例，长宽高都用这个比例缩放 */
        let scale_value = parseFloat(
          height / target_human_info.height
        );
        obj.scale.set(scale_value, scale_value, scale_value);
        //** 这里为了防止模型变形，三个轴的缩放全部用高度比作为比例，长宽高都用这个比例缩放 */
      }
    },
    updateObstracleToScene(message) {
      const THIS = this;
      //多退
      for (let j = 0; j < t_scene.children.length; j++) {
        let obj = t_scene.children[j];
        if (obj.obstacle_id) {
          let exist = false;
          for (let i = 0; i < message.obstacles.length; i++) {
            let obstacle = message.obstacles[i];
            if (obj.obstacle_id == obstacle.id) {
              exist = true; //新的这一帧里还有这个
              break;
            }
          }
          if (exist == false) {
            //新的这一帧里没这个了
            t_scene.remove(obj);
            if (obj.material) obj.material.dispose();
            if (obj.geometry) obj.geometry.dispose();
          }
        }
      }
      //少补
      for (let i = 0; i < message.obstacles.length; i++) {
        let obstacle = message.obstacles[i];
        let exist = false;
        for (let j = 0; j < t_scene.children.length; j++) {
          let obj = t_scene.children[j];
          if (obj.obstacle_id && obj.obstacle_id == obstacle.id) {
            //已存在的
            exist = true;
            //
            THIS.updateObstracleState(
              false,
              obj,
              obstacle.position,
              obstacle.theta,
              obstacle.height
            );
            break;
          }
        }
        if (exist == false) {
          //不存在就新增
          const obstacle_mesh = THIS.mesh_deep_copy(obstacle);
          obstacle_mesh.obstacle_id = obstacle.id;
          //
          THIS.updateObstracleState(
            true,
            obstacle_mesh,
            obstacle.position,
            obstacle.theta,
            obstacle.height
          );
          t_scene.add(obstacle_mesh);
        }
      }
    },
    clickAOV(index) {
      this.resetCameraView(index);
      this.selectedAovIndex = index;
    },
    three_init() {
      this.pcd_canvas_width = this.$refs.el_ref_pcd_box.offsetWidth;
      this.pcd_canvas_height = this.$refs.el_ref_pcd_box.offsetHeight;
      t_scene = new THREE.Scene();
      this.t_camera = new THREE.PerspectiveCamera(
        50,
        this.pcd_canvas_width / this.pcd_canvas_width,
        1,
        1000
      );

      this.t_camera.up = new THREE.Vector3(0, 0, 1).normalize();
      this.t_renderer = new THREE.WebGLRenderer({ antialias: true });
      this.t_renderer.setSize(this.pcd_canvas_width, this.pcd_canvas_height);
      this.t_camera.aspect = this.pcd_canvas_width / window.innerHeight;
      this.resetCameraView(0);

      this.$refs.el_ref_pcd_box.appendChild(this.t_renderer.domElement);
      // 轨道控制器
      this.t_orbitControl = new OrbitControls(
        this.t_camera,
        this.t_renderer.domElement
      );
      this.t_orbitControl.update();
      const THIS = this;
      this.t_orbitControl.addEventListener("change", () => {
        console.log(THIS.t_camera.position);
        const direction = new THREE.Vector3();
        THIS.t_camera.getWorldDirection(direction);
        const lookAtPosition = new THREE.Vector3();
        lookAtPosition.addVectors(THIS.t_camera.position, direction);
        console.log(lookAtPosition);
      });
      //
      // const axesHelper = new THREE.AxesHelper(2);
      // t_scene.add(axesHelper);

      //
      this.t_renderer.setClearColor(0x000000, 0.5); //背景透明度为0
      //
      this.reRender();
      //
      window.onresize = () => {
        // 重置渲染器输出画布，相机
        this.resizePCDBox();
      };
    },
    //
    resizePCDBox() {
      if (
        this.$refs.el_ref_pcd_box == undefined ||
        !this.$refs.el_ref_pcd_box
      ) {
        return;
      }
      this.pcd_canvas_width = this.$refs.el_ref_pcd_box.offsetWidth;
      this.pcd_canvas_height = this.$refs.el_ref_pcd_box.offsetHeight;
      this.t_renderer.setSize(this.pcd_canvas_width, this.pcd_canvas_height);
      this.t_camera.aspect = this.pcd_canvas_width / window.innerHeight;
      this.t_camera.updateProjectionMatrix();
    },
    //
    reRender() {
      if (this.shouldDoReRender == false) return;

      // 更新所有动画混合器
      const delta = this.clock.getDelta();
      for (let i = 0; i < t_scene.children.length; i++) {
        const node = t_scene.children[i];
        if (node.mixer && node.mixer != undefined) {
          node.mixer.update(delta);
        }
      }
      //
      this.t_renderer.render(t_scene, this.t_camera);
      //
      requestAnimationFrame(this.reRender);
    },
    //静态场景&模型构建
    static_build() {
      // const floor_geometry = new THREE.PlaneGeometry(9.965, 7.4);
      // //创建一个纹理加载器
      // const textureLoader = new THREE.TextureLoader();
      // // 加载纹理贴图，注意这里必须要用require
      // // let floor_require_path = require("@/assets/texture-carpet-2.png");
      // // 加载器执行加载
      // const texture = textureLoader.load(floorTexture, () => {});
      // // 纹理阵列效果
      // texture.wrapS = THREE.RepeatWrapping; // 水平方向阵列方式
      // texture.wrapT = THREE.RepeatWrapping; // 垂直方向阵列方式
      // texture.repeat.set(40, 30); // 各方向上阵列数量
      // //
      // const floor_material = new THREE.MeshLambertMaterial({
      //   map: texture,
      //   side: THREE.DoubleSide,
      // });
      // const floor_mesh = new THREE.Mesh(floor_geometry, floor_material);
      // t_scene.add(floor_mesh);

      // for (let i = 0; i < 5; i++) {
      //   let wall_geometry = null;
      //   if (i == 0 || i == 1) {
      //     wall_geometry = new THREE.PlaneGeometry(5, 7.4);
      //   } else if (i == 2 || i == 3) {
      //     wall_geometry = new THREE.PlaneGeometry(9.965, 5);
      //   } else if (i == 4) {
      //     wall_geometry = new THREE.PlaneGeometry(9.965, 7.4);
      //   }
      //   // 加载器执行加载
      //   const wall_texture = textureLoader.load(wallTexture, () => {});
      //   // 纹理阵列效果
      //   wall_texture.wrapS = THREE.RepeatWrapping; // 水平方向阵列方式
      //   wall_texture.wrapT = THREE.RepeatWrapping; // 垂直方向阵列方式
      //   wall_texture.repeat.set(40, 30); // 各方向上阵列数量
      //   let wall_material = new THREE.MeshLambertMaterial({
      //     map: wall_texture,
      //   });
      //   let wall_mesh = new THREE.Mesh(wall_geometry, wall_material);
      //   if (i == 0) {
      //     wall_mesh.position.x = 4.9825;
      //     wall_mesh.position.z = 2.5;
      //     wall_mesh.rotateY(Math.PI / 2);
      //     wall_mesh.material.side = THREE.BackSide;
      //   } else if (i == 1) {
      //     wall_mesh.position.x = -4.9825;
      //     wall_mesh.position.z = 2.5;
      //     wall_mesh.rotateY(Math.PI / 2);
      //     wall_mesh.material.side = THREE.FrontSide;
      //   } else if (i == 2) {
      //     wall_mesh.position.y = 3.7;
      //     wall_mesh.position.z = 2.5;
      //     wall_mesh.rotateX(Math.PI / 2);
      //     wall_mesh.material.side = THREE.FrontSide;
      //   } else if (i == 3) {
      //     wall_mesh.position.y = -3.7;
      //     wall_mesh.position.z = 2.5;
      //     wall_mesh.rotateX(Math.PI / 2);
      //     wall_mesh.material.side = THREE.BackSide;
      //   } else if (i == 4) {
      //     wall_mesh.position.x = 0;
      //     wall_mesh.position.z = 5;
      //     wall_mesh.material.side = THREE.BackSide;
      //   }

      //   t_scene.add(wall_mesh);
      // }
      // let screen_geometry = null;
      // screen_geometry = new THREE.PlaneGeometry(7, 2);
      // // 加载器执行加载
      // const screen_texture = textureLoader.load(screenTexture, () => {});
      // let screen_material = new THREE.MeshBasicMaterial({
      //   map: screen_texture,
      //   side: THREE.DoubleSide,
      // });
      // let screen_mesh = new THREE.Mesh(screen_geometry, screen_material);
      // screen_mesh.rotateX(Math.PI / 2);
      // screen_mesh.position.y = 3.68;
      // screen_mesh.position.z = 1.5;
      // screen_mesh.position.x = 0;
      // t_scene.add(screen_mesh);

      // * 灯光添加*/
      for (let i = 0; i < 4; i++) {
        let x = 0;
        let y = 0;
        if (i == 0) {
          x = -2.49125;
          y = -1.85;
        } else if (i == 1) {
          x = 2.49125;
          y = 1.85;
        } else if (i == 2) {
          x = -2.49125;
          y = 1.85;
        } else if (i == 3) {
          x = 2.49125;
          y = -1.85;
        }
        const light = new THREE.PointLight(0xffffff, 50, 10000);
        light.position.set(x, y, 4.9);
        t_scene.add(light);
        // const sphereSize = 0.1;
        // const pointLightHelper = new THREE.PointLightHelper(light, sphereSize);
        // t_scene.add(pointLightHelper);
      }
      const lightTop = new THREE.PointLight(0xffffff, 50, 10000);
      lightTop.position.set(0, 0, 10);
      t_scene.add(lightTop);
      const lightRight = new THREE.PointLight(0xffffff, 25, 10000);
      lightRight.position.set(9.965, 0, 2.5);
      t_scene.add(lightRight);
      const lightLeft = new THREE.PointLight(0xffffff, 25, 10000);
      lightLeft.position.set(-9.965, 0, 2.5);
      t_scene.add(lightLeft);
      const lightBack = new THREE.PointLight(0xffffff, 25, 10000);
      lightBack.position.set(0, 7.4, 2.5);
      t_scene.add(lightBack);
      const lightFront = new THREE.PointLight(0xffffff, 25, 10000);
      lightFront.position.set(0, -7.4, 2.5);
      t_scene.add(lightFront);
      //* 灯光添加*/

      const gltf_loader = new GLTFLoader();
      gltf_loader.load("/assets/hall_static_model.glb", (gltf) => {
        const model = gltf.scene;
        model.rotateX(Math.PI / 2);
        let i = 0; //测试用游标
        model.traverse(function (node) {
          if (node.material) {
            console.log(i);
            console.log(node.material.name);
            if (
              // node.material.name == "light_shell.002" ||
              node.material.name == "wall_hall.001" ||
              node.material.name == "door_glass.001" ||
              node.material.name == "metal.001" ||
              node.material.name == "light_shine.001"
            ) {
              node.material.transparent = true;
              node.material.opacity = 0.4;
              node.material.needsUpdate = true;
            }
          }

          i++;
        });
        t_scene.add(model);
      });
    },
    dynamic_build() {
      //
      const THIS = this;
      //
      for (let i = 0; i < human_models.length; i++) {
        const human_model_info = human_models[i];
        const gltf_loader = new GLTFLoader();
        // 加载GLTF资源
        gltf_loader.load(human_model_info.path, (gltf) => {
          console.log("模型" + human_model_info.path + "包含动画如下↓");
          console.log(gltf.animations);
          const model = gltf.scene;
          model.rotateX(human_model_info.model_origin_rotate_x);
          model.rotateY(human_model_info.model_origin_rotate_y);
          model.mixer = new THREE.AnimationMixer(model);
          gltf.animations.forEach((clip) => {
            if (clip.name == human_model_info.an_idle_clip_name) {
              model.mixer.clipAction(clip).play();
            }
          });
          model.index_of_models = i;
          human_models[i].obstract_human_model = model;
          human_models[i].obstract_human_gltf = gltf;
          THIS.gltf_loaded_count += 1;
          t_scene.add(model);
        });
      }

      const theLoader = new GLTFLoader();
      theLoader.load("/assets/znzy.glb", (gltf) => {
        const model = gltf.scene;
        model.traverse(function (node) {
          if (node.material) {
            if (node.name == "Mesh001_2") {
              //这是那个玻璃罩
              node.material.transparent = true;
              node.material.opacity = 0.5;
            }
          }
        });
        model.rotateX(Math.PI / 2);
        //** test/
        model.position.set(2, 0.25, 0);
        model.scale.set(0.8, 0.8, 0.8);
        //** test/
        // t_scene.add(model);
      });
    },
    ros_subscribe() {},
    /**
     * 只有新建时调用---深拷贝某mesh模型，目前加入随机逻辑
     *
     * @param {Object} obstacle_info 目标物信息
     * @returns void
     */
    mesh_deep_copy(obstacle_info) {
      let target_index = 0;
      let probs = [100]; //对应各模型出现的概率数组，调整他就行
      let random = Math.floor(Math.random() * 100) + 1;
      for (let i = 0; i < probs.length; i++) {
        let prob = probs[i];
        if (random <= prob) {
          target_index = i;
          break;
        }
      }
      let new_mesh = clone(human_models[target_index].obstract_human_model);
      new_mesh.index_of_models =
        human_models[target_index].obstract_human_model.index_of_models;

      //** 这里为了防止模型变形，三个轴的缩放全部用高度比作为比例，长宽高都用这个比例缩放 */
      let scale_value = parseFloat(
        obstacle_info.height / human_models[target_index].height
      );
      new_mesh.scale.set(scale_value, scale_value, scale_value);
      //** 这里为了防止模型变形，三个轴的缩放全部用高度比作为比例，长宽高都用这个比例缩放 */

      return new_mesh;
    },
  },
  mounted() {
    this.shouldDoReRender = true;
    //
    this.ros_init();
    //
    this.three_init();
    //
    this.static_build();
    //
    this.ros_subscribe();
    //
    this.dynamic_build();
  },
  beforeUnmount() {
    this.shouldDoReRender = false;
    this.ros_unsubscribe();
    t_scene.remove(...t_scene.children);
  },
};
</script>
      
<style scoped>
@import "../css/input_slider.css";
.el_cls_pcd_box {
  width: 95vw;
  margin-left: 2.5vw;
  margin-top: 2.5vh;
  height: 83vh;
}
</style>
      
<template>
  <div id="viewer">
    <div class="el_cls_obstacles_list">
      <div v-if="obstacles_list.length > 0" style="color: white;text-align: right;padding-right: 5px;">
        {{ "id:0; 类型:座舱; 高度:2.08" }}
      </div>
      <div
        v-for="(item, index) in obstacles_list"
        :key="index"
        style="color: white;text-align: right;padding-right: 5px;"
      >
        {{
          "id:" +
          item.id +
          "; 类型:行人" +
          "; 高度:" +
          toFloat2(item.height) +
          "; 速度:" +
          toSqrt(item.velocity.x, item.velocity.y)
        }}
      </div>
    </div>
  </div>
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
  <button
    :class="{
      'selected-aov-btn-g': selectedShowModeIndex === index,
      'uns-aov-btn': selectedShowModeIndex !== index,
    }"
    :style="{ right: `calc(3vw + ${index * 120}px)` }"
    v-for="(item, index) in showModeNameList"
    :key="index"
    @click="clickShowModeChange(index)"
  >
    {{ $t("Buttons.Button" + (index + 4)) }}
  </button>
</template>

<script>

let floor = null; //floor_plane

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import ROSLIB from "roslib";
import { Add2DLabelSpriteToMesh } from "../js/LabelSprite3D";
import { CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
export default {
  name: "PointCloudDetection",
  watch: {
    showMode(value) {
      console.log('enter watch method--' + value)
    }
  },
  data() {
    return {
      showMode: -1,
      selectedShowModeIndex: -1,
      showModeNameList: [
        this.$t("Buttons.Button4"),
        this.$t("Buttons.Button5"),
        this.$t("Buttons.Button6"),
      ],

      r_listner_lidar_out: null, //leidadianyun mubiao
      r_listner_marker: null, //原始markerListner
      r_listner_crop: null, //裁剪的点云listner

      ros: null,
      viewer: null,
      currentPointCloud: null,
      controls: null,
      markerObjects: [],
      markerSubsObjects: [],
      //
      t_camera: null,
      //三视图相机坐标
      aovPointList: [
        new THREE.Vector3(0, -9.33, 5.8),
        new THREE.Vector3(0, -0.01, 15.1),
        new THREE.Vector3(12.4, 0, 8),
      ],
      //
      selectedAovIndex: 0,
      aovNameList: [
        this.$t("Buttons.Button1"),
        this.$t("Buttons.Button2"),
        this.$t("Buttons.Button3"),
      ],
      //
      obstacles_list: [],
      //
      labelRenderer: null,
    };
  },
  mounted() {
    this.init();
    //console.log(document.get)
  },
  beforeDestroy() {
    this.cleanup();
  },
  methods: {
    toSqrt(x, y) {
      return Math.sqrt(x * x + y * y)
        .toFixed(2)
        .toString();
    },
    toFloat2(float) {
      return float.toFixed(2).toString();
    },
    clickAOV(index) {
      const target_v = this.aovPointList[index];
      this.t_camera.position.set(target_v.x, target_v.y, target_v.z);
      this.t_camera.lookAt(0, 0, 0);
      this.t_camera.updateProjectionMatrix();
      this.selectedAovIndex = index;
    },
    clickShowModeChange(index){
      console.log('enter click method--' + index)
      this.showMode = index
      this.selectedShowModeIndex = index
    },
    init() {
      this.ros = new ROSLIB.Ros({
        url: this.$ros_socket_url,
      });
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      camera.up = new THREE.Vector3(0, 0, 1).normalize();
      camera.position.y = -8;
      camera.position.z = 5;
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(
        document.getElementById("viewer").offsetWidth,
        document.getElementById("viewer").offsetHeight
      );
      document.getElementById("viewer").appendChild(renderer.domElement);

      //
      this.labelRenderer = new CSS2DRenderer();
      this.labelRenderer.setSize(
        document.getElementById("viewer").offsetWidth,
        document.getElementById("viewer").offsetHeight
      );
      this.labelRenderer.domElement.style.position = "absolute";
      this.labelRenderer.domElement.style.top = "0px";
      this.labelRenderer.domElement.style.pointerEvents = "none";
      document
        .getElementById("viewer")
        .appendChild(this.labelRenderer.domElement);

      //
      const axesHelper = new THREE.AxesHelper(10);
      scene.add(axesHelper);
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
        model.scale.set(1, 1, 1);
        //** test/
        scene.add(model);
      });

      //
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.addEventListener("change", () => {
        console.log(camera.position.x, camera.position.y, camera.position.z);
      });

      this.viewer = { scene, camera, renderer };
      this.controls = controls;

      //
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
        scene.add(light);
      }

      /** listners初始化 */
      this.r_listner_crop = new ROSLIB.Topic({
        ros: this.ros,
        name: "/c32/lslidar_point_cloud_crop",
        messageType: "sensor_msgs/PointCloud2",
      });
      this.r_listner_crop.subscribe((message)=>{
        const { points, colors } = this.parsePointCloud2(message);
        this.updatePointCloud(points, colors);
      })
      this.r_listner_marker = new ROSLIB.Topic({
        ros: this.ros,
        name: "/lidar_camera_fusion_obstacles",
        messageType: "perception_fusion_msgs/PerceptionObstacles",
      });

      this.r_listner_marker.subscribe((message)=>{
        if(THIS.showMode == 0){
          this.updateMarkers(null,false);
          //
          this.obstacles_list = [];
        }else if(THIS.showMode == 1){
          console.log(message)
          //
          this.obstacles_list = [];
        }else if(THIS.showMode == 2){
          this.updateMarkers(message,true);
          //
          this.obstacles_list = message.obstacles;
        }
      })

      this.r_listner_lidar_out = new ROSLIB.Topic({
        ros: this.ros,
        name: "/lidar_output_objects_vis",
        messageType: "visualization_msgs/MarkerArray",
      });
      this.r_listner_lidar_out.subscribe((message)=>{
        if(THIS.showMode == 0){
          this.obstacles_list = [];
        }else if(THIS.showMode == 1){
          console.log(message)
          this.markerSubsObjects.forEach((sub)=>{
            if(sub.parent){
              sub.parent.remove(sub)
              if(sub.material) sub.material.dispose()
              if(sub.geometry) sub.geometry.dispose()
            }
          })
          this.updateLidarOutMarker(message.markers)
          
          this.obstacles_list = [];
        }else if(THIS.showMode == 2){
          //this.updateMarkers(null,false);
          //this.obstacles_list = [];
        }
      })
      
      

      /** listners初始化 */

      // const pointListener = new ROSLIB.Topic({
      //   ros: this.ros,
      //   name: "/c32/lslidar_point_cloud_crop",
      //   messageType: "sensor_msgs/PointCloud2",
      // });

      // pointListener.subscribe((message) => {
      //   const { points, colors } = this.parsePointCloud2(message);
      //   this.updatePointCloud(points, colors);
      // });
      // const obstacleListener = new ROSLIB.Topic({
      //   ros: this.ros,
      //   name: "/lidar_camera_fusion_obstacles",
      //   messageType: "perception_fusion_msgs/PerceptionObstacles",
      // });
      // obstacleListener.subscribe((message) => {
      //   console.log(message)
      //   this.updateMarkers(message);
      //   //
      //   //this.obstacles_list = message.obstacles
      // })


      //触发默认点云showMode
      this.clickShowModeChange(2)

      const THIS = this;

      const animate = () => {
        requestAnimationFrame(animate);
        controls.update();
        THIS.labelRenderer.render(scene, camera);
        renderer.render(scene, camera);
      };
      animate();

      window.onresize = () => {
        renderer.setSize(
          document.getElementById("viewer")
            ? document.getElementById("viewer").offsetWidth
            : 0,
          document.getElementById("viewer")
            ? document.getElementById("viewer").offsetHeight
            : 0
        );
      };
      const device_center = new THREE.Vector3(
        1.896925351326913,
        0.16613230974288268,
        1.0664865882957915
      );
      const device_rpy = new THREE.Euler(
        0.0012783915738306436,
        -0.018823034946190514,
        -3.10286234635907,
        "XYZ"
      );
      const device_size = new THREE.Vector3(
        2.209265675197128,
        1.4233698815065425,
        2.0827078643967587
      );
      const geometry = new THREE.BoxGeometry(
        device_size.x,
        device_size.y,
        device_size.z
      );
      const material = new THREE.MeshBasicMaterial({
        color: 0x2d5cf6,
        opacity: 0,
        transparent: true,
      });
      const device = new THREE.Mesh(geometry, material);
      device.position.copy(device_center);
      device.rotation.copy(device_rpy);
      scene.add(device);
      Add2DLabelSpriteToMesh(
        this.labelRenderer,
        document.getElementById("viewer"),
        device,
        null
      );
      this.t_camera = camera;

      //
      this.initFloorPlane(scene)
    },
    initFloorPlane(scene) {
      const floor_center = new THREE.Vector3(
        0.16184641386053672,
        -0.07261496642941423,
        0.06885156347134307
      );
      const floor_rpy = new THREE.Euler(
        0.0012783915738306436,
        -0.018823034946190514,
        -3.10286234635907,
        "XYZ"
      );
      const floor_size = new THREE.Vector3(
        10.92577485552679,
        7.827267633427969,
        0.41118367026004066
      );

      const geometry = new THREE.BoxGeometry(
        floor_size.x,
        floor_size.y,
        floor_size.z
      );
      const material = new THREE.MeshBasicMaterial({
        color: 0x808080,
        opacity: 0.5,
        transparent: true,
      });
      floor = new THREE.Mesh(geometry, material);

      floor.position.copy(floor_center);
      floor.rotation.copy(floor_rpy);

      scene.add(floor);

      floor.visible = true  //默认显示


    },
    parsePointCloud2(message) {
      const points = [];
      const colors = [];
      if (!message.data || message.data.length === 0) {
        return { points, colors };
      }
      const binaryString = atob(message.data);
      const data = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        data[i] = binaryString.charCodeAt(i);
      }

      const pointStep = message.point_step;
      const offsetX = message.fields.find((f) => f.name === "x").offset;
      const offsetY = message.fields.find((f) => f.name === "y").offset;
      const offsetZ = message.fields.find((f) => f.name === "z").offset;
      const offsetI = message.fields.find((f) => f.name === "intensity").offset;

      for (let i = 0; i < data.length; i += pointStep) {
        const x = new DataView(data.buffer, i + offsetX, 4).getFloat32(0, true);
        const y = new DataView(data.buffer, i + offsetY, 4).getFloat32(0, true);
        const z = new DataView(data.buffer, i + offsetZ, 4).getFloat32(0, true);
        const intensity = new DataView(data.buffer, i + offsetI, 4).getFloat32(
          0,
          true
        );
        points.push(new THREE.Vector3(x, y, z));
        let color;
        if (z < 0.5) {
          color = new THREE.Color(0.5, 0.5, 0.5);
        } else if (x < -4.5 || y < -3) {
          color = new THREE.Color(0, 0, 1);
        } else {
          color =
            intensity < 255
              ? this.intensityToColor(intensity)
              : new THREE.Color(0x2d5cf6);
        }
        colors.push(color);
      }
      return { points, colors };
    },

    intensityToColor(intensity) {
      const normalizedIntensity = intensity / 255;
      const color = new THREE.Color();
      color.setHSL((1.0 - normalizedIntensity) * 0.7, 1.0, 0.5);
      return color;
    },
    updatePointCloud(points, colors) {
      if (this.currentPointCloud) {
        this.viewer.scene.remove(this.currentPointCloud);
        this.currentPointCloud.geometry.dispose();
        this.currentPointCloud.material.dispose();
      }

      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const colorArray = new Float32Array(colors.length * 3);
      colors.forEach((color, index) => {
        colorArray[index * 3] = color.r;
        colorArray[index * 3 + 1] = color.g;
        colorArray[index * 3 + 2] = color.b;
      });
      geometry.setAttribute("color", new THREE.BufferAttribute(colorArray, 3));
      const material = new THREE.PointsMaterial({
        size: 0.03,
        vertexColors: true,
      });
      this.currentPointCloud = new THREE.Points(geometry, material);

      this.viewer.scene.add(this.currentPointCloud);
    },

    updateLidarOutMarker(markers){
      this.markerSubsObjects.forEach(sub=>{
        this.viewer.scene.remove(sub);
        if(sub.material) sub.material.dispose()
        if(sub.geometry) sub.geometry.dispose()
      })
      this.markerObjects.forEach(marker=>{
        this.viewer.scene.remove(marker);
        if(marker.material) marker.material.dispose()
        if(marker.geometry) marker.geometry.dispose()
      })
      this.markerObjects = [];

      markers.forEach(marker => {
        if(marker.type == 1){
          const geometry = new THREE.BoxGeometry(marker.scale.x,marker.scale.y,marker.scale.z)
          const material = new THREE.MeshBasicMaterial({
            color: marker.color,
            opacity:0.5,
            transparent:true
          })
          const cube = new THREE.Mesh(geometry,material)
          cube.position.set(marker.pose.position.x,marker.pose.position.y,marker.pose.position.z)
          cube.quaternion.set(marker.pose.orientation.x,marker.pose.orientation.y,marker.pose.orientation.z,marker.pose.orientation.w)
          this.viewer.scene.add(cube)
          this.markerObjects.push(cube)
        }
      })
    },

    updateMarkers(message,flag) {
      this.markerSubsObjects.forEach((sub) => {
        if (sub.parent) {
          sub.parent.remove(sub);
          if (sub.material) marker.material.dispose();
          if (sub.geometry) marker.geometry.dispose();
        }
      });
      this.markerObjects.forEach((marker) => {
        this.viewer.scene.remove(marker);
        if (marker.material) marker.material.dispose();
        if (marker.geometry) marker.geometry.dispose();
      });

      if(message == null) return

      this.markerSubsObjects = [];
      this.markerObjects = [];
      const colors = [
        new THREE.Color(1, 0, 0),
        new THREE.Color(1, 0.5, 0),
        new THREE.Color(1, 1, 0),
        new THREE.Color(0, 1, 0),
        new THREE.Color(0, 0, 1),
        new THREE.Color(0.29, 0, 0.51),
        new THREE.Color(0.56, 0, 1),
      ];
      message.obstacles.forEach((obstacle) => {
        const geometry = new THREE.BoxGeometry(
          obstacle.length,
          obstacle.width,
          obstacle.height
        );
        const edges = new THREE.EdgesGeometry(geometry);

        const colorIndex = obstacle.id % colors.length;
        const material = new THREE.MeshBasicMaterial({
          color: colors[colorIndex],
          opacity: 1,
          transparent: true,
        });
        const line = new THREE.LineSegments(edges, material);
        line.position.set(
          obstacle.position.x,
          obstacle.position.y,
          obstacle.position.z
        );

        this.viewer.scene.add(line);
        this.markerObjects.push(line);
        const positionAttribute = geometry.attributes.position;
        for (let i = 0; i < positionAttribute.count; i++) {
          const vertex = new THREE.Vector3();
          vertex.fromBufferAttribute(positionAttribute, i);
          const sphereGeometry = new THREE.SphereGeometry(0.05, 16, 16);
          const sphereMaterial = new THREE.MeshBasicMaterial({
            color: colors[colorIndex],
          });
          const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

          sphere.position.copy(vertex).add(line.position);
          this.viewer.scene.add(sphere);
          this.markerObjects.push(sphere);
        }
        if(flag){
          this.markerSubsObjects.push(
          Add2DLabelSpriteToMesh(
            this.labelRenderer,
            document.getElementById("viewer"),
            line,
            obstacle
          )
        );
        }
      });
    },

    cleanup() {
      if (this.currentPointCloud) {
        this.viewer.scene.remove(this.currentPointCloud);
        this.currentPointCloud.geometry.dispose();
        this.currentPointCloud.material.dispose();
      }
      if (this.viewer) {
        //this.viewer.renderer.forceContextLose();
        this.viewer.renderer.dispose();
        this.viewer = null;
      }
      if (this.ros) {
        this.ros.close();
      }
      if (this.controls) {
        this.controls.dispose();
      }
      this.markerObjects = [];
    },
  },
};
</script>

<style scoped>

@import "../css/input_slider.css";

.el_cls_obstacles_list {
  display: flex;
  flex-direction: column;
  width: 50%;
  position: absolute;
  top: 0;
  right: 0;
}
#viewer {
  flex: 1;
  width: 95vw;
  margin-left: 2.5vw;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 2.5vh;
  height: 83vh;
  position: relative;
  /* border: 1px solid red; */
}

</style>
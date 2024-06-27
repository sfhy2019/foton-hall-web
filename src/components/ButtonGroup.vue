<template>
  <div class="button-group">
    <router-link to="/image-detection" class="button">图像检测算法演示</router-link>
    <router-link to="/pointcloud-detection" class="button">点云检测算法演示</router-link>
    <router-link to="/fusion-algorithm" class="button">融合算法演示</router-link>
    <router-link to="/target-detection" class="button">目标检测算法体验</router-link>
  </div>
</template>

<style>
.button-group {
  height: 3vh;
  display: flex;
  justify-content: space-around;
  align-items: center;
  /* padding: 10px; */
}
.button {
  color: white;
  text-decoration: none;
  /* padding: 10px 20px; */
  position: relative;
  display: inline-block;
}
.button::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('/assets/button.png');
  background-size: contain;
  background-repeat: no-repeat;
  z-index: -1;
}
.button:hover {
  background-color: rgba(255, 255, 255, 0.1);
}
</style>

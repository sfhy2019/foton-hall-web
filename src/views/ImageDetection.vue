<template>
  <div class="video-container">
    <div class="video-ground">
      <img
        class="video-stream"
        :src="stream_url"
      />
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      stream_url:this.$ros_http_url + '/stream?topic=/front_view_camera/image_raw&width=1280&height=720&quality=70'
    };
  },
  mounted(){
    console.log(this.stream_url)
  },
  methods: {},
};
</script>
<style scoped>
.video-container {
  position: absolute;
  top: 10vh;
  left: 50%;
  height: 83vh;
  width: 83vw;
  transform: translateX(-50%);
  /* z-index: 10; */
}

.video-stream {
  width: 100%;
  height: 83vh;
}
.video-ground {
  background-image: url("assets/9.png");
  background-size: 100% 100%;
  /* z-index: 10; */
}
</style>

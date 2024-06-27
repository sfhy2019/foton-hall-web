<template>
  <div class="bottom-bg">
    <button
      :class="{
        'selected-lan-btn': lan_selected === index,
        'uns-lan-btn': lan_selected !== index,
      }"
      :style="{left: `${10 + index * 50}px` }"
      v-for="(item, index) in lanList"
      :key="index"
      @click="clickChangeLan(index)"
    >{{ item }}</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      lan_selected: 0,
      lanList:['中文','English']
    };
  },
  methods: {
    clickChangeLan(index){
      if(index == 0){
        this.$i18n.locale = "zh"
      }else if(index == 1){
        this.$i18n.locale = "en"
      }
      this.lan_selected = index
    }
  },
};
</script>

<style>
.bottom-bg {
  height: 6vh;
  display: flex;
  position: relative;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  background-image: url("assets/bottom.png");
  background-size: 100% 100%;
}

.uns-lan-btn {
  color: black;
  border: 0;
  margin-top: 2.5vh;
  padding:5px;
  border-radius: 5px;
  position: absolute;
  background: rgba(255, 255, 255, 0.75);
}
.selected-lan-btn {
  background: linear-gradient(to right, rgb(67, 67, 67), rgb(0, 0, 0));
  color: white;
  border: 1px solid white;
  margin-top: 2.5vh;
  padding:5px;
  border-radius: 5px;
  position: absolute;
}

</style>
  
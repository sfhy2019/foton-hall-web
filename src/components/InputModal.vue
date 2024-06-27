<template>
  <div v-if="show" class="modal-overlay" @click="close">
    <div class="modal" @click.stop>
      <div class="modal-header">
        <h3>{{ $t("InputModal.Title") }}</h3>
      </div>
      <div class="modal-body">
        <div class="tag_container">
          <div
            :class="{
              tag_item_se: choose_tag_index === index,
              tag_item_no: choose_tag_index !== index,
            }"
            v-for="(item, index) in default_tags"
            :key="index"
            @click="clickTagItem(index)"
          >
            {{ item }}
          </div>
        </div>
        <input
          v-model="inputValue"
          type="text"
          :placeholder="placeholder"
          class="input-box"
          maxlength="20"
        />
      </div>
      <div class="modal-footer">
        <button class="confirm_btn" @click="submit" :disabled="inputValue.length <= 0">
          {{ $t("InputModal.ConfirmTip") }}
        </button>
      </div>
    </div>
  </div>
</template>
  
  <script>
export default {
  props: {
    show: {
      type: Boolean,
      required: true,
    },
  },
  watch: {
    inputValue(value) {
      let hasSame = false;
      for (let i = 0; i < this.default_tags.length; i++) {
        let default_tag = this.default_tags[i];
        if (default_tag == value) {
          this.choose_tag_index = i;
          hasSame = true;
          break;
        }
      }
      if (!hasSame) {
        this.choose_tag_index = -1;
      }
    },
  },
  data() {
    return {
      inputValue: "默认",
      placeholder: this.$t("InputModal.Placeholder"),
      default_tags: ["默认", "手机", "桌子", "椅子", "人", "衣服", "背包"],
      choose_tag_index: 0,
    };
  },
  methods: {
    clickTagItem(index){
        this.inputValue = this.default_tags[index]
        this.choose_tag_index = index
    },
    close() {
      this.$emit("close");
    },
    submit() {
      this.$emit("submit", this.inputValue);
      this.close();
    },
  },
};
</script>
  
  <style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
}
.modal {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 300px;
  border: 5px solid #4c98af;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.modal-body {
  margin: 20px 0;
}
.modal-footer {
  display: flex;
  justify-content: flex-end;
}
.tag_container {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 20px;
}
.tag_item_no {
  border: 2px solid rgba(120, 117, 117, 0.434);
  border-radius: 5px;
  margin: 10px;
  padding: 10px;
  color: black;
  background-color: white;
  cursor: pointer; 
}
.tag_item_se {
  border: 2px solid #4c98af;
  border-radius: 5px;
  margin: 10px;
  padding: 10px;
  background-color: #4c98af;
  color: white;
  cursor: pointer; 
}
.input-box {
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
  border-radius: 5px;
}
.confirm_btn {
  background-color: #4c98af;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer; 
}
.confirm_btn:hover {
  /* 悬停时的 */
  background-color: #458fa0;
}

.confirm_btn:active {
  /* 点击时的 */
  background-color: #397785;
}

</style>
  
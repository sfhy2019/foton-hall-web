<template>
  <div
    style="
      display: flex;
      flex-direction: row;
      margin-top: 3.5vh;
      margin-bottom: 1.5vh;
    "
  >
    <div v-if="showMode" class="el_cls_operation_box">
      <div class="el_cls_op_box">
        <div
          style="
            display: flex;
            flex-direction: column;
            width: 40%;
            margin-left: 8%;
            margin-top: 2.5vh;
            height: 77%;
            position: relative;
          "
        >
          <canvas class="el_cls_preview_cut" id="el_id_preview_cut1"></canvas>
          <div
            v-if="cut_status == 0"
            @click="changeCutStatus"
            class="el_cls_op_button"
            :style="{
              pointerEvents:
                (cut_preview_data[0].img != null &&
                  cut_preview_data[1].img != null) ||
                train_progress != 0
                  ? 'none'
                  : 'auto',
              opacity:
                (cut_preview_data[0].img != null &&
                  cut_preview_data[1].img != null) ||
                train_progress != 0
                  ? '0.5'
                  : '1',
            }"
          >
            {{ $t("TargetDetection.ButtonCut") }}
          </div>
          <div
            v-if="cut_status == 1"
            @click="changeCutStatus"
            class="el_cls_op_button"
          >
            {{ $t("TargetDetection.ButtonPlay") }}
          </div>
          <div
            v-if="cut_preview_data[0].img != null"
            class="el_cls_btn_enhance"
            @click="enhancePreviewCut(0)"
          >
            {{ $t("TargetDetection.ButtonEnhance") }}
          </div>
          <div
            v-if="cut_preview_data[0].img != null"
            class="el_cls_close_btn"
            @click="deletePreviewCut(0)"
          >
            {{ $t("TargetDetection.ButtonDelete") }}
          </div>
        </div>
        <div
          style="
            display: flex;
            flex-direction: column;
            width: 40%;
            margin-left: 5%;
            margin-top: 2.5vh;
            height: 77%;
            position: relative;
          "
        >
          <canvas class="el_cls_preview_cut" id="el_id_preview_cut2"></canvas>
          <div
            @click="confirmCutedData"
            class="el_cls_op_button"
            :style="{
              pointerEvents:
                cut_preview_data[0].img != null &&
                cut_preview_data[1].img != null
                  ? 'auto'
                  : 'none',
              opacity:
                cut_preview_data[0].img != null &&
                cut_preview_data[1].img != null
                  ? '1'
                  : '0.5',
            }"
          >
            {{ $t("TargetDetection.ButtonConfirm") }}
          </div>
          <div
            v-if="cut_preview_data[1].img != null"
            class="el_cls_btn_enhance"
            @click="enhancePreviewCut(1)"
          >
            {{ $t("TargetDetection.ButtonEnhance") }}
          </div>
          <div
            v-if="cut_preview_data[1].img != null"
            class="el_cls_close_btn"
            @click="deletePreviewCut(1)"
          >
            {{ $t("TargetDetection.ButtonDelete") }}
          </div>
        </div>
      </div>
      <div class="el_cls_training_box">
        <div class="el_cls_train_tip">{{ train_tip_middle }}</div>
        <input
          v-if="train_progress > 0"
          class="el_cls_train_slider"
          type="range"
          id="el_id_train_slider"
          name="train_slider"
          min="0"
          step="0.01"
          max="1"
          :value="train_progress"
        />
        <div style="width: 35%; margin-left: 10%; margin-top: 7vh; height: 75%">
          <canvas class="el_cls_preview_cut" id="el_id_training_cut1"></canvas>
        </div>
        <div style="width: 35%; margin-left: 8%; margin-top: 7vh; height: 75%">
          <canvas class="el_cls_preview_cut" id="el_id_training_cut2"></canvas>
        </div>
        <!-- <div
          v-if="!hasTrainingImageData && train_progress != 0"
          class="el_cls_mid_tip"
        >
          {{ $t("TargetDetection.Tip3") }}
        </div> -->
      </div>
      <div class="el_cls_trained_box">
        <div class="el_cls_train_tip">{{ $t("TargetDetection.Tip2") }}</div>
        <div
          v-if="!infer_status"
          :style="{
            pointerEvents: can_click_infer ? 'auto' : 'none',
            opacity: can_click_infer ? '1' : '0.5',
          }"
          class="el_cls_inference_btn"
          @click="inferGo"
        >
          {{ $t("TargetDetection.ButtonInferenceStart") }}
        </div>
        <div v-if="infer_status" class="el_cls_inference_btn" @click="inferGo">
          {{ $t("TargetDetection.ButtonInferenceEnd") }}
        </div>
        <div
          style="
            display: flex;
            flex-direction: column;
            width: 35%;
            margin-left: 10%;
            margin-top: 6vh;
            height: 80%;
          "
        >
          <canvas class="el_cls_preview_cut" id="el_id_trained_cut1"></canvas>
        </div>
        <div
          style="
            display: flex;
            flex-direction: column;
            width: 35%;
            margin-left: 8%;
            margin-top: 6vh;
            height: 80%;
          "
        >
          <canvas class="el_cls_preview_cut" id="el_id_trained_cut2"></canvas>
        </div>
      </div>
    </div>
    <div
      class="el_cls_img_box"
      :style="{
        marginLeft: showMode ? '0' : '8vw',
      }"
      id="el_id_img_box"
    >
      <img
        ref="el_ref_big_img"
        class="el_cls_big_img"
        id="el_id_big_img"
        :src="big_img_src"
      />
      <div
        style="
          position: absolute;
          left: 0;
          top: 0;
          display: flex;
          flex-direction: row;
        "
      >
        <div
          @click="showMode = !showMode"
          style="color: white; border: 1px solid white; padding: 5px;cursor: pointer;background: linear-gradient(to right, rgb(67, 67, 67), rgb(0, 0, 0));"
        >
          Change Mode
        </div>
      </div>
      <canvas class="el_cls_empty_canvas" id="el_id_empty_canvas"></canvas>
      <div :hidden="!showMode" class="el_cls_small_img_box">
        <img
          ref="el_ref_small_img"
          class="el_cls_small_img"
          id="el_id_small_img"
          crossorigin=""
          :src="small_img_src"
        />
        <div class="el_cls_annotation_box" id="el_id_annotation_box"></div>
      </div>
    </div>
    <Modal
      ref="el_ref_em"
      :show="showEnhanceModal"
      @close="showEnhanceModal = false"
    ></Modal>
    <input-modal :show="inputModalShow" @close="inputModalShow = false" @submit="submitRequest"></input-modal>
  </div>
</template>

<script>
import Annotation2DHandler from "../js/Annotation2DHandler";
import ROSLIB from "roslib/src/RosLib";
import { base64ToUint8Array } from "../js/utils";
import Modal from "../components/Modal.vue";
import InputModal from "../components/InputModal.vue";

const stream_quality = 50;
const stream_width = 1920;
const stream_height = 1080;

export default {
  name: "TargetDetection",
  data() {
    return {
      //
      showMode: true,
      //infer
      infer_status: false,
      can_click_infer: false,
      //
      ros: null,
      //Annotation2DHandler对象
      a2dh: null,
      //
      r_img_listner: null,
      r_2dbox_listner: null,
      r_train_listner: null,

      //**时间戳对齐 */
      img_message_queue_buffer: [], //队列，用于缓存image_message
      //**时间戳对齐 */

      //裁剪框相关变量
      cut_status: 0, //0：正常状态  1：裁剪状态
      //图像原始尺寸记录，用于比例转换
      r_img_width: 1920,
      r_img_height: 1080,
      //裁剪预览图片数组，默认两个
      cut_preview_data: [
        { img: null, box: null },
        { img: null, box: null },
      ],
      //训练进度 0：无训练任务  1：训练完毕
      train_progress: 0,
      //最近一帧的图像message
      last_img_message: null,
      //裁剪时的图像message
      cut_moment_message: null,
      // //
      // hasTrainingImageData: false,
      // //
      // hasTrainedImageData: false,

      //
      big_img_src:
        this.$ros_http_url +
        "/stream?topic=/front_view_camera/image_raw&inter-topic=/interact_results&dect-topic=/pred_results&quality=" +
        stream_quality,
      small_img_src:
        this.$ros_http_url +
        "/stream?topic=/front_view_camera/image_raw&width=1920&height=1080&quality=" +
        stream_quality,

      //
      enhanceImg: null,
      showEnhanceModal: false,

      //上一个操作的裁剪二图之一的索引，0是第一个，1是第二个
      lastIndex: 0,

      //
      train_tip_middle: this.$t("TargetDetection.Tip7"),

      //
      inputModalShow: false
    };
  },
  computed: {},
  watch: {
    infer_status(value) {
      let result = 0;
      if (value) {
        result = 1;
      }
      let formData = new FormData();
      formData.append("start", result);
      const response = fetch(this.$ros_http1_url + "/start_infer", {
        method: "POST",
        body: formData,
      });
      if (value == 0) {
        this.can_click_infer = false;
        const el_trained_cut_one =
          document.getElementById("el_id_trained_cut1");
        const el_trained_cut_two =
          document.getElementById("el_id_trained_cut2");
        el_trained_cut_one
          .getContext("2d")
          .clearRect(0, 0, el_trained_cut_one.width, el_trained_cut_one.height);
        el_id_trained_cut2
          .getContext("2d")
          .clearRect(0, 0, el_id_trained_cut2.width, el_id_trained_cut2.height);
      }
    },
    cut_status(value) {
      if (value == 0) {
        console.log("恢复正常状态---");
        this.small_img_src =
          this.$ros_http_url +
          "/stream?topic=/front_view_camera/image_raw&width=1920&height=1080&quality=" +
          stream_quality;
        this.a2dh.stopListner();
      } else {
        console.log("裁剪开始---");
        this.small_img_src =
          this.$ros_http_url +
          "/snapshot?topic=/front_view_camera/image_raw&quality=" +
          stream_quality;
        this.cut_moment_message = this.last_img_message;
        this.a2dh.restartListner();
      }
    },
    train_progress(value) {
      console.log(value);
      if (value <= 0) {
        this.train_tip_middle = this.$t("TargetDetection.Tip7");
      } else if (value > 0 && value < 0.33) {
        this.train_tip_middle = this.$t("TargetDetection.Tip5");
      } else if (value >= 0.33 && value < 0.66) {
        this.train_tip_middle = this.$t("TargetDetection.Tip1");
      } else if (value >= 0.66 && value < 0.9) {
        this.train_tip_middle = this.$t("TargetDetection.Tip8");
      } else if (value >= 0.9) {
        console.log("enter");
        this.train_tip_middle = this.$t("TargetDetection.Tip9");
      }

      if (value > 0.96) {
        //训练100%
        //1.那两个图片推到训练完毕
        const source_canvas_1 = document.getElementById("el_id_training_cut1");
        const source_canvas_2 = document.getElementById("el_id_training_cut2");
        const target_ctx_1 = document
          .getElementById("el_id_trained_cut1")
          .getContext("2d");
        const target_ctx_2 = document
          .getElementById("el_id_trained_cut2")
          .getContext("2d");
        target_ctx_1.drawImage(source_canvas_1, 0, 0);
        target_ctx_2.drawImage(source_canvas_2, 0, 0);
        this.can_click_infer = true;
        //2.删除训练中区域内的的预览
        const el_training_cut_one = document.getElementById(
          "el_id_training_cut1"
        );
        const el_training_cut_two = document.getElementById(
          "el_id_training_cut2"
        );
        el_training_cut_one
          .getContext("2d")
          .clearRect(
            0,
            0,
            el_training_cut_one.width,
            el_training_cut_one.height
          );
        el_training_cut_two
          .getContext("2d")
          .clearRect(
            0,
            0,
            el_training_cut_two.width,
            el_training_cut_two.height
          );

        // //
        // this.hasTrainingImageData = false
        // //
        // this.hasTrainedImageData = true
      }
    },
  },
  components: {
    Modal,
    InputModal,
  },
  methods: {
    ros_subscribe() {
      const THIS = this;
      this.ros = new ROSLIB.Ros({
        url: THIS.$ros_socket_url,
      });
      this.r_train_listner = new ROSLIB.Topic({
        ros: this.ros,
        name: "/progress",
        messageType: "std_msgs/Float32",
      });
      this.r_train_listner.subscribe(function (message) {
        console.log(message);
        THIS.train_progress = message.data;
      });
      // const THIS = this;
      // this.ros = new ROSLIB.Ros({
      //   url: THIS.$ros_socket_url,
      // });
      // this.r_img_listner = new ROSLIB.Topic({
      //   ros: this.ros,
      //   name: "/image_raw",
      //   messageType: "sensor_msgs/Image",
      // });
      // this.r_2dbox_listner = new ROSLIB.Topic({
      //   ros: this.ros,
      //   name: "/ped_results",
      //   messageType: "interact_interfaces/InteractOutput",
      // });
      // //rawImage话题message
      // this.r_img_listner.subscribe(function (message) {
      //   THIS.last_img_message = message;
      //   THIS.r_img_width = message.width;
      //   THIS.r_img_height = message.height;
      //   //
      //   THIS.img_message_queue_buffer.push(message);
      //   //
      //   THIS.drawImageToCanvas(
      //     message,
      //     document.getElementById("el_id_big_img")
      //   );
      //   if (THIS.cut_status) return;
      //   THIS.drawImageToCanvas(
      //     message,
      //     document.getElementById("el_id_small_img")
      //   );
      // });
      // //行人检测输出话题message
      // this.r_2dbox_listner.subscribe(function (message) {
      //   console.log(message);
      //   // //2d框
      //   // if (boxes.length > 0) {
      //   //   for (let element in document.getElementById("el_id_img_box")
      //   //     .childNodes) {
      //   //     if (element.className == "el_cls_2d_label_box") {
      //   //       element.remove();
      //   //     }
      //   //   }
      //   //   for (let box_info in boxes) {
      //   //     let el_box = document.createElement("div");
      //   //     el_box.style.position = "absolute";
      //   //     el_box.style.border = "1px solid red";
      //   //     el_box.style.zIndex = "1";
      //   //     el_box.style.left = "0";
      //   //     el_box.style.bottom = "0";
      //   //     el_box.style.width = "500px";
      //   //     el_box.style.height = "500px";
      //   //     el_box.className = "el_cls_2d_label_box";
      //   //     document.getElementById("el_id_img_box").appendChild(el_box);
      //   //   }
      //   // }
      // });
    },
    ros_unsubscribe() {
      // if (this.r_img_listner) this.r_img_listner.unsubscribe();
      // if (this.r_2dbox_listner) this.r_2dbox_listner.unsubscribe();
      if (this.r_train_listner) this.r_train_listner.unsubscribe();
    },
    inferGo() {
      this.infer_status = !this.infer_status;
    },
    drawImageToCanvas(message, canvas) {
      //原图
      const context = canvas.getContext("2d", { willReadFrequently: true });
      const uint8Array = base64ToUint8Array(message.data);
      const imageData = context.createImageData(message.width, message.height);
      const step = message.step;
      const isBigEndian = message.is_bigendian;
      for (let y = 0; y < message.height; y++) {
        for (let x = 0; x < message.width; x++) {
          const index = y * step + x * 3;
          const canvasIndex = (y * message.width + x) * 4;

          if (isBigEndian) {
            imageData.data[canvasIndex] = uint8Array[index + 1]; // R
            imageData.data[canvasIndex + 1] = uint8Array[index + 2]; // G
            imageData.data[canvasIndex + 2] = uint8Array[index + 3]; // B
          } else {
            imageData.data[canvasIndex] = uint8Array[index]; // R
            imageData.data[canvasIndex + 1] = uint8Array[index + 1]; // G
            imageData.data[canvasIndex + 2] = uint8Array[index + 2]; // B
          }
          imageData.data[canvasIndex + 3] = 255; // A
        }
      }
      context.clearRect(0, 0, canvas.width, canvas.height);
      canvas.width = message.width;
      canvas.height = message.height;
      context.putImageData(imageData, 0, 0);
    },
    changeCutStatus() {
      if (this.cut_status == 1) {
        this.cut_status = 0;
      } else {
        this.cut_status = 1;
      }
    },
    //抬手回调
    async cutUpCallback(isNew) {
      const el_small_img = document.getElementById("el_id_small_img");
      const el_annotation = document.getElementById("el_id_annotation_box");

      const scale_x = el_small_img.offsetWidth / this.r_img_width;
      const scale_y = el_small_img.offsetHeight / this.r_img_height;

      const sx = el_annotation.offsetLeft / scale_x;
      const sy = el_annotation.offsetTop / scale_y;
      const sWidth = el_annotation.offsetWidth / scale_x;
      const sHeight = el_annotation.offsetHeight / scale_y;

      if (isNew) {
        let el_cuted_one = null;
        for (let i = 0; i < this.cut_preview_data.length; i++) {
          let dataObj = this.cut_preview_data[i];
          if (i == 0 && dataObj.img == null) {
            el_cuted_one = document.getElementById("el_id_preview_cut1");
            this.cut_preview_data[i].img =
              await this.getCurrentFrameImageBLob();
            this.cut_preview_data[i].box = {
              x: sx,
              y: sy,
              w: sWidth,
              h: sHeight,
            };
            this.lastIndex = 0;
            break;
          } else if (i == 1 && dataObj.img == null) {
            el_cuted_one = document.getElementById("el_id_preview_cut2");
            this.cut_preview_data[i].img =
              await this.getCurrentFrameImageBLob();
            this.cut_preview_data[i].box = {
              x: sx,
              y: sy,
              w: sWidth,
              h: sHeight,
            };
            this.lastIndex = 1;
            break;
          }
        }
        if (el_cuted_one == null) return;

        const cuted_one_context = el_cuted_one.getContext("2d", {
          willReadFrequently: true,
        });
        //清canvas
        cuted_one_context.clearRect(
          0,
          0,
          el_cuted_one.width,
          el_cuted_one.height
        );
        cuted_one_context.drawImage(
          el_small_img,
          sx,
          sy,
          sWidth,
          sHeight,
          0,
          0,
          el_cuted_one.width,
          el_cuted_one.height
        );
      } else {
        const el_cuted_one = document.getElementById(
          "el_id_preview_cut" + (this.lastIndex + 1).toString()
        );
        const cuted_one_context = el_cuted_one.getContext("2d", {
          willReadFrequently: true,
        });
        this.cut_preview_data[this.lastIndex].img =
          await this.getCurrentFrameImageBLob();
        this.cut_preview_data[this.lastIndex].box = {
          x: sx,
          y: sy,
          w: sWidth,
          h: sHeight,
        };
        //清canvas
        cuted_one_context.clearRect(
          0,
          0,
          el_cuted_one.width,
          el_cuted_one.height
        );
        cuted_one_context.drawImage(
          el_small_img,
          sx,
          sy,
          sWidth,
          sHeight,
          0,
          0,
          el_cuted_one.width,
          el_cuted_one.height
        );
      }
    },
    async getCurrentFrameImageBLob() {
      return new Promise((resolve) => {
        let el_small_img = document.getElementById("el_id_small_img");
        const temp_canvas = document.getElementById("el_id_empty_canvas");
        temp_canvas.width = stream_width;
        temp_canvas.height = stream_height;
        const ctx = temp_canvas.getContext("2d", {
          willReadFrequently: true,
        });
        ctx.drawImage(el_small_img, 0, 0);
        temp_canvas.toBlob((blob) => {
          resolve(blob);
        }, "image/jpeg");
      });
    },
    // getCurrentFrameBGR8ImageData() {
    //   let el_small_img = document.getElementById("el_id_small_img");
    //   let temp_canvas = document.getElementById("el_id_empty_canvas");
    //   let canvas_ctx = temp_canvas.getContext("2d", {
    //     willReadFrequently: true,
    //   });
    //   temp_canvas.width = stream_width;
    //   temp_canvas.height = stream_height;
    //   canvas_ctx.drawImage(
    //     el_small_img,
    //     0,
    //     0,
    //     stream_width,
    //     stream_height,
    //     0,
    //     0,
    //     temp_canvas.width,
    //     temp_canvas.height
    //   );
    //   const imageData = canvas_ctx.getImageData(
    //     0,
    //     0,
    //     temp_canvas.width,
    //     temp_canvas.height
    //   );
    //   const pixels = imageData.data;
    //   // 转换图像数据为BGR8格式
    //   let bgr8Data = [];
    //   for (var i = 0; i < pixels.length; i += 4) {
    //     var r = pixels[i];
    //     var g = pixels[i + 1];
    //     var b = pixels[i + 2];
    //     // 蓝、绿、红
    //     bgr8Data.push(b, g, r);
    //   }
    //   return bgr8Data;
    // },
    async confirmCutedData() {
      console.log("confirm..");

      this.inputModalShow = true
    },
    async submitRequest(tagName){

      console.log(tagName)
      
      let cut_preview_obj_1 = this.cut_preview_data[0];
      let cut_preview_obj_2 = this.cut_preview_data[1];
      let formData = new FormData();
      formData.append("image1", cut_preview_obj_1.img);
      formData.append("image2", cut_preview_obj_2.img);
      formData.append("xmin1", parseInt(cut_preview_obj_1.box.x));
      formData.append("ymin1", parseInt(cut_preview_obj_1.box.y));
      formData.append(
        "xmax1",
        parseInt(cut_preview_obj_1.box.x) + parseInt(cut_preview_obj_1.box.w)
      );
      formData.append(
        "ymax1",
        parseInt(cut_preview_obj_1.box.y) + parseInt(cut_preview_obj_1.box.h)
      );
      formData.append("xmin2", parseInt(cut_preview_obj_2.box.x));
      formData.append("ymin2", parseInt(cut_preview_obj_2.box.y));
      formData.append(
        "xmax2",
        parseInt(cut_preview_obj_2.box.x) + parseInt(cut_preview_obj_2.box.w)
      );
      formData.append(
        "ymax2",
        parseInt(cut_preview_obj_2.box.y) + parseInt(cut_preview_obj_2.box.h)
      );

      //这里先不await了
      const response = fetch(this.$ros_http1_url + "/train", {
        method: "POST",
        body: formData,
      });

      // if (response.ok) {
      //   const result = await response.json();
      //   alert(result.message);
      // } else {
      //   const result = await response.json();
      //   alert(result.message);
      // }

      //1.裁剪结束，回归播放状态
      this.a2dh.resetDragBox(false);
      this.cut_status = 0;
      //2.那两个图片推到训练中
      const source_canvas_1 = document.getElementById("el_id_preview_cut1");
      const source_canvas_2 = document.getElementById("el_id_preview_cut2");
      const source_ctx_1 = source_canvas_1.getContext("2d");
      const target_ctx_1 = document
        .getElementById("el_id_training_cut1")
        .getContext("2d");
      const target_ctx_2 = document
        .getElementById("el_id_training_cut2")
        .getContext("2d");
      target_ctx_1.drawImage(source_canvas_1, 0, 0);
      target_ctx_2.drawImage(source_canvas_2, 0, 0);
      //3.删除裁剪区的预览
      this.deletePreviewCut(0);
      this.deletePreviewCut(1);
    },
    deletePreviewCut(index) {
      const element_id = "el_id_preview_cut" + (index + 1).toString();
      const el_cuted_one = document.getElementById(element_id);
      el_cuted_one
        .getContext("2d", { willReadFrequently: true })
        .clearRect(0, 0, el_cuted_one.width, el_cuted_one.height);
      this.cut_preview_data[index].img = null;
      this.cut_preview_data[index].box = null;
    },
    enhancePreviewCut(index) {
      const element_id = "el_id_preview_cut" + (index + 1).toString();
      const el_cuted_one = document.getElementById(element_id);

      this.showEnhanceModal = true;
      this.$refs.el_ref_em.reloadOtherImageFromCanvas(el_cuted_one);
    },
    cutOverCallback() {
      // 裁剪图片够2张了自动转至继续播放状态.
      if (
        this.cut_preview_data[0].img != null &&
        this.cut_preview_data[1].img != null
      ) {
        this.a2dh.resetDragBox(false);
        this.cut_status = 0;
      }
    },
  },

  mounted() {
    //测试Annotation2DHandler功能模块，绑定el_id_annotation_box元素
    this.a2dh = new Annotation2DHandler(
      "el_id_annotation_box",
      this.cutUpCallback,
      false,
      this.cutOverCallback
    );
    this.a2dh.stopListner();
    //
    this.ros_subscribe();
  },

  beforeUnmount() {
    this.ros_unsubscribe();
  },
};
</script>

  
<style scoped>
.el_cls_img_box {
  margin-left: 0px;
  width: calc((1920 / 1080) * 83vh);
  height: 83vh;
  position: relative;
}
.el_cls_big_img {
  width: 100%;
  height: 100%;
  border: 0;
  border-style: none;
  position: relative;
}
.el_cls_small_img_box {
  width: 30%;
  height: 30%;
  position: absolute;
  left: 0;
  bottom: 0;
  border-top: 2px solid rgb(28, 69, 92);
  border-right: 2px solid rgb(28, 69, 92);
}
.el_cls_small_img {
  width: 100%;
  height: 100%;
}
.el_cls_annotation_box {
  position: absolute; /* 相对于父容器绝对定位 */
  top: 0;
  left: 0;
  width: 0; /* 使 div 宽度与图片相同 */
  height: 0; /* 使 div 高度与图片相同 */
  background-color: rgba(
    255,
    0,
    0,
    0.1
  ); /* 设置 div 的背景颜色，这里是半透明的红色 */
  /* z-index: 99; 确保 div 处于图片之上 */
  visibility: hidden;
}
.el_cls_operation_box {
  flex: 1;
  height: 83vh;
  display: flex;
  flex-direction: column-reverse;
}

.el_cls_op_box {
  width: 90%;
  margin-left: 5%;
  height: calc(0.25 * 83vh);
  margin-bottom: calc(0.0625 * 83vh);
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
  background-image: url("/assets/11.png");
  display: flex;
  flex-direction: row;
}

.el_cls_train_tip {
  text-align: left;
  width: 60%;
  padding: 0px;
  position: absolute;
  color: white;
  margin-top: 1.75vh;
  margin-left: 1.5vw;
}

.el_cls_inference_btn {
  text-align: left;
  padding: 5px;
  position: absolute;
  color: white;
  right: 2vw;
  border: 2px solid white;
  border-radius: 5px;
  background: rgb(28, 89, 92);
  cursor: pointer; 
}

.el_cls_train_slider {
  margin-left: 10%;
  width: 76.5%;
  padding: 5px;
  position: absolute;
  margin-top: 4.25vh;
  pointer-events: none;
}

.el_cls_training_box {
  width: 90%;
  margin-left: 5%;
  margin-bottom: calc(0.0625 * 83vh);
  height: calc(0.25 * 83vh);
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
  background-image: url("/assets/training_bg2.png");
  display: flex;
  flex-direction: row;
  position: relative;
}

.el_cls_mid_tip {
  position: absolute;
  width: 100%;
  top: 15%;
  height: 85%;
  display: grid;
  place-items: center;
  color: rgba(0, 255, 0, 0.8);
  font-size: 2vw;
}

.el_cls_trained_box {
  width: 90%;
  margin-left: 5%;
  margin-bottom: calc(0.0625 * 83vh);
  height: calc(0.25 * 83vh);
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
  background-image: url("/assets/training_bg.png");
  display: flex;
  flex-direction: row;
  position: relative;
}

.el_cls_op_button {
  width: 100%;
  margin-top: 7.5%;
  flex: 1;
  border: 0;
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: url("/assets/button2.png");
  cursor: pointer; 
}
.el_cls_preview_cut {
  width: 100%;
  height: 70%;
  border: 1px dashed rgb(28, 89, 92);
}

.el_cls_btn_enhance {
  position: absolute;
  left: 5%;
  top: 2.5%;
  color: white;
}

.el_cls_close_btn {
  position: absolute;
  right: 5%;
  top: 2.5%;
  color: white;
}

.el_cls_empty_canvas {
  position: absolute;
  z-index: 999;
  width: 100%;
  height: 100%;
  left: 0;
  display: none;
}
</style>
  
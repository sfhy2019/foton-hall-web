<template>
  <div v-if="show == true" class="modal-overlay" @click="closeModal">
    <div class="modal" @click.stop>
      <div class="title-bg">
        <h2 class="title-text">数据增强</h2>
      </div>
      <div class="image-container">
        <div class="image-area">
          <h3>原始图片</h3>
          <img :src="leftImage" alt="左侧图片" v-if="leftImage" />
        </div>
        <div class="image-area">
          <h3>处理图片</h3>
          <img :src="rightImage" alt="右侧图片" v-if="rightImage" />
        </div>
      </div>
      <div class="button-container">
        <div class="button-row">
          <button @click="openFile">打开文件</button>
          <button @click="applyGaussianBlur" :disabled="!leftImage">
            高斯模糊
          </button>
          <button @click="rotateImage('clockwise')" :disabled="!leftImage">
            顺时针旋转
          </button>
          <button
            @click="rotateImage('counterclockwise')"
            :disabled="!leftImage"
          >
            逆时针旋转
          </button>
        </div>
        <div class="button-row">
          <button @click="convertToGrayscale" :disabled="!leftImage">
            灰度处理
          </button>
          <button @click="addNoise" :disabled="!leftImage">添加噪声</button>
          <button @click="applyWhiteBalance" :disabled="!leftImage">
            白平衡
          </button>
          <button @click="closeModal">关闭</button>
        </div>
      </div>

      <canvas ref="canvas" style="display: none"></canvas>
    </div>
  </div>
</template>


<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}
.modal {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}
.title-bg {
  background: url("assets/button.png") no-repeat center center;
  background-size: 50% 100%;
  height: 100px;
  color: #f6f6f6;
  position: relative;
}
.title-text {
  margin: 0;
  font-size: 1.5em;
  text-align: center;
  position: absolute; /* 使用绝对定位 */
  top: 50%; /* 垂直居中 */
  left: 50%; /* 水平居中 */
  transform: translate(-50%, -100%);
}
.image-container {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}
.image-area {
  width: 45%;
  text-align: center;
}
.image-area img {
  max-width: 100%;
  max-height: 300px;
}
.button-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  background: url("assets/22x.png") no-repeat center center;
  background-size: 100% 100%;
  padding: 20px;
  /* border-radius: 8px; */
}
.button-row button {
  background: #2d5cf6;
  color: #f6f6f6;
  border: 1px solid #e9e7e7;
  border-radius: 10px; /* 按钮圆角 */
  padding: 10px 20px; /* 按钮内边距 */
  margin: 10px 10px 10px 10px;
  width: 125px;
}
</style>
<script>
export default {
  props: {
    show: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      leftImage: null,
      rightImage: null,
      currentImage: null,
      originalWidth: 0,
      originalHeight: 0,
    };
  },
  methods: {
    closeModal() {
      this.$emit("close");
    },
    openFile() {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            this.originalWidth = img.width;
            this.originalHeight = img.height;
            this.leftImage = event.target.result;
            this.rightImage = null; // 选择新图片时清空右侧图像
            this.currentImage = event.target.result; // 初始化currentImage为原图
          };
          img.src = event.target.result;
        };
        reader.readAsDataURL(file);
      };
      input.click();
    },
    applyGaussianBlur() {
      this.processImage((ctx, canvas) => {
        ctx.filter = "blur(5px)";
        ctx.drawImage(this.$refs.canvas, 0, 0, canvas.width, canvas.height);
      }, this.leftImage); // 基于原图进行处理
    },
    rotateImage(direction) {
      const canvas = this.$refs.canvas;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      const angle = direction === "clockwise" ? 90 : -90;
      const radian = (angle * Math.PI) / 180;

      // 创建新的图像对象
      const img = new Image();
      img.src = this.currentImage || this.leftImage;

      img.onload = () => {
        canvas.width = this.originalWidth;
        canvas.height = this.originalHeight;
        // 清空画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 保存当前的canvas状态
        ctx.save();

        // 移动到中心点进行旋转
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(radian);

        // 根据旋转角度调整绘制区域的大小
        if (angle === 90 || angle === -90) {
          ctx.drawImage(
            img,
            -canvas.height / 2,
            -canvas.width / 2,
            canvas.height,
            canvas.width
          );
        } else {
          ctx.drawImage(
            img,
            -canvas.width / 2,
            -canvas.height / 2,
            canvas.width,
            canvas.height
          );
        }

        // 恢复Canvas状态
        ctx.restore();

        // 更新右侧图像
        this.rightImage = canvas.toDataURL();
        this.currentImage = this.rightImage; // 更新currentImage为旋转后的图像
      };
    },
    convertToGrayscale() {
      this.processImage((ctx, canvas) => {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          data[i] = avg;
          data[i + 1] = avg;
          data[i + 2] = avg;
        }
        ctx.putImageData(imageData, 0, 0);
      }, this.leftImage); // 基于原图进行处理
    },
    addNoise() {
      this.processImage((ctx, canvas) => {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          const rand = (Math.random() - 0.5) * 50;
          data[i] = data[i] + rand; // R channel
          data[i + 1] = data[i + 1] + rand; // G channel
          data[i + 2] = data[i + 2] + rand; // B channel
        }
        ctx.putImageData(imageData, 0, 0);
      }, this.leftImage); // 基于原图进行处理
    },
    applyWhiteBalance() {
      this.processImage((ctx, canvas) => {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        let rSum = 0,
          gSum = 0,
          bSum = 0,
          count = 0;

        // 计算每个通道的平均值
        for (let i = 0; i < data.length; i += 4) {
          rSum += data[i];
          gSum += data[i + 1];
          bSum += data[i + 2];
          count++;
        }

        const rAvg = rSum / count;
        const gAvg = gSum / count;
        const bAvg = bSum / count;

        // 应用白平衡
        const grayAvg = (rAvg + gAvg + bAvg) / 3;
        const rGain = grayAvg / rAvg;
        const gGain = grayAvg / gAvg;
        const bGain = grayAvg / bAvg;

        for (let i = 0; i < data.length; i += 4) {
          data[i] = data[i] * rGain;
          data[i + 1] = data[i + 1] * gGain;
          data[i + 2] = data[i + 2] * bGain;
        }

        ctx.putImageData(imageData, 0, 0);
      }, this.leftImage); // 基于原图进行处理
    },
    processImage(callback, srcImage) {
      const canvas = this.$refs.canvas;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      const img = new Image();
      img.src = srcImage; // 使用传入的图像源
      img.onload = () => {
        // 将Canvas的尺寸设置为原始图像的大小
        canvas.width = this.originalWidth;
        canvas.height = this.originalHeight;
        ctx.clearRect(0, 0, canvas.width, canvas.height); // 清空画布
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        callback(ctx, canvas);
        this.rightImage = canvas.toDataURL();
        this.currentImage = this.rightImage; // 更新currentImage为处理后的图像
      };
    },
    reloadOtherImageFromCanvas(canvas) {
        const srcImageDataURL = canvas.toDataURL()
        this.originalWidth = canvas.width;
        this.originalHeight = canvas.height;
        this.leftImage = srcImageDataURL;
        this.rightImage = null; 
        this.currentImage = srcImageDataURL; 
    },
  },
};
</script>
















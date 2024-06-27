import { createApp } from 'vue';
import App from './App.vue';
import { createRouter, createWebHistory } from 'vue-router';
import ImageDetection from './views/ImageDetection.vue';
import PointCloudDetection from './views/PointCloudDetection.vue';
import FusionAlgorithm from './views/FusionAlgorithm.vue';
import TargetDetection from './views/TargetDetection.vue';
import Login from './components/Login.vue';
import PadView from './views/PadView.vue'
import { createI18n } from 'vue-i18n'

//路由
const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login},
  { path: '/image-detection', component: ImageDetection },
  { path: '/pointcloud-detection', component: PointCloudDetection },
  { path: '/fusion-algorithm', component: FusionAlgorithm },
  { path: '/target-detection', component: TargetDetection },
  { path: '/pad-view', component: PadView}
];
const router = createRouter({
  history: createWebHistory(),
  routes,
});

//国际化字典
const i18n = createI18n({
  locale: 'zh',
  fallbackLocale: 'zh',
  messages: {
    en: {
      Login:{
        Title: 'Foton Perception Ability Demonstration System',
        Username: 'Un',
        Password: 'Pw',
        Placeholder1: 'Enter your username',
        Placeholder2: 'Enter your password',
        Button1: 'Login',
        Tip1:'Incorrect username or password'
      },
      Header:{
        Title0: 'Foton Autonomous Driving Perception Demonstration System',
        Title1: 'Image Detection',
        Title2: 'Point cloud Detection',
        Title3: 'Fusion Algorithm',
        Title4: 'Target Detection',
      },
      TargetDetection:{
        ButtonCut: 'Crop target',
        ButtonPlay: 'Play',
        ButtonConfirm : 'Confirm',
        ButtonEnhance : 'Enhance',
        ButtonDelete: 'Delete',
        ButtonInferenceStart: 'InferStart',
        ButtonInferenceEnd:'InferEnd',
        Tip1: 'Traning',
        Tip2: 'Train Finished',
        Tip3: 'Pad end occupation',
        Tip4: 'TV end occupation',
        Tip5: 'Data argumenting',
        Tip6: 'Training finished',
        Tip7: 'Training Waiting',
        Tip8: 'Model generating',
        Tip9: 'Model generated'
      },
      Buttons:{
        Button1: 'Front View',
        Button2: 'Top View',
        Button3: 'Side View',
        Button4: 'Origin Mode',
        Button5: 'Detection Mode',
        Button6: 'Tracking Mode'
      },
      PointCloud:{
        Tag0: 'Cockpit'
      },
      InputModal:{
        Title: 'Please choose a tag',
        Placeholder : 'Enter a tag (Up to 20 characters)',
        ConfirmTip : 'Confirm'
      }
    },
    zh: {
      Login:{
        Title: '福田感知能力演示系统',
        Username: '账号',
        Password: '密码',
        Placeholder1: '请输入账号',
        Placeholder2: '请输入密码',
        Button1: '登录',
        Tip1:'错误的用户名或密码'
      },
      Header:{
        Title0: '福田自动驾驶感知能力演示系统',
        Title1: '图像检测',
        Title2: '点云检测',
        Title3: '融合算法',
        Title4: '目标检测',
      },
      TargetDetection:{
        ButtonCut: '裁剪目标',
        ButtonPlay: '播放',
        ButtonConfirm : '提交',
        ButtonEnhance : '增强',
        ButtonDelete: '删除',
        ButtonInferenceStart: '开始推理',
        ButtonInferenceEnd:'结束推理',
        Tip1: '训练中',
        Tip2: '训练完成',
        Tip3: 'Pad端占用',
        Tip4: '大屏端占用',
        Tip5: '数据增强中',
        Tip6: '训练结束',
        Tip7: '待训练',
        Tip8: '模型生成中',
        Tip9: '模型生成完毕'
      },
      Buttons:{
        Button1: '正视图',
        Button2: '俯视图',
        Button3: '侧视图',
        Button4: '点云模式',
        Button5: '检测模式',
        Button6: '增强优化'
      },
      PointCloud:{
        Tag0: '座舱'
      },
      InputModal:{
        Title: '请选择标签',
        Placeholder : '请输入标签内容(最多20个字符)',
        ConfirmTip : '确认'
      }
    }
  }
})

//
const app = createApp(App).use(router)
app.use(i18n)

//全局变量
app.config.globalProperties.$ros_socket_url = "ws://localhost:9090"
app.config.globalProperties.$ros_http_url = "http://localhost:8080"
app.config.globalProperties.$ros_http1_url = "http://localhost:8000"

//挂载
app.mount('#app');
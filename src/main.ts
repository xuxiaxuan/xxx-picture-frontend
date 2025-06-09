import "ant-design-vue/dist/reset.css";
import '@/access'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import "element-plus/dist/index.css";

import VueCropper from "vue-cropper";
import Antd from "ant-design-vue";
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(Antd);
app.use(createPinia())
app.use(router)
app.use(VueCropper)
app.use(ElementPlus)

app.mount('#app')







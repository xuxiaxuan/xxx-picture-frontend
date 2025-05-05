<template>
  <a-config-provider :locale="locale">
    <div id="basicLayout">
      <a-layout style="min-height: 100vh">
        <a-layout-header class="header">
          <GlobalHeader />
        </a-layout-header>
        <a-layout-content class="content">
          <router-view />
        </a-layout-content>
        <a-layout-footer class="footer">
          <a href="https://www.codefather.cn" target="_blank"> 编程导航 by 程序员小轩 </a>
        </a-layout-footer>
      </a-layout>
    </div>
  </a-config-provider>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import enUS from 'ant-design-vue/es/locale/en_US'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import 'dayjs/locale/en'
import GlobalHeader from '../components/GlobalHeader.vue'
// 设置默认语言
const locale = ref(zhCN)
dayjs.locale('zh-cn')
</script>

<style scoped>
#basicLayout .footer {
  background: #efefef;
  padding: 16px;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  text-align: center;
}
#basicLayout .content {
  background: linear-gradient(to right, #fefefe, #fff);
  margin-bottom: 28px;
  padding: 20px;
}
#basicLayout .header {
  padding-inline: 20px;
  margin-bottom: 16px;
  color: unset;
  background: white;
}
</style>

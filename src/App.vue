<template>
  <div>
    <BasicLayout></BasicLayout>
 </div>
</template>

<script setup lang="ts">
import { healthUsingGet } from './api/mainController';
import BasicLayout from './layouts/BasicLayout.vue';
import { useLoginUserStore } from './stores/useLoginUserStore';

const loginUserStore = useLoginUserStore()
loginUserStore.fetchLoginUser()


healthUsingGet().then((res) => {
  console.log(res);
});
</script>


<style scoped>

</style>

<template>
  <div class="window-title" v-if="!state.IsUseSysTitle && !state.IsWeb">
    <span v-if="!state.isNotMac" style="width:70px"></span>
    <span v-else style="width:10px"></span>
    <div class="flex justify-center items-center">
      <span>{{ name}}</span>
      <a-tag class="ml-3" color="blue" size="small"><span  class="text-xs">v{{version}}</span></a-tag>
    </div>
    <div style="-webkit-app-region: drag;" class="title"></div>
    <div class="controls-container" v-if="state.isNotMac">
      <div class="windows-icon-bg" @click="Mini">
        <svg-icon icon-class="mini" class-name="icon-size"></svg-icon>
      </div>
      <div class="windows-icon-bg" @click="MixOrReduction">
        <svg-icon v-if="state.mix" icon-class="reduction" class-name="icon-size"></svg-icon>
        <svg-icon v-else icon-class="mix" class-name="icon-size"></svg-icon>
      </div>
      <div class="windows-icon-bg close-icon" @click="Close">
        <svg-icon icon-class="close" class-name="icon-size"></svg-icon>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ipcRenderer } from "electron";
import { reactive } from 'vue'

const name = require('../../../../package.json').appName
const version = require('../../../../package.json').version
const state = reactive({
  mix: false,
  IsUseSysTitle: false,
  isNotMac: process.platform !== "darwin",
  IsWeb: process.env.IS_WEB,
})
ipcRenderer.invoke("IsUseSysTitle").then((res) => {
  state.IsUseSysTitle = res;
});
const Mini = () => {
  ipcRenderer.invoke("windows-mini");
}
const MixOrReduction = () => {
  ipcRenderer.invoke("window-max").then((res) => {
    state.mix = res.status;
  });
}
const Close = () => {
  ipcRenderer.invoke("window-close");
}

</script>
<style lang="scss" scoped>
.window-title {
  width: 100%;
  height: 30px;
  line-height: 30px;
  background-color: #ffffff;
  display: flex;
  -webkit-app-region: drag;
  z-index: 99999;

  .title {
    text-align: center;
  }

  .logo {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .controls-container {
    display: flex;
    flex-grow: 0;
    flex-shrink: 0;
    text-align: center;
    position: relative;
    z-index: 3000;
    -webkit-app-region: no-drag;
    height: 100%;
    width: 138px;
    margin-left: auto;

    .windows-icon-bg {
      display: flex;
      align-items: center;
      justify-content: center;
      -webkit-app-region: no-drag;
      height: 100%;
      width: 33.34%;
      color: rgba(80, 80, 80, 1);

      .icon-size {
        width: 12px;
        height: 15px;
      }
    }

    .windows-icon-bg:hover {
      background-color: rgba(182, 182, 182, 0.2);
      color: #333;
    }

    .close-icon:hover {
      background-color: rgba(232, 17, 35, 0.9);
      color: #fff;
    }
  }
}
</style>

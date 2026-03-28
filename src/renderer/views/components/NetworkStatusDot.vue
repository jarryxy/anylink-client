<template>
    <div class="status-dot" :class="statusClass" :title="title"></div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  isConnected: {
    type: Boolean,
    default: false
  }
})

const statusClass = computed(() => props.isConnected ? 'connected' : 'disconnected')
const statusText = computed(() => props.isConnected ? '已连接' : '未连接')
const title = computed(() => props.isConnected ? '网络连接正常' : '网络未连接')
</script>

<style scoped>
.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.connected {
  background-color: #4CAF50;
  box-shadow: 0 0 8px rgba(76, 175, 80, 0.6);
}

.disconnected {
  background-color: #ff8c00;
  box-shadow: 0 0 8px rgba(255, 140, 0, 0.6);
}

</style>
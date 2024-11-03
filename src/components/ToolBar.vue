<script setup lang="ts">
import type MyGraph from '../core/graph'

import { nextTick, onMounted, ref } from 'vue'

const props = defineProps<{
  graph: MyGraph
}>()

const toolbar = ref<string[]>(['undo', 'redo', 'zoomIn', 'zoomOut', 'exportXml'])


function disabled(key: string) {
  return `flex items-center w-[fit-content] mr-[10px] cursor-pointer text-center leading-8 cursor-not-allowed opacity-50 ${key}`
}

function normal(key: string) {
  return `flex items-center w-[fit-content] mr-[10px] cursor-pointer text-center leading-8 hover:bg-slate-200 opacity-100 ${key}`
}

onMounted(() => {
  nextTick(() => {
    toolbar.value.forEach((key) => {
      const action = props.graph?.actions.get(key)
      action?.addListener('stateChanged', () => {
        const enabled = action.isEnabled()
        const dom = document.querySelector(`.mx-toolbar>.${key}`)
        if (dom) {
          if (enabled) {
            dom.className = normal(key)
          } else {
            dom.className = disabled(key)
          }
        }
      })
    })
  })
})

function getToolbarItemClassName(key: string) {
  const action = props.graph?.actions.get(key)
  return action?.enabled ? normal(key) : disabled(key)
}

function handleToolbarItemClick(key: string) {
  const action = props.graph?.actions.get(key)
  if (action?.enabled) {
    action.func(props.graph as MyGraph)
  }
}
</script>

<template>
  <div
    class="flex justify-start w-full border-b border-gray-100 shadow mx-toolbar px-3"
  >
    <div
      v-for="item in toolbar"
      :key="item"
      class="flex items-center w-[fit-content] mr-[10px]"
      :class="getToolbarItemClassName(item)"
      @click="handleToolbarItemClick(item)"
    >
      <div>{{ item }}</div>
    </div>
  </div>
</template>

<style lang="scss">
.mx-toolbar {
  .toolbar {
    width: 100%;
    height: 24px;
    border-bottom: 1px solid #dadce0;
    user-select: none;
  }
}
</style>

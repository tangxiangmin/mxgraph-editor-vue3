<template>
  <div class="h-[100vh]">
    <drawVue
      :nodes="nodes"
      :toolbar="['undo', 'redo', 'zoomIn', 'zoomOut', 'delete','copy','paste']"
      :outlineMap="false"
      ref="draw"
      :beforeAddVertex="beforeAddVertex"
      :handleRotate="handleRotate"
      :handleGeomertyChange="handleGeomertyChange"
      :handleStyleChange="handleStyleChange"
      :handleAddVertex="handleAddVertex"
    >
    </drawVue>
  </div>
</template>

<script setup lang="ts">
import { mxCell, mxRectangle, mxSvgCanvas2D } from 'mxgraph'
import { onMounted, ref } from 'vue'
import drawVue from './package/draw.vue'
import mx from './package/factory'
import { SidebarNode, SidebarNodeConfig } from './package/type/type'
import './shape'
const nodes = ref<SidebarNode[]>([])
const draw = ref()
const { mxUtils, mxRectangleShape, mxEvent } = mx

onMounted(() => {
  nodes.value = [
    {
      name: '基础图形',
      nodes: [
        {
          name: '圆角矩形',
          style: 'rounded=1;fillColor=transparent',
          type: 'vertex',
          value: '占位文字',
          width: 100,
          height: 80
        }
      ]
    }
  ]
  // graph._initRotate()
})
const beforeAddVertex = (cell: mxCell) => {
  return true
}

const handleRotate = () => {
  console.log(123123)
}

const handleGeomertyChange = (
  cell: mxCell[],
  key: string,
  value: number | string
) => {
  console.log(cell, key, value)
}
const handleStyleChange = (
  cell: mxCell[],
  key: string,
  value: number | string
) => {
  console.log(cell, key, value)
}

const handleAddVertex = () => {
  console.log('handleAddVertex')
}
</script>

<style scoped></style>

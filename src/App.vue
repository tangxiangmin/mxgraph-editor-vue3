<script setup lang="ts">
import { onMounted, ref } from 'vue'
import GraphEditor from './components/GraphEditor.vue'
import './shapes/index'

const draw = ref()

const initXml = `<mxGraphModel><root><mxCell id="0"/><mxCell id="1" parent="0"/><mxCell id="2" value="" style="rounded=1;whiteSpace=wrap;html=1;" vertex="1" parent="1"><mxGeometry x="250" y="120" width="100" height="80" as="geometry"/></mxCell><mxCell id="3" value="" style="shape=cube;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;darkOpacity=0.05;darkOpacity2=0.1;" vertex="1" parent="1" data="sdfsdf"><mxGeometry x="160" y="250" width="100" height="80" as="geometry"/></mxCell></root></mxGraphModel>`
onMounted(() => {
  const graph = draw.value.graph
  console.log('init', graph)
})
</script>

<template>
  <div class="h-[100vh]">
    <GraphEditor ref="draw" :init-xml="initXml" />
  </div>
</template>

<style scoped></style>

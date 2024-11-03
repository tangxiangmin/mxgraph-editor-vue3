<script setup lang="ts">
import { onMounted, ref, shallowRef } from 'vue'
import mx from '../core/factory'
import MyGraph from '../core/graph'
import FormatPanel from './FormatPanel.vue'
import SideBar from './SideBar.vue'
import Toolbar from './ToolBar.vue'
import '../index.css'

interface Props {
  initXml?: string
}
const props = defineProps<Props>()
const { mxEditor, mxUtils, mxCodec } = mx

const editorContainerRef = ref<HTMLDivElement>()
const graph = shallowRef<MyGraph>()

function initWithXML(graph: MyGraph, xml: string) {
  graph.getModel().beginUpdate()
  try {
    graph.removeCells(graph.getChildVertices(graph.getDefaultParent()))
  } finally {
    graph.getModel().endUpdate()
  }
  const xmlDocument = mxUtils.parseXml(xml)
  const decoder = new mxCodec(xmlDocument)
  decoder.decode(xmlDocument.documentElement, graph.getModel())
}

onMounted(() => {
  const editor = new mxEditor()
  editor.graph = new MyGraph(editorContainerRef.value!)

  graph.value = editor.graph as MyGraph
  graph.value._init()

  if (props.initXml) {
    initWithXML(graph.value!, props.initXml!)
  }
})

defineExpose({
  graph,
})
</script>

<template>
  <div class="flex w-full h-full draw">
    <div class="h-full w-[300px]">
      <SideBar v-if="graph" :graph="graph" />
    </div>

    <div class="flex flex-col flex-1 w-1">
      <Toolbar v-if="graph" :graph="graph" />
      <div class="flex-1 w-full relative">
        <div ref="editorContainerRef" class="editor-container w-full h-full" />
      </div>
    </div>
    <FormatPanel v-if="graph" :graph="graph" />
  </div>
</template>

<style lang="scss">
.draw {
  @apply relative;
  .toolbar {
    @apply h-8;
  }
  .editor-outline {
    @apply absolute top-0 right-2 w-48 h-32 bg-white shadow border;
  }
}

div.mxRubberband {
  position: absolute;
  overflow: hidden;
  border-style: solid;
  border-width: 1px;
  border-color: #0000ff;
  background: #0077ff;
}
</style>

<style>
div.mxPopupMenu {
  -webkit-box-shadow: 3px 3px 6px #c0c0c0;
  -moz-box-shadow: 3px 3px 6px #c0c0c0;
  box-shadow: 3px 3px 6px #c0c0c0;
  background: white;
  position: absolute;
  border: 3px solid #e7e7e7;
  padding: 3px;
}

table.mxPopupMenu {
  border-collapse: collapse;
  margin: 0px;
}

tr.mxPopupMenuItem {
  color: black;
  cursor: pointer;
}

td.mxPopupMenuItem {
  padding: 6px 60px 6px 30px;
  font-family: Arial;
  font-size: 10pt;
  user-select: none;
}

td.mxPopupMenuIcon {
  background-color: white;
  padding: 0px;
}

tr.mxPopupMenuItemHover {
  background-color: #eeeeee;
  color: black;
}

table.mxPopupMenu hr {
  border-top: solid 1px #cccccc;
}

table.mxPopupMenu tr {
  font-size: 4pt;
}
</style>

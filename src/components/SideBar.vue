<script setup lang="ts">
import type { mxCell, mxDragSource } from 'mxgraph'
import { cloneDeep } from 'lodash-es'
import { nextTick, onMounted, ref, shallowRef } from 'vue'

import mx from '../core/factory'
import MyGraph from '../core/graph'

type ItemType = 'vertex' | 'edge'
interface NodeConfig extends Record<string, any> {
  id: string
  width: number
  height: number
  x: number
  y: number
  style: string
  type: ItemType
  parentId?: string
  source?: mxCell
  target?: mxCell
  value?: string
}

interface SidebarNodeConfig {
  name: string
  style: string
  type: ItemType
  width: number
  height: number
  value?: string
  info?: Record<string, any>
  xml?: string
  // nodeId?: string
}

interface SidebarHTMLItem {
  html: string
  width: number
  height: number
  cell: mxCell
  code: string
}

interface SidebarHTML {
  name: string
  nodes?: SidebarHTMLItem[]
  children?: SidebarHTML[]
}

interface SidebarNode {
  name: string
  nodes?: SidebarNodeConfig[]
  children?: SidebarNode[]
}

const props = defineProps<{
  graph?: MyGraph
}>()

const { mxUtils, mxPoint } = mx

const graph = ref<MyGraph>()
const htmls = ref<SidebarHTML[]>([])
const thumbBorder = 2
const itemWidth = 32
const itemHeight = 30

const selectCell = shallowRef<mxCell>()

function createCommonTemplate(name: string, style: string): SidebarNodeConfig {
  return {
    name,
    style,
    type: 'vertex',
    width: 100,
    height: 80,
  }
}

const nodes = ref<SidebarNode[]>([
  {
    name: '基础图形',
    nodes: [
      createCommonTemplate('矩形', 'rounded=0;whiteSpace=wrap;html=1;'),
      createCommonTemplate('圆角矩形', 'rounded=1;whiteSpace=wrap;html=1;'),
      {
        ...createCommonTemplate('文字', 'text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;'),
        value: 'Text',
      },
      createCommonTemplate('椭圆', 'ellipse;whiteSpace=wrap;html=1;'),
      createCommonTemplate('圆', 'ellipse;whiteSpace=wrap;html=1;aspect=fixed;'),

      // 自定义形状，从shapes目录下引入
      createCommonTemplate('立方体', 'shape=cube;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;darkOpacity=0.05;darkOpacity2=0.1;'),
      createCommonTemplate('进度', 'shape=process;whiteSpace=wrap;html=1;backgroundOutline=1;'),
    ],
  },
])

const tempGraphContainer = ref<HTMLDivElement>()

onMounted(() => {
  // 临时用于绘制图例
  graph.value = new MyGraph(tempGraphContainer.value as HTMLElement)
  graph.value?._setDefaultConfig()
  loadNodes()
})

async function loadNodes() {
  htmls.value = transitionNodes(nodes.value)
  await nextTick()
  makeDraggableAndHover()
}

function transitionNodes(nodes: SidebarNode[]) {
  const res: SidebarHTML[] = []
  nodes.forEach((ele) => {
    const item: SidebarHTML = {
      name: ele.name,
    }
    if (ele.nodes) {
      item.nodes = []
      ele.nodes.forEach((n) => {
        const html
          = n.type === 'vertex'
            ? (getVertexHtml(n) as SidebarHTMLItem)
            : (getEdgeHtml(n) as SidebarHTMLItem)
        item.nodes?.push(html)
      })
    }
    if (ele.children) {
      item.children = transitionNodes(ele.children)
    }
    res.push(item)
  })
  return res
}

function getVertexHtml(item: SidebarNodeConfig): SidebarHTMLItem | undefined {
  const { height, width } = item
  const node: NodeConfig = {
    id: '',
    width,
    height,
    x: 0,
    y: 0,
    style: item.style,
    type: 'vertex',
    info: item.info,
    value: item.value,
  }
  const cell = graph.value?.insertVertetByConfig(node)

  if (cell) {
    const html = createItem([cell], item.name, width, height)
    return {
      html: html as string,
      width,
      height,
      cell,
      code: item.name,
    }
  }
}

function getEdgeHtml(item: SidebarNodeConfig): SidebarHTMLItem | undefined {
  const edge: NodeConfig = {
    id: '',
    width: item.width,
    height: item.height,
    x: 0,
    y: 0,
    style: item.style,
    type: 'edge',
    info: {},
    value: '',
  }
  const cell = graph.value?.insertEdgeByConfig(edge)
  if (cell) {
    cell.geometry.sourcePoint = new mxPoint(0, 0)
    cell.geometry.targetPoint = new mxPoint(100, 0)
    const html = createItem([cell], item.name, 200, 100)
    return {
      html: html as string,
      width: 200,
      height: 100,
      cell,
      code: item.name,
    }
  }
}

function createItem(cells: mxCell[], title: string, realWidth: number, realHeight: number) {
  if (!graph.value) {
    return
  }
  graph.value.view.scaleAndTranslate(1, 0, 0)
  const parent = graph.value.getDefaultParent()
  graph.value.addCells(cells, parent)
  const bounds = graph.value.getGraphBounds()
  const s
    = Math.floor(
      Math.min(
        (itemWidth - 2 * thumbBorder) / bounds.width,
        (itemHeight - 2 * thumbBorder) / bounds.height,
      ) * 100,
    ) / 100
  // 调整为合理的缩放比例
  graph.value.view.scaleAndTranslate(
    s,
    Math.floor((itemWidth - bounds.width * s) / 2 / s - bounds.x),
    Math.floor((itemHeight - bounds.height * s) / 2 / s - bounds.y),
  )
  // 复制svg node
  const node = (
    graph.value.view.getCanvas().ownerSVGElement as SVGSVGElement
  ).cloneNode(true)

  // 清空graph容器
  graph.value.getModel().clear()
  return (node as HTMLElement).outerHTML
}
const dropSuccessCb = function (
  _graph: MyGraph,
  evt: any,
  target: mxCell,
  x: number,
  y: number,
) {
  if (selectCell.value) {
    props.graph?.sidebarToGraph(selectCell.value, x, y, target)
  }
}
const drags = shallowRef<mxDragSource[]>([])

function makeDraggableAndHover() {
  drags.value.forEach(ele => ele.setEnabled(false))
  const doms = document.querySelectorAll('.sidebar_item')
  doms.forEach((ele) => {
    const dragElt = document.createElement('div')
    const width = ele.getAttribute('data-realwidth')
    const height = ele.getAttribute('data-realheight')
    dragElt.style.width = `${width}px`
    dragElt.style.height = `${height}px`
    dragElt.style.border = '1px dashed #000'
    const d = mxUtils.makeDraggable(
      ele as HTMLElement,
      props.graph as MyGraph,
      dropSuccessCb,
      dragElt,
      undefined,
      undefined,
      undefined,
      true,
    )
    drags.value.push(d)
  })
}

function handleItemMouseDown(item: SidebarHTMLItem) {
  selectCell.value = cloneDeep(item.cell)
}
</script>

<template>
  <div class="relative overflow-auto shadow-sm sidebar p-3">
    <div v-for="group in htmls" :key="group.name">
      <div class="mb-4">
        {{ group.name }}
      </div>
      <div
        v-for="node in group.nodes"
        :key="node.code"
        class="sidebar_item cursor-pointer border-[1px] flex items-center
      justify-center h-[60px] w-[100px] mb-2 float-left mr-2"
        :data-realWidth="node.width"
        :data-realHeight="node.height"
        :data-type="node.cell.isVertex()" @mousedown="handleItemMouseDown(node)"
      >
        <div>
          <div class="w-12 h-8" v-html="node.html" />
          <div class="text-[12px] text-center">
            {{ node.code }}
          </div>
        </div>
      </div>
    </div>

    <div id="sidebar_graph_container" ref="tempGraphContainer" />
  </div>
</template>

<style lang="scss" scoped>
#sidebar_graph_container {
  position: absolute;
  top: -1000px;
  width: 500px;
  height: 500px;
  visibility: hidden;
  overflow: auto;
}
</style>

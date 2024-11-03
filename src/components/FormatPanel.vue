<script setup lang="ts">
import type { mxCell } from 'mxgraph'
import type MyGraph from '../core/graph'
import { isNumber } from 'lodash-es'

import { ref, shallowRef } from 'vue'
import mx from '../core/factory'

interface Props {
  graph: MyGraph
}
const props = defineProps<Props>()

initFormat(props.graph)

const activeCells = shallowRef<mxCell[]>([])

const positionModel = ref<{
  width: number
  height: number
  rotate: number
  x: number
  y: number
}>({
  width: 0,
  height: 0,
  rotate: 0,
  x: 0,
  y: 0,
})

const fonts = [
  '黑体',
  '楷体',
  '宋体',
  '微软雅黑',
  'Arial',
  'Times New Roman',
  'Comic Sans MS',
  'Courier New',
  'Verdana',
  'Garamond',
  'Georgia',
  'Impact',
  'Tahoma',
  'Lucida Console',
]

const verticalLabelPosition = ['top', 'bottom', 'middle']

const labelPosition = ['left', 'right', 'center']

interface TextConfig {
  fontFamily: string
  fontSize: number
  fontColor: string
  bold: boolean
  align: string
  verticalLabelPosition: string
  italic: boolean
  underline: boolean
  verticalAlign: string
  fillColor: string
}

const textModel = ref<TextConfig>({
  fontFamily: '',
  fillColor: '',
  fontSize: 0,
  fontColor: '',
  bold: false,
  align: '',
  verticalLabelPosition: '',
  italic: false,
  underline: false,
  verticalAlign: '',
})

const attrModel = ref({
  data: '',
  style: '',
})

enum fontStyle {
  bold = 1,
  italic = 2,
  underline = 4,
}

function initFormat(graph: MyGraph) {
  graph.getSelectionModel().addListener(mx.mxEvent.CHANGE, () => {
    getActiveCells(graph)
  })
  graph.getModel().addListener(mx.mxEvent.CHANGE, () => {
    getActiveCells(graph)
  })
}

function getActiveCells(graph: MyGraph) {
  const cells = graph.getSelectionCells()
  if (cells.length > 0) {
    const firstType = cells[0].isVertex()
    const cell = cells[0]
    activeCells.value = cells.filter(ele => firstType === ele.isVertex())
    const { width, height, x, y } = cell.geometry
    const styles = graph.getCellStyle(cell)

    positionModel.value = {
      width,
      height,
      rotate: styles.rotation ? styles.rotation : 0,
      x,
      y,
    }
    const o = getFontStyle(
      Number(styles.fontStyle) ? Number(styles.fontStyle) : 0,
    )
    textModel.value = {
      fillColor: styles.fillColor ?? '',
      fontFamily: styles.fontFamily ? styles.fontFamily : '',
      fontSize: Number(styles.fontSize) ? Number(styles.fontSize) : 12,
      fontColor: styles.fontColor ? styles.fontColor : '#00000',
      align: styles.align ? styles.align : 'center',
      verticalLabelPosition: styles.verticalLabelPosition
        ? styles.verticalLabelPosition
        : 'bottom',
      verticalAlign: styles.verticalAlign ? styles.verticalAlign : 'bottom',
      ...o,
    }
    attrModel.value = {
      style: cell.style || '',
      data: cell.data || '',
    }
  } else {
    activeCells.value = []
  }
}
function handlePropChange(prop: string, value: number | string) {
  const graph = props.graph
  if (!graph) {
    return
  }
  if (Object.keys(fontStyle).includes(prop)) {
    const n = Object.keys(fontStyle).reduce((p, c) => {
      const num = textModel.value[c as unknown as 'fontSize']
        ? fontStyle[c as unknown as 'bold']
        : 0
      return num + p
    }, 0)

    mx.mxUtils.setCellStyles(
      graph.model,
      activeCells.value,
      'fontStyle',
      isNumber(n) ? `${n}` : n,
    )
  } else {
    mx.mxUtils.setCellStyles(
      graph.model,
      activeCells.value,
      prop,
      isNumber(value) ? `${value}` : value,
    )
  }
}

function handleGeomertyChange(key: string, value: number) {
  activeCells.value.forEach((ele) => {
    ele.geometry[key as unknown as 'x'] = value
    props.graph?.refresh(ele)
  })
}

function getFontStyle(num: number) {
  return {
    bold: !!(num === 1 || num === 3 || num === 7 || num === 5),
    italic: !!(num === 2 || num === 3 || num === 7 || num === 6),
    underline: !!(num === 4 || num === 7 || num === 5 || num === 6),
  }
}

const customData = ref('')
function setCustomAttr(name: string, value: string) {
  activeCells.value.forEach((cell) => {
    cell[name] = value
  })
}
</script>

<template>
  <div
    class="shadow overflow-auto h-full z-40 bg-[#f6f7f8] w-[250px]"
  >
    <div v-if="activeCells.length > 0">
      <div class="px-4 py-2 font-bold border-b text-lg">
        配置
      </div>
      <div v-if="activeCells[0].isVertex()">
        <div class="px-4 py-3 border-b">
          <div class="font-bold mb-2">
            自定义数据
          </div>
          <el-form label-position="left" label-width="50px" size="small">
            <el-form-item label="data">
              <el-input
                v-model="attrModel.data" type="textarea" @change="(value:string) => {
                  setCustomAttr('data', value)
                }"
              />
            </el-form-item>
            <el-form-item label="style">
              <el-input
                v-model="attrModel.style" type="textarea" @change="(value:string) => {
                  setCustomAttr('style', value)
                }"
              />
            </el-form-item>
          </el-form>
        </div>
        <div class="px-4 py-3 border-b">
          <div class="font-bold mb-2">
            样式
          </div>
          <el-form label-position="left" label-width="50px" size="small">
            <el-form-item label="背景色">
              <el-color-picker
                v-model="textModel.fillColor"
                show-alpha
                @change="
                  (val: string) => {
                    handlePropChange('fillColor', val)
                  }
                "
              />
            </el-form-item>
          </el-form>
        </div>
        <div class="px-4 py-3 border-b">
          <div class="font-bold mb-2">
            布局
          </div>
          <el-form label-position="left" label-width="50px" size="small">
            <el-form-item label="宽度">
              <el-input-number
                v-model="positionModel.width"
                controls-position="right"
                @change="
                  (val: number) => {
                    handleGeomertyChange('width', val)
                  }
                "
              />
              <span class="ml-1">px</span>
            </el-form-item>
            <el-form-item label="高度">
              <el-input-number
                v-model="positionModel.height"
                controls-position="right"
                @change="
                  (val: number) => {
                    handleGeomertyChange('height', val)
                  }
                "
              />
              <span class="ml-1">px</span>
            </el-form-item>
            <el-form-item label="x">
              <el-input-number
                v-model="positionModel.x"
                controls-position="right"
                @change="
                  (val: number) => {
                    handleGeomertyChange('x', val)
                  }
                "
              />
              <span class="ml-1">px</span>
            </el-form-item>
            <el-form-item label="y">
              <el-input-number
                v-model="positionModel.y"
                controls-position="right"
                @change="
                  (val: number) => {
                    handleGeomertyChange('y', val)
                  }
                "
              />
              <span class="ml-1">px</span>
            </el-form-item>
            <el-form-item label="旋转">
              <el-input-number
                v-model="positionModel.rotate"
                controls-position="right"
                @change="
                  (val: string) => {
                    handlePropChange('rotation', val)
                  }
                "
              />
              <span class="ml-1">°</span>
            </el-form-item>
          </el-form>
        </div>
        <div class="px-4 py-3 border-b">
          <div class="font-bold mb-2">
            文本
          </div>
          <el-form size="small">
            <el-form-item label="字体">
              <el-select
                v-model="textModel.fontFamily"
                @change="
                  (val: string) => {
                    handlePropChange('fontFamily', val)
                  }
                "
              >
                <el-option v-for="font in fonts" :key="font" :label="font" :value="font">
                  <span :style="{ fontFamily: font }">{{ font }}</span>
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="字号">
              <el-input-number
                v-model="textModel.fontSize"
                controls-position="right"
                @change="
                  (val: string) => {
                    handlePropChange('fontSize', val)
                  }
                "
              />
              <span class="ml-1">px</span>
            </el-form-item>
            <el-form-item label="颜色">
              <el-color-picker
                v-model="textModel.fontColor"
                @change="
                  (val: string) => {
                    handlePropChange('fontColor', val)
                  }
                "
              />
            </el-form-item>
            <el-form-item label="加粗">
              <el-switch
                v-model="textModel.bold"
                @change="
                  (val: string) => {
                    handlePropChange('bold', val)
                  }
                "
              />
            </el-form-item>
            <el-form-item label="倾斜">
              <el-switch
                v-model="textModel.italic"
                @change="
                  (val: string) => {
                    handlePropChange('italic', val)
                  }
                "
              />
            </el-form-item>
            <el-form-item label="下划线">
              <el-switch
                v-model="textModel.underline"
                @change="
                  (val: string) => {
                    handlePropChange('underline', val)
                  }
                "
              />
            </el-form-item>
            <el-form-item label="文本水平方向">
              <el-select
                v-model="textModel.align"
                @change="
                  (val: string) => {
                    handlePropChange('align', val)
                  }
                "
              >
                <el-option
                  v-for="font in labelPosition"
                  :key="font"
                  :label="font"
                  :value="font"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="文本垂直方向">
              <el-select
                v-model="textModel.verticalLabelPosition"
                @change="
                  (val: string) => {
                    handlePropChange('verticalLabelPosition', val)
                  }
                "
              >
                <el-option
                  v-for="font in verticalLabelPosition"
                  :key="font"
                  :label="font"
                  :value="font"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="垂直方向">
              <el-select
                v-model="textModel.verticalAlign"
                @change="
                  (val: string) => {
                    handlePropChange('verticalAlign', val)
                  }
                "
              >
                <el-option
                  v-for="font in verticalLabelPosition"
                  :key="font"
                  :label="font"
                  :value="font"
                />
              </el-select>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <div v-if="activeCells[0].isEdge()">
        edge
      </div>
    </div>
    <el-empty v-else description="请选择图元" />
  </div>
</template>

<style scoped></style>

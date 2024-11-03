<template>
  <el-sub-menu v-for="item in htmls" :index="item.name">
    <template #title>
      <span>{{ item.name }}</span>
    </template>
    <el-menu-item
      v-for="ele in item.nodes"
      :index="item.name"
      @mousedown="handleItemMouseDown(ele)"
    >
      <div
        class="flex justify-start p-2 align-middle transition duration-300 cursor-pointer sidebar_item shrink-0"
        :ref="getSidebarRef"
        :data-realWidth="ele.width"
        :data-realHeight="ele.height"
        :data-type="ele.cell.isVertex()"
      >
        <div class="w-12 h-8" v-html="ele.html"></div>
        <span class="leading-8 truncate" :title="ele.code">{{ ele.code }}</span>
      </div>
    </el-menu-item>
    <sidebar-details
      v-if="item.children"
      :htmls="item.children"
      :get-sidebar-ref="props.getSidebarRef"
      :handle-item-mouse-down="props.handleItemMouseDown"
    />
  </el-sub-menu>
</template>

<script lang="ts">
export default {
  name: 'sidebar-details'
}
</script>
<script setup lang="ts">
import { SidebarHTML, SidebarHTMLItem } from './type/type'

const props = defineProps<{
  htmls: SidebarHTML[]
  getSidebarRef: (ele: any) => void
  handleItemMouseDown: (item: SidebarHTMLItem) => void
}>()
</script>

<style scoped></style>

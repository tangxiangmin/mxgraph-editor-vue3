// 参考 https://github.com/jgraph/mxgraph/blob/master/javascript/examples/grapheditor/www/js/Shapes.js
import mx from '../core/factory'

import CubeShape from './cube'
import ProcessShape from './process'

const { mxCellRenderer } = mx

// 注册自定义形状
mxCellRenderer.registerShape('cube', CubeShape)
mxCellRenderer.registerShape('process', ProcessShape)

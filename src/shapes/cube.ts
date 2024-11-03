import mx from '../core/factory'

const { mxCylinder, mxUtils, mxRectangle } = mx

function CubeShape() {
  mxCylinder.call(this)
}
mxUtils.extend(CubeShape, mxCylinder)

CubeShape.prototype.size = 20
CubeShape.prototype.darkOpacity = 0
CubeShape.prototype.darkOpacity2 = 0

CubeShape.prototype.paintVertexShape = function (c, x, y, w, h) {
  const s = Math.max(0, Math.min(w, Math.min(h, Number.parseFloat(mxUtils.getValue(this.style, 'size', this.size)))))
  const op = Math.max(-1, Math.min(1, Number.parseFloat(mxUtils.getValue(this.style, 'darkOpacity', this.darkOpacity))))
  const op2 = Math.max(-1, Math.min(1, Number.parseFloat(mxUtils.getValue(this.style, 'darkOpacity2', this.darkOpacity2))))
  c.translate(x, y)

  c.begin()
  c.moveTo(0, 0)
  c.lineTo(w - s, 0)
  c.lineTo(w, s)
  c.lineTo(w, h)
  c.lineTo(s, h)
  c.lineTo(0, h - s)
  c.lineTo(0, 0)
  c.close()
  c.end()
  c.fillAndStroke()

  if (!this.outline) {
    c.setShadow(false)

    if (op != 0) {
      c.setFillAlpha(Math.abs(op))
      c.setFillColor((op < 0) ? '#FFFFFF' : '#000000')
      c.begin()
      c.moveTo(0, 0)
      c.lineTo(w - s, 0)
      c.lineTo(w, s)
      c.lineTo(s, s)
      c.close()
      c.fill()
    }

    if (op2 != 0) {
      c.setFillAlpha(Math.abs(op2))
      c.setFillColor((op2 < 0) ? '#FFFFFF' : '#000000')
      c.begin()
      c.moveTo(0, 0)
      c.lineTo(s, s)
      c.lineTo(s, h)
      c.lineTo(0, h - s)
      c.close()
      c.fill()
    }

    c.begin()
    c.moveTo(s, h)
    c.lineTo(s, s)
    c.lineTo(0, 0)
    c.moveTo(s, s)
    c.lineTo(w, s)
    c.end()
    c.stroke()
  }
}
CubeShape.prototype.getLabelMargins = function (rect) {
  if (mxUtils.getValue(this.style, 'boundedLbl', false)) {
    const s = Number.parseFloat(mxUtils.getValue(this.style, 'size', this.size)) * this.scale

    return new mxRectangle(s, s, 0, 0)
  }

  return null
}

export default CubeShape

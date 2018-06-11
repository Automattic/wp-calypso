/* global context */

import * as React from 'react'
import { Artboard, Page, render, View } from 'react-sketchapp'

const createPaletteColors = require('../formula')
const FOUNDATIONS = require('../foundations')

const PALETTE_COLORS = FOUNDATIONS.baseColors.map(color => {
  return createPaletteColors(color.value, color.name)
})

const swatches = [
  {
    name: 'None',
    color: 'transparent',
    x: 1,
    y: 0
  },
  {
    name: 'White',
    color: '#fff',
    x: 0,
    y: 0
  }
]

PALETTE_COLORS.forEach((colors, y) => {
  colors.forEach((color, x) => {
    swatches.push({
      name: [color.name, '/', color.index, color.auxiliary ? 'A' : ''].join(''),
      color: color.color,
      x,
      y: y + 1
    })
  })
})

const Swatch = ({ name, color, x, y }) => (
  <Artboard name={`Color/${name}`} style={{ position: 'absolute', top: y * 60, left: x * 60 }}>
    <View name="bg" style={{ height: 48, width: 48, backgroundColor: color }} />
  </Artboard>
)

const Document = () => (
  <Page>
    {swatches.map(swatch => {
      return <Swatch key={swatch.name} name={swatch.name} color={swatch.color} x={swatch.x} y={swatch.y} />
    })}
  </Page>
)

export default () => {
  render(<Document />, context.document.currentPage())
}

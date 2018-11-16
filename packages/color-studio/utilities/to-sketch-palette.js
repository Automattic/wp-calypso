const chroma = require('chroma-js')
const flatten = require('lodash/flatten')

const SKETCH_PALETTE_ROW_COUNT = 8
const SKETCH_PALETTE_ROW_FILLER = 'white'

module.exports = (colorArray, customProperties = {}) => {
  const sketchPalette = Object.assign(customProperties, {
    compatibleVersion: '2',
    pluginVersion: '2.14',
    gradients: [],
    colors: [],
    images: []
  })

  formatPalette(colorArray).map(formatColor).forEach(rgba => {
    sketchPalette.colors.push(rgba)
  })

  return JSON.stringify(sketchPalette, null, 2)
}

function formatPalette(colorArray) {
  if (!isArrayOfArrays(colorArray)) {
    return colorArray
  }

  const rows = colorArray.map(fillOutPaletteRow)
  return flatten(rows)
}

function isArrayOfArrays(collection) {
  return Array.isArray(collection) && Array.isArray(collection[0])
}

function fillOutPaletteRow(colorArray) {
  const row = [].concat(colorArray)

  while (row.length % SKETCH_PALETTE_ROW_COUNT > 0) {
    row.push(SKETCH_PALETTE_ROW_FILLER)
  }

  return row
}

function formatColor(colorValue) {
  const color = chroma(colorValue)

  return {
    red:   color.get('rgb.r') / 255,
    green: color.get('rgb.g') / 255,
    blue:  color.get('rgb.b') / 255,
    alpha: color.alpha()
  }
}

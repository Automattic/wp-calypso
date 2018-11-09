const chroma = require('chroma-js')
const flatten = require('lodash/flatten')

module.exports = (colorArray, customProperties = {}) => {
  const sketchPalette = Object.assign(customProperties, {
    compatibleVersion: '2',
    pluginVersion: '2.14',
    gradients: [],
    colors: [],
    images: []
  })

  flatten(colorArray).map(formatColor).forEach(rgba => {
    sketchPalette.colors.push(rgba)
  })

  return JSON.stringify(sketchPalette, null, 2)
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

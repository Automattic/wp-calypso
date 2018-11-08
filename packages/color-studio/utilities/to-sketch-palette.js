const chroma = require('chroma-js')

module.exports = (colorArray, customProperties = {}) => {
  const sketchPalette = Object.assign(customProperties, {
    compatibleVersion: '2',
    pluginVersion: '2.14',
    gradients: [],
    colors: [],
    images: []
  })

  colorArray.map(formatColor).forEach(rgba => {
    sketchPalette.colors.push(rgba)
  })

  return sketchPalette
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

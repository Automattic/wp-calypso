const chroma = require('chroma-js')

/* eslint-disable no-unused-vars */
const COLOR_WHITE = '#fff'
const COLOR_BLACK = '#000'
/* eslint-enable no-unused-vars */

module.exports = createPaletteColors

function createPaletteColors(baseColor, baseColorName = '') {
  const brightShades = createBrightShades(baseColor)
  const darkShades = createDarkShades(baseColor)

  const palette = mergePaletteShades(brightShades, darkShades).map((color, index) => {
    const colorIndex = (index * 100) || 50
    const colorObject = {
      color,
      index: colorIndex,
      base: colorIndex === 80,
      auxiliary: false
    }

    if (baseColorName) {
      colorObject.name = baseColorName
    }

    return colorObject
  })

  return palette
}

function createBrightShades(baseColor) {
  const shade50 = chroma.mix(baseColor, COLOR_WHITE, 0.93, 'lch').desaturate(0.05)
  const colors = chroma.scale([shade50, baseColor]).mode('lch').colors(6)
  return colors
}

function createDarkShades(baseColor) {
  const shade900 = chroma(baseColor).darken(1.7).desaturate(1)
  const colors = chroma.scale([baseColor, shade900]).mode('lch').colors(5)
  return colors
}

function mergePaletteShades(brightShades, darkShades) {
  const shades = [].concat(brightShades)
  shades.pop()
  return shades.concat(darkShades)
}

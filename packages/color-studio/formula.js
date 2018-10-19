const chroma = require('chroma-js')

const COLOR_WHITE = '#fff'

module.exports = createPaletteColors

function createPaletteColors(baseColor, baseColorName = '') {
  const brightShades = createBrightShades(baseColor)
  const darkShades = createDarkShades(baseColor)

  const colors = mergePaletteShades(brightShades, darkShades)

  const standardPalette = colors.map((color, index) => {
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

  return standardPalette
}

function createBrightShades(baseColor) {
  const shade100 = chroma.mix(baseColor, COLOR_WHITE, 0.85, 'lch')
  const shade50 = chroma.mix(shade100, COLOR_WHITE, 0.65)
  const colors = chroma.scale([shade100, baseColor]).mode('lch').colors(5)
  colors.unshift(shade50.hex())
  return colors
}

function createDarkShades(baseColor) {
  const shade900 = chroma(baseColor).darken(2).desaturate(1)
  const colors = chroma.scale([baseColor, shade900]).mode('lch').colors(5)
  return colors
}

function mergePaletteShades(brightShades, darkShades) {
  const shades = [].concat(brightShades)
  shades.pop()
  return shades.concat(darkShades)
}

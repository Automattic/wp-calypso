const chroma = require('chroma-js')

/* eslint-disable no-unused-vars */
const COLOR_WHITE = '#fff'
const COLOR_BLACK = '#000'
/* eslint-enable no-unused-vars */

module.exports = createPrimaryShades

function createPrimaryShades(baseColor) {
  const brightShades = createBrightShades(baseColor)
  const darkShades = createDarkShades(baseColor)

  const palette = mergePaletteShades(brightShades, darkShades).map((color, arrayIndex) => {
    return {
      color,
      index: (arrayIndex * 100) || 50
    }
  })

  return palette
}

function createBrightShades(baseColor) {
  const first = chroma.mix(baseColor, COLOR_WHITE, 0.85, 'lch').desaturate(0.1)
  const colors = chroma.scale([first, baseColor]).mode('lch').colors(6)
  return colors
}

function createDarkShades(baseColor) {
  const last = chroma(baseColor).darken(1.7).desaturate(1)
  const colors = chroma.scale([baseColor, last]).mode('lch').colors(5)
  return colors
}

function mergePaletteShades(brightShades, darkShades) {
  const shades = [].concat(brightShades)
  shades.pop()
  return shades.concat(darkShades)
}

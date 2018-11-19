const chroma = require('chroma-js')
const drop = require('lodash/drop')

module.exports = baseColor => {
  const brightShades = createBrightShades(baseColor)
  const darkShades = createDarkShades(baseColor)

  const palette = mergePaletteShades(brightShades, darkShades).map((value, arrayIndex) => {
    return {
      value,
      index: arrayIndex <= 1 ? (50 * arrayIndex) : (100 * (arrayIndex - 1))
    }
  })

  return palette
}

function createBrightShades(baseColor) {
  const first = chroma.mix(baseColor, 'white', 0.85, 'lch').desaturate(0.1)
  const endColors = chroma.scale([first, baseColor]).mode('lch').colors(6)

  const zero = chroma.mix(first, 'white', 0.6)
  const startColors = chroma.scale([zero, first, endColors[1]]).correctLightness().colors(3)

  return startColors.concat(drop(endColors, 2))
}

function createDarkShades(baseColor) {
  const last = chroma(baseColor).darken(2).desaturate(1.2)
  const colors = chroma.scale([baseColor, last]).mode('lch').colors(5)
  return colors
}

function mergePaletteShades(brightShades, darkShades) {
  const shades = [].concat(brightShades)
  shades.pop()
  return shades.concat(darkShades)
}

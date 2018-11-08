const chroma = require('chroma-js')

module.exports = baseColor => {
  const brightShades = createBrightShades(baseColor)
  const darkShades = createDarkShades(baseColor)

  const palette = mergePaletteShades(brightShades, darkShades).map((value, arrayIndex) => {
    return {
      value,
      index: (arrayIndex * 100) || 50
    }
  })

  return palette
}

function createBrightShades(baseColor) {
  const first = chroma.mix(baseColor, 'white', 0.85, 'lch').desaturate(0.1)
  const colors = chroma.scale([first, baseColor]).mode('lch').colors(6)
  return colors
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

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
  const first = chroma.mix(baseColor, 'white', 0.95, 'lch').saturate(0.5)
  const middle = chroma(baseColor).saturate(2)
  const colors = chroma.scale([first, middle, baseColor]).mode('lch').correctLightness().colors(6)
  return colors
}

function createDarkShades(baseColor) {
  const last = chroma(baseColor).darken(2).desaturate(0.5)
  const colors = chroma.scale([baseColor, last]).mode('lch').colors(5)
  return colors
}

function mergePaletteShades(brightShades, darkShades) {
  const shades = [].concat(brightShades)
  shades.pop()
  return shades.concat(darkShades)
}

const PALETTE = require('../dist/colors.json')

const toSketchPalette = require('../utilities/to-sketch-palette')

const colors = PALETTE.colors.map(colorArray => {
  const values = colorArray.map(colorObject => colorObject.value)
  return ['white'].concat(values)
})

const palette = toSketchPalette(colors, {
  _paletteVersion: PALETTE.version
})

console.log(palette)

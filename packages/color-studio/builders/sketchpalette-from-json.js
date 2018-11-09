const PALETTE = require('../dist/colors.json')

const toSketchPalette = require('../utilities/to-sketch-palette')

const colors = PALETTE.colors.map(colorArray => {
  return colorArray.map(colorObject => colorObject.value)
})

const palette = toSketchPalette(colors, {
  _paletteVersion: PALETTE.version
})

console.log(palette)

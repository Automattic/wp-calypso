const flatten = require('lodash/flatten')

const PALETTE = require('../dist/colors.json')

const print = require('../utilities/print-json')
const toSketchPalette = require('../utilities/to-sketch-palette')

const colors = PALETTE.colors.map(colorArray => {
  return colorArray.map(colorObject => colorObject.value)
})

const palette = toSketchPalette(flatten(colors), {
  _paletteVersion: PALETTE.version
})

print(palette)

const _ = require('lodash')
const chroma = require('chroma-js')

const createPaletteColors = require('./formula')
const FOUNDATIONS = require('./foundations')

const PALETTE_COLORS = FOUNDATIONS.baseColors.map(color => {
  return createPaletteColors(color.value, color.name)
})

const SKETCH_PALETTE_SCHEMA = {
  compatibleVersion: '2',
  pluginVersion: '2.14',
  gradients: [],
  colors: [],
  images: []
}

const SKETCH_PALETTE_ROW_COUNT = 8
const SCSS_VARIABLE_PREFIX = '$wpc'

console.log(printPalette(PALETTE_COLORS, process.argv[2]))

function printPalette(palette, type) {
  switch (type) {
    case 'sketch':
      return convertToSketchPalette(palette)
    case 'scss':
      return convertToSCSS(palette)
    default:
      return palette
  }
}

function convertToSketchPalette(palette, padding = 0) {
  const sketchPalette = _.cloneDeep(SKETCH_PALETTE_SCHEMA)

  palette.forEach(colorArray => {
    let colorArrayChunks = _(splitColorsByType(colorArray))
      .map(a => _.chunk(a, SKETCH_PALETTE_ROW_COUNT))
      .flatten()
      .reverse()
      .value()

    if (colorArrayChunks.length === 4) {
      colorArrayChunks = [2, 0, 3, 1].map(i => colorArrayChunks[i])
    }

    _(colorArrayChunks)
      .flatten()
      .map(convertToSketchPaletteColor)
      .each(c => sketchPalette.colors.push(c))
  })

  return JSON.stringify(sketchPalette, null, padding)
}

function splitColorsByType(colorArray) {
  const defaultColors = colorArray.filter(c => !c.auxiliary)
  const auxiliaryColors = colorArray.filter(c => c.auxiliary)

  return [defaultColors, auxiliaryColors].filter(a => a.length > 0)
}

function convertToSketchPaletteColor(colorObject) {
  const color = chroma(colorObject.color)

  return {
    red:   color.get('rgb.r') / 255,
    green: color.get('rgb.g') / 255,
    blue:  color.get('rgb.b') / 255,
    alpha: 1
  }
}

function convertToSCSS(palette) {
  const printedColorArrays = _.flatten(skipWhiteColors(palette).map(splitColorsByType))
  printedColorArrays.unshift([{ color: '#fff', name: 'white' }])

  return printedColorArrays
    .map(colorArray => {
      return colorArray.map(formatColorVariable).join('\n')
    })
    .join('\n\n')
}

function skipWhiteColors(palette) {
  return palette.map(paletteRow => {
    return paletteRow.filter(c => formatHex(c.color) !== '#fff')
  })
}

function formatColorVariable(colorObject) {
  const colorIndex = _.compact([colorObject.index, colorObject.auxiliary ? 'A' : '']).join('')
  const variableName = _.compact([SCSS_VARIABLE_PREFIX, colorObject.name.toLowerCase(), colorIndex]).join('-')

  return `${variableName}: ${formatHex(colorObject.color)};`
}

function formatHex(value) {
  const hex = value.toLowerCase()
  const h = hex.split('')

  if (h.length === 7 && h[1] === h[2] && h[3] === h[4] && h[5] === h[6]) {
    return [0, 1, 3, 5].map(i => h[i]).join('')
  }

  return hex
}

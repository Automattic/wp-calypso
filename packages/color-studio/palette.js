const _ = require('lodash')
const chroma = require('chroma-js')

const createPaletteColors = require('./formula')
const toSketchPalette = require('./utilities/to-sketch-palette')

const FOUNDATIONS = require('./foundations')
const PACKAGE = require('./package.json')

const PALETTE_COLORS = FOUNDATIONS.baseColors.map(color => {
  return createPaletteColors(color.value, color.name)
})

const SCSS_VARIABLE_PREFIX = '$wpc'

console.log(printPalette(PALETTE_COLORS, process.argv[2]))

function printPalette(palette, type) {
  switch (type) {
    case 'sketch':
      return convertToSketchPalette(palette)
    case 'scss':
      return convertToSCSS(palette)
    case 'json':
      return convertToJSON(palette)
    default:
      return palette
  }
}

function convertToSketchPalette(palette) {
  const colors = _.flatten(palette).map(colorObject => {
    return colorObject.color
  })

  return toSketchPalette(colors, {
    _paletteVersion: PACKAGE.version
  })
}

function printJSON(data, padding = 2) {
  return JSON.stringify(data, null, padding)
}

function splitColorsByType(colorArray) {
  const defaultColors = colorArray.filter(c => !c.auxiliary)
  const auxiliaryColors = colorArray.filter(c => c.auxiliary)

  return [defaultColors, auxiliaryColors].filter(a => a.length > 0)
}

function convertToRGBA(colorValue) {
  const color = chroma(colorValue)

  return {
    red:   color.get('rgb.r') / 255,
    green: color.get('rgb.g') / 255,
    blue:  color.get('rgb.b') / 255,
    alpha: color.alpha()
  }
}

function convertToSCSS(palette) {
  const printedColorArrays = _.flatten(palette.map(splitColorsByType))
  printedColorArrays.unshift([{ color: '#fff', name: 'white' }])

  const printedColorArray = printedColorArrays.map(colorArray => {
    return colorArray.map(formatColorVariable).join('\n')
  })
  printedColorArray.unshift(`// v${PACKAGE.version}`)

  return printedColorArray.join('\n\n')
}

function convertToJSON(palette) {
  const printedColorArray = _.flatten(palette).map(colorObject => {
    return {
      name: `${colorObject.name} ${colorObject.index}${colorObject.auxiliary ? 'A' : ''}`,
      values: {
        hex: formatHex(colorObject.color),
        rgba: convertToRGBA(colorObject.color)
      }
    }
  })

  printedColorArray.unshift({
    name: 'White',
    values: {
      hex: '#fff',
      rgba: {
        red: 0,
        green: 0,
        blue: 0,
        alpha: 1
      }
    }
  })

  const jsonPalette = {
    version: PACKAGE.version,
    colors: printedColorArray
  }

  return printJSON(jsonPalette)
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

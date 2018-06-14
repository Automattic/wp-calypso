const _ = require('lodash')
const chroma = require('chroma-js')

const createPaletteColors = require('./formula')
const FOUNDATIONS = require('./foundations')
const PACKAGE = require('./package.json')

const PALETTE_COLORS = FOUNDATIONS.baseColors.map(color => {
  return createPaletteColors(color.value, color.name)
})

const SKETCH_PALETTE_ROW_COUNT = 8
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
  const sketchPalette = {
    _paletteVersion: PACKAGE.version,
    compatibleVersion: '2',
    pluginVersion: '2.14',
    gradients: [],
    colors: [],
    images: []
  }

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

  return printJSON(sketchPalette)
}

function printJSON(data, padding = 2) {
  return JSON.stringify(data, null, padding)
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

  const printedColorArray = printedColorArrays.map(colorArray => {
    return colorArray.map(formatColorVariable).join('\n')
  })
  printedColorArray.unshift(`// v${PACKAGE.version}`)

  return printedColorArray.join('\n\n')
}

function convertToJSON(palette) {
  const printedColorArray = _.flatten(skipWhiteColors(palette)).map(colorObject => {
    const index = colorObject.index
    const indexLength = String(index).replace(/\D/g, '').length
    const printedIndex = _.repeat(0, Math.max(3 - indexLength, 0)) + index

    return {
      name: `${colorObject.name} ${printedIndex}${colorObject.auxiliary ? 'A' : ''}`,
      values: {
        hex: formatHex(colorObject.color),
        rgba: convertToSketchPaletteColor(colorObject)
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

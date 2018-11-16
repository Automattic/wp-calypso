/* eslint-disable import/no-unresolved */
const { getSelectedDocument } = require('sketch')
const { Artboard, Rectangle, Shape, SharedStyle, Style, SymbolMaster } = require('sketch/dom')
/* eslint-enable import/no-unresolved */

const padStart = require('lodash/padStart')

const PALETTE = require('../../dist/colors.json')

const SWATCH_WIDTH = 48
const SWATCH_HEIGHT = 48
const SWATCH_MARGIN = 12
const SWATCH_INITIAL_X = 0
const SWATCH_INITIAL_Y = 240

const PALETTE_WHITE = {
  name: 'White',
  value: '#ffffff',
  _meta: {
    special: true
  }
}

const PALETTE_COLORS = [[PALETTE_WHITE]].concat(PALETTE.colors)

const cachedArtboards = {}
const cachedSharedStyles = {}

export default () => {
  const document = getSelectedDocument()
  const page = document.selectedPage

  cacheArtboards(page)
  cacheSharedStyles(document)

  PALETTE_COLORS.forEach((colorObjects, rowIndex) => {
    colorObjects.forEach((colorObject, columnIndex) => {
      const colorStyle = createColorStyle(document, colorObject)
      createColorSymbol(page, colorObject, colorStyle, rowIndex, columnIndex)
    })
  })
}

function cacheArtboards(parent) {
  parent.layers.forEach(artboard => {
    cachedArtboards[artboard.name] = artboard
  })
}

function cacheSharedStyles(document) {
  document.getSharedLayerStyles().forEach(style => {
    cachedSharedStyles[style.name] = style
  })
}

function createColorStyle(document, colorObject) {
  const name = normalizeColorName(colorObject)
  const style = ensureSharedStyle(document, name)
  style.style = {
    type: Style,
    fills: [
      {
        color: colorObject.value,
        fillType: Style.FillType.Color
      }
    ]
  }

  return style
}

function normalizeColorName(colorObject) {
  if (colorObject._meta.special) {
    return colorObject.name
  }

  const base = colorObject._meta.baseName
  const index = padStart(colorObject._meta.shadeIndex, 3, 0)
  return `${base}/${base} ${index}`
}

function ensureSharedStyle(document, name) {
  return cachedSharedStyles[name] || SharedStyle.fromStyle({
    document,
    name,
    style: {
      type: Style
    }
  })
}

function createColorSymbol(parent, colorObject, colorStyle, rowIndex = 0, columnIndex = 0) {
  const name = normalizeColorName(colorObject)
  const x = SWATCH_INITIAL_X + columnIndex * (SWATCH_WIDTH + SWATCH_MARGIN)
  const y = SWATCH_INITIAL_Y + rowIndex * (SWATCH_HEIGHT + SWATCH_MARGIN)

  const colorArtboard = ensureArtboardWith(parent, name, x, y, SWATCH_WIDTH, SWATCH_HEIGHT)
  const colorFill = new Shape({
    parent: empty(colorArtboard),
    name: 'bg',
    frame: new Rectangle(0, 0, SWATCH_WIDTH, SWATCH_HEIGHT),
    sharedStyleId: colorStyle.id,
    locked: true
  })

  colorFill.style.syncWithSharedStyle(colorStyle)
  return SymbolMaster.fromArtboard(colorArtboard)
}

function ensureArtboardWith(parent, name, x, y, width, height) {
  const artboard = cachedArtboards[name] || new Artboard({ parent, name })
  artboard.frame = new Rectangle(x, y, width, height)

  return artboard
}

function empty(parent) {
  if (parent.layers.length >= 0) {
    parent.layers.forEach(layer => {
      layer.remove()
    })
  }

  return parent
}

/* eslint-disable import/no-unresolved */
const { getSelectedDocument } = require('sketch')
const { Artboard, Rectangle, Shape, SharedStyle, Style, SymbolMaster } = require('sketch/dom')
/* eslint-enable import/no-unresolved */

const PALETTE = require('../../dist/colors.json')

const SWATCH_WIDTH = 48
const SWATCH_HEIGHT = 48
const SWATCH_MARGIN = 12
const SWATCH_INITIAL_X = 0
const SWATCH_INITIAL_Y = 0

export default () => {
  const document = getSelectedDocument()
  const page = document.selectedPage

  PALETTE.colors.forEach((colorObjects, rowIndex) => {
    colorObjects.forEach((colorObject, columnIndex) => {
      const colorStyle = createColorStyle(document, colorObject)
      createColorSymbol(page, colorObject, colorStyle, rowIndex, columnIndex)
    })
  })
}

function createColorStyle(document, colorObject) {
  const name = `Color Fill/${colorObject._meta.baseName}/${colorObject.name}`
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

function ensureSharedStyle(document, name) {
  const style = getSharedStyleByName(document, name)
  return style ? style : SharedStyle.fromStyle({
    document,
    name,
    style: {
      type: Style
    }
  })
}

function getSharedStyleByName(document, name) {
  let match = null

  document.getSharedLayerStyles().some(style => {
    if (style.name === name) {
      match = style
      return true
    }
  })

  return match
}

function createColorSymbol(parent, colorObject, colorStyle, rowIndex = 0, columnIndex = 0) {
  const name = `${colorObject._meta.baseName}/${colorObject.name}`
  const x = SWATCH_INITIAL_X + columnIndex * (SWATCH_WIDTH + SWATCH_MARGIN)
  const y = SWATCH_INITIAL_Y + rowIndex * (SWATCH_HEIGHT + SWATCH_MARGIN)

  const colorArtboard = ensureArtboardWith(parent, name, x, y, SWATCH_WIDTH, SWATCH_HEIGHT)
  const colorFill = new Shape({
    parent: empty(colorArtboard),
    name: 'bg',
    frame: new Rectangle(0, 0, SWATCH_WIDTH, SWATCH_HEIGHT),
    sharedStyleId: colorStyle.id
  })

  colorFill.style.syncWithSharedStyle(colorStyle)
  return SymbolMaster.fromArtboard(colorArtboard)
}

function ensureArtboardWith(parent, name, x, y, width, height) {
  const artboard = getArtboardByName(parent, name)
  if (!artboard) {
    return createArtboard(parent, name, x, y, width, height)
  }

  artboard.frame = new Rectangle(x, y, width, height)
  return artboard
}

function getArtboardByName(parent, name) {
  let match = null

  parent.layers.some(artboard => {
    if (artboard.name === name) {
      match = artboard
      return true
    }
  })

  return match
}

function createArtboard(parent, name, x, y, width, height) {
  return new Artboard({
    parent,
    name,
    frame: new Rectangle(x, y, width, height)
  })
}

function empty(parent) {
  if (parent.layers.length >= 0) {
    parent.layers.forEach(layer => {
      layer.remove()
    })
  }

  return parent
}

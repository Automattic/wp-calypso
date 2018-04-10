/* eslint-env browser */

const chroma = require('chroma-js')
const compact = require('lodash/compact')
const flatten = require('lodash/flatten')

const createPaletteColors = require('../../formula')

const COLOR_WHITE = '#ffffff'
const COLOR_BLACK = '#000000'

const output = document.getElementById('output')

handleColor('#8437c2')

function handleColor(color) {
  const baseColor = chroma(color).hex()

  setBodyBackground(baseColor)
  output.innerHTML = createColorTiles(baseColor)
}

function createColorTiles(color) {
  const colors = createPaletteColors(color).filter(c => c.index > 0)

  const defaultColors = colors.filter(c => !c.auxiliary)
  const auxiliaryColors = colors.filter(c => c.auxiliary)

  const tiles = join([defaultColors, auxiliaryColors].map(colorArray => {
    const html = join(colorArray.map(createColorTile))
    return `<div class="d-flex">${html}</div>`
  }))

  return tiles
}

function setBodyBackground(color) {
  document.body.style.background = color
}

function createColorTile(colorObject) {
  const { index, color, base, auxiliary } = colorObject

  const printedIndex = join([index, auxiliary ? 'A' : ''])
  const [primaryTextColor, secondaryTextColor] = determineTextColors(color, auxiliary)

  const tileClassNames = join([
    'tile',
    base ? 'tile--base' : '',
    auxiliary ? 'tile--auxiliary' : ''
  ], ' ')

  /* eslint-disable indent */
  return join([
    `<div class="${tileClassNames} text-center" style="background: ${color}; color: ${primaryTextColor}">`,
      `<div class="tile__title font-weight-bold">`,
        printedIndex,
      '</div>',
      `<div class="tile__subtitle text-uppercase" style="color: ${secondaryTextColor}">`,
        color,
      '</div>',
    '</div>'
  ])
  /* eslint-enable indent */
}

function join(html, delimiter = '') {
  return compact(flatten(html)).join(delimiter).trim()
}

function determineTextColors(backgroundColor, auxiliary = false) {
  const hasContrast = c => chroma.contrast(backgroundColor, c) >= 6
  const fadeColor = (c, r = 0.65) => chroma.mix(backgroundColor, c, r).hex()

  let color = backgroundColor

  if (hasContrast(COLOR_WHITE)) {
    color = COLOR_WHITE
  } else {
    do {
      color = chroma(color).darken().hex()
    } while (!hasContrast(color) && color !== COLOR_BLACK)
  }

  return [
    auxiliary ? fadeColor(color, 0.85) : color,
    fadeColor(color)
  ]
}

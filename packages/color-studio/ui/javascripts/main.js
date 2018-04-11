/* eslint-env browser */

const chroma = require('chroma-js')
const compact = require('lodash/compact')
const copyToClipboard = require('copy-text-to-clipboard')
const flatten = require('lodash/flatten')
const toArray = require('lodash/toArray')

const createPaletteColors = require('../../formula')

const COLOR_WHITE = '#ffffff'
const COLOR_BLACK = '#000000'

const input = document.getElementById('base-color')
const output = document.getElementById('color-tiles')

input.addEventListener('input', event => {
  handleColor(String(event.target.value).trim())
})

setTimeout(init, 0)

function init() {
  handleRandomColor()
}

function handleColor(color) {
  let baseColor

  try {
    baseColor = chroma(color).hex()
  } catch (e) {}

  if (baseColor) {
    setBodyBackground(baseColor)
    setContent(createColorTiles(baseColor))
  } else {
    setBodyBackground(COLOR_WHITE)
    setContent()
  }
}

function handleRandomColor() {
  const color = chroma.random().hex()
  input.value = color
  handleColor(color)
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

function setContent(html = '') {
  output.innerHTML = html

  if (html) {
    activateTiles(output)
  }
}

function activateTiles(scope = document) {
  toArray(scope.getElementsByClassName('tile')).forEach(element => {
    const color = String(element.dataset.color).trim()
    element.addEventListener('click', () => copyToClipboard(color))
  })
}

function createColorTile(colorObject) {
  const { index, color, base, auxiliary } = colorObject

  const printedIndex = join([index, auxiliary ? 'A' : ''])
  const [primaryTextColor, secondaryTextColor] = determineTextColors(color, auxiliary)

  const tileClassNames = join([
    'tile',
    base ? 'tile--base' : '',
    auxiliary ? 'tile--auxiliary' : 'tile--standard'
  ], ' ')

  /* eslint-disable indent */
  return join([
    `<div class="${tileClassNames} text-center" style="background: ${color}; color: ${primaryTextColor}" data-color="${color}">`,
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

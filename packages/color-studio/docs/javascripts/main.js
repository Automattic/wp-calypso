/* eslint-env browser */

const chroma = require('chroma-js')
const compact = require('lodash/compact')
const copyToClipboard = require('copy-text-to-clipboard')
const flatten = require('lodash/flatten')
const { saveAs } = require('file-saver')
const toArray = require('lodash/toArray')
const toSketchPalette = require('../../utilities/to-sketch-palette')

const createPaletteColors = require('../../formula')
const foundations = require('../../foundations')

const COLOR_WHITE = '#ffffff'
const COLOR_BLACK = '#000000'

const input = document.getElementById('base-color')
const output = document.getElementById('color-tiles')
const button = document.getElementById('download-button')
const tiles = document.getElementById('foundation-tiles')

let currentBaseColor = null

input.addEventListener('input', event => {
  handleColor(String(event.target.value).trim())
})

setTimeout(init, 0)

function init() {
  handleRandomColor()
  button.addEventListener('click', handleButtonClick, false)

  handleFoundationTiles()
}

function handleColor(color) {
  try {
    currentBaseColor = chroma(color).hex()
  } catch (e) {
    currentBaseColor = null
  }

  setBodyBackground()
  setContent()
  setButton()
}

function handleRandomColor() {
  const color = chroma.random().hex()
  input.value = color
  handleColor(color)
}

function handleButtonClick() {
  if (!currentBaseColor) {
    return
  }

  const colors = createPaletteColors(currentBaseColor).map(c => c.color)
  const contents = toSketchPalette(colors)
  const blob = new Blob([contents], { type: 'text/plain;charset=utf-8' })
  const name = `colors-${Date.now()}-${currentBaseColor.replace('#', '')}.sketchpalette`

  saveAs(blob, name)
}

function handleFoundationTiles() {
  const html = foundations.baseColors.map(c => createColorTiles(c.value)).join('')
  tiles.innerHTML = `<div style="background: #fff; padding: 12px">${html}</div>`
}

function createColorTiles(color) {
  const colors = createPaletteColors(color)

  const defaultColors = colors.filter(c => !c.auxiliary)
  const auxiliaryColors = colors.filter(c => c.auxiliary)

  const tiles = join([defaultColors, auxiliaryColors].map(colorArray => {
    const html = join(colorArray.map(createColorTile))
    return `<div class="d-flex">${html}</div>`
  }))

  return tiles
}

function setBodyBackground() {
  document.body.style.background = currentBaseColor || COLOR_WHITE
}

function setContent() {
  if (!currentBaseColor) {
    output.innerHTML = ''
  } else {
    output.innerHTML = createColorTiles(currentBaseColor)
    activateTiles(output)
  }
}

function setButton() {
  if (!currentBaseColor) {
    button.setAttribute('disabled', '')
  } else {
    button.removeAttribute('disabled')
  }
}

function activateTiles(scope = document) {
  toArray(scope.getElementsByClassName('tile')).forEach(element => {
    const color = String(element.dataset.color).trim()
    element.addEventListener('click', () => copyToClipboard(color))
  })
}

function createColorTile(colorObject) {
  /* eslint-disable-next-line no-unused-vars */
  const { index, color, base, auxiliary } = colorObject

  const printedIndex = join([index, auxiliary ? 'A' : ''])
  const [primaryTextColor, secondaryTextColor] = determineTextColors(color, auxiliary)

  /* eslint-disable indent */
  return join([
    `<div class="tile text-center" style="background: ${color}; color: ${primaryTextColor}" data-color="${color}">`,
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

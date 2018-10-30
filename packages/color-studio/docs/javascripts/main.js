/* eslint-env browser */

const chroma = require('chroma-js')
const copyToClipboard = require('copy-text-to-clipboard')
const chunk = require('lodash/chunk')
const endsWith = require('lodash/endsWith')
const flatten = require('lodash/flatten')
const round = require('lodash/round')
const { saveAs } = require('file-saver')
const toArray = require('lodash/toArray')
const toSketchPalette = require('../../utilities/to-sketch-palette')

const createPrimaryShades = require('../../utilities/create-primary-shades')
const createSecondaryShades = require('../../utilities/create-secondary-shades')

const archive = require('../../data/colors-v0.2.1.json')
const foundations = require('../../foundations')

const COLOR_WHITE = '#ffffff'
const COLOR_BLACK = '#000000'
const SKETCH_COLOR_PICKER_ROW_COUNT = 8

const input = document.getElementById('base-color')
const output = document.getElementById('color-tiles')
const button = document.getElementById('download-button')

let currentBaseColor = null

setTimeout(init, 0)

function init() {
  if (input) {
    button.addEventListener('click', handleButtonClick)
    input.addEventListener('input', event => {
      handleColor(String(event.target.value).trim())
    })
    handleRandomColor()
  } else if (output.dataset.archive) {
    handleArchiveTiles()
  } else {
    handleFoundationTiles()
    handleFoundationButton()
  }
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

function handleButtonClick() {
  if (currentBaseColor) {
    const colors = createPrimaryShades(currentBaseColor).map(c => c.color)
    makeDownloadable(colors)
  }
}

function makeDownloadable(colors) {
  const contents = toSketchPalette(colors)
  const blob = new Blob([contents], { type: 'text/plain;charset=utf-8' })
  const name = `colors-${Date.now()}.sketchpalette`

  saveAs(blob, name)
}

function handleFoundationTiles() {
  output.innerHTML = foundations.baseColors
    .map(c => createColorTiles(c.value, c.name, c.semantic, true))
    .join('')

  activateTiles(output)
}

function handleFoundationButton() {
  const palettes = foundations.baseColors.map(color => {
    const palette = []

    createPrimaryShades(color.value).forEach(colorObject => {
      palette.unshift(colorObject.color)
    })

    while (palette.length % SKETCH_COLOR_PICKER_ROW_COUNT > 0) {
      palette.push(COLOR_WHITE)
    }

    return palette
  })

  const colors = flatten(palettes)
  button.addEventListener('click', () => {
    makeDownloadable(colors)
  })
}

function handleArchiveTiles() {
  const palette = archive.colors.filter(c => c.name !== 'White').map(color => {
    const [name, index] = color.name.split(' ')
    return {
      name,
      index: parseInt(index, 10),
      color: color.values.hex,
      auxiliary: endsWith(color.name, 'A')
    }
  })

  output.innerHTML = chunk(palette, 15)
    .map(colors => {
      const html = colors.map(color => createColorTile(color, true)).join('')
      return wrapColorTile(html, true)
    })
    .join('')

  activateTiles(output)
}

function handleRandomColor() {
  const color = chroma.random().hex()
  input.value = color
  handleColor(color)
}

function wrapColorTile(html, pad) {
  return `<div class="d-flex bg-white${pad ? ' px-1 pb-1' : ''}">${html}</div>`
}

function createColorTiles(color, name, semantic, pad) {
  const createShades = semantic ? createSecondaryShades : createPrimaryShades
  const colors = createShades(color).map(c => Object.assign({ name, semantic }, c))
  const html = colors.map(c => createColorTile(c)).join('')
  return wrapColorTile(html, pad)
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

function createColorTile(colorObject, previous = false) {
  const baseIndex = previous ? 80 : 500
  const { index, color, name, auxiliary } = colorObject

  const [primaryTextColor, secondaryTextColor] = determineTextColor(color)
  const className = `tile ${index === baseIndex ? ' tile--base' : ''} text-center`
  const title = (name && index === baseIndex ? `${name} ${index}` : index) + (auxiliary ? 'A' : '')

  /* eslint-disable indent */
  return [
    `<div class="${className}" style="background: ${color}; color: ${primaryTextColor}" data-color="${color}">`,
      `<div class="tile__title font-weight-bold">`,
        title,
      '</div>',
      `<div class="tile__meta text-uppercase" style="color: ${secondaryTextColor}">`,
        color,
      '</div>',
      `<div class="tile__meta tile__meta--tiny text-uppercase" style="color: ${secondaryTextColor}">`,
        '<span title="Contrast against white">',
          getColorProperties(color),
        '</span>',
      '</div>',
    '</div>'
  ].join('')
  /* eslint-enable indent */
}

function determineTextColor(backgroundColor) {
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

  return [color, fadeColor(color)]
}

function getColorProperties(colorValue) {
  return getContrastScore(colorValue, COLOR_WHITE)
}

function getContrastScore(foregroundColor, backgroundColor) {
  const ratio = chroma.contrast(foregroundColor, backgroundColor)
  let score = round(ratio, 1)

  if (ratio >= 7.5) {
    score = 'AAA'
  } else if (ratio >= 4.5) {
    score = 'AA'
  }

  if (ratio >= 3) {
    score += ' ✓'
  }

  return score
}

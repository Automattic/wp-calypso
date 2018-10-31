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
  /* eslint-disable no-alert, no-unreachable */
  return alert('Download is buggy and has been disabled.')
  /* eslint-enable no-alert */

  const contents = toSketchPalette(colors)
  const blob = new Blob([contents], { type: 'text/plain;charset=utf-8' })
  const name = `colors-${Date.now()}.sketchpalette`

  saveAs(blob, name)
  /* eslint-enable no-unreachable */
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

  const className = `tile ${index === baseIndex ? ' tile--base' : ''} text-center`
  const title = (name && index === baseIndex ? `${name} ${index}` : index) + (auxiliary ? 'A' : '')

  /* eslint-disable indent */
  return [
    `<div class="${className}" style="background: ${color}; color: ${determineTextColor(color)}" data-color="${color}">`,
      `<div class="tile__title font-weight-bold">`,
        title,
      '</div>',
      `<div class="tile__meta text-uppercase">`,
        color,
      '</div>',
      `<div class="tile__meta tile__meta--tiny text-uppercase pt-1">`,
        getColorProperties(color),
      '</div>',
    '</div>'
  ].join('')
  /* eslint-enable indent */
}

function determineTextColor(backgroundColor) {
  const ratio = chroma.contrast(COLOR_WHITE, backgroundColor)
  return ratio > 4.5 ? COLOR_WHITE : COLOR_BLACK
}

function getColorProperties(colorValue) {
  return [
    getContrastScore(COLOR_BLACK, colorValue, 'B'),
    getContrastScore(COLOR_WHITE, colorValue, 'W')
  ].join(' &nbsp; ')
}

function getContrastScore(foregroundColor, backgroundColor, prefix) {
  const ratio = chroma.contrast(foregroundColor, backgroundColor)
  let score = round(ratio, 2)

  if (ratio >= 7.5) {
    score = 'AAA'
  } else if (ratio >= 4.5) {
    score = 'AA'
  }

  if (prefix) {
    score = [prefix, score].join(':')
  }

  return `<span style="color: ${foregroundColor}" title="${ratio}">${score}</span>`
}

/* eslint-env browser */

const chroma = require('chroma-js')

const createPrimaryShades = require('../../utilities/create-primary-shades')
const createSecondaryShades = require('../../utilities/create-secondary-shades')
const { hotten } = require('../../utilities/base-color-helpers')
const toSketchPalette = require('../../utilities/to-sketch-palette')

const { activateTiles, makeDownloadable } = require('./shared/shared')
const renderTile = require('./shared/render-tile')

const input = document.getElementById('base-color')
const output = document.getElementById('color-tiles')
const button = document.getElementById('download-button')

let currentBaseColor = null
let currentShades = null

setTimeout(init, 0)

function init() {
  button.addEventListener('click', handleButtonClick)
  input.addEventListener('input', event => {
    handleColor(String(event.target.value).trim())
  })
  handleRandomColor()
}

function handleColor(color) {
  try {
    currentBaseColor = chroma(color).hex()
    currentShades = [
      createPrimaryShades(color),
      createSecondaryShades(hotten(color))
    ]
  } catch (e) {
    currentBaseColor = null
    currentShades = null
  }

  setBodyBackground()
  setContent()
  setButton()
}

function handleButtonClick() {
  if (currentBaseColor && currentShades) {
    const colors = currentShades.map(colorArray => colorArray.map(c => c.value))
    makeDownloadable(toSketchPalette(colors))
  }
}

function handleRandomColor() {
  const color = chroma.random().hex()
  input.value = color
  handleColor(color)
}

function createColorTiles() {
  return currentShades.map(colorArray => {
    const html = colorArray.map(createColorTile).join('')
    return `<div class="d-flex bg-white pb-1">${html}</div>`
  }).join('')
}

function setBodyBackground() {
  document.body.style.background = currentBaseColor || '#fff'
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

function createColorTile(colorObject) {
  const { index, value } = colorObject

  return renderTile(index === 500, index, value)
}

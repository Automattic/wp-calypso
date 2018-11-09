/* eslint-env browser */

const PALETTE = require('../../dist/colors.json')
const SKETCH_PALETTE = require('../../dist/colors.sketchpalette')

const { activateTiles, makeDownloadable } = require('./shared/shared')
const renderTile = require('./shared/render-tile')

const output = document.getElementById('color-tiles')
const button = document.getElementById('download-button')

handleFoundationTiles()
handleFoundationButton()

function handleFoundationTiles() {
  const colors = PALETTE.colors.map(colorArray => {
    const html = colorArray.map(createColorTile).join('')
    return `<div class="d-flex pb-1">${html}</div>`
  })

  output.innerHTML = colors.join('')
  activateTiles(output)
}

function handleFoundationButton() {
  button.addEventListener('click', () => {
    makeDownloadable(SKETCH_PALETTE)
  })
}

function createColorTile(colorObject) {
  const base = colorObject._meta.baseColor
  const name = base ? colorObject.name : colorObject._meta.shadeIndex

  return renderTile(base, name, colorObject.value)
}

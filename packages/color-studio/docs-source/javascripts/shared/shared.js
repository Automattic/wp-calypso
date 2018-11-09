/* eslint-env browser */

const copyToClipboard = require('copy-text-to-clipboard')
const { saveAs } = require('file-saver')
const toArray = require('lodash/toArray')

function activateTiles(scope = document) {
  toArray(scope.getElementsByClassName('tile')).forEach(element => {
    const color = String(element.dataset.color).trim()
    element.addEventListener('click', () => copyToClipboard(color))
  })
}

function makeDownloadable(contents) {
  const blob = new Blob([contents], { type: 'text/plain;charset=utf-8' })
  const name = `colors-${Date.now()}.sketchpalette`

  saveAs(blob, name)
}

module.exports = {
  activateTiles,
  makeDownloadable
}

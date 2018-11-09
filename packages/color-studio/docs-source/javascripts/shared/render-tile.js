/* eslint-env browser */

const chroma = require('chroma-js')
const round = require('lodash/round')

const COLOR_WHITE = '#ffffff'
const COLOR_BLACK = '#000000'

module.exports = (base, name, value) => {
  const className = `tile ${base ? ' tile--base' : ''} text-center`
  const textColor = determineTextColor(value)

  /* eslint-disable indent */
  return [
    `<div class="${className}" style="background: ${value}; color: ${textColor}" data-color="${value}">`,
      `<div class="tile__title font-weight-bold">`,
        name,
      '</div>',
      `<div class="tile__meta text-uppercase">`,
        value,
      '</div>',
      `<div class="tile__meta tile__meta--tiny text-uppercase pt-1">`,
        getColorProperties(value),
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

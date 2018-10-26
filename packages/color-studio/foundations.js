const chroma = require('chroma-js')
const flatten = require('lodash/flatten')

const values = {
  gray: '#707070',
  blue: '#016087',
  pink: '#c54475',
  red: '#d21d3e',
  yellow: '#dbb422',
  green: '#0d7d2e'
}

const derivatives = []

module.exports = {
  baseColors: flatten([
    {
      name: 'Gray',
      value: mix(values.gray, values.blue, 0.2)
    },
    createColorPair({
      name: 'Blue',
      value: values.blue
    }),
    {
      name: 'Purple',
      value: mix(values.blue, values.pink)
    },
    createColorPair({
      name: 'Pink',
      value: values.pink
    }),
    createColorPair({
      name: 'Red',
      value: values.red
    }),
    {
      name: 'Orange',
      value: mix(values.red, values.yellow)
    },
    createColorPair({
      name: 'Yellow',
      value: values.yellow
    }),
    createColorPair({
      name: 'Green',
      value: values.green
    }),
    derivatives
  ])
}

function mix(color1, color2, ratio = 0.5) {
  return chroma.mix(color1, color2, ratio, 'lch').hex()
}

function createColorPair(colorObject) {
  const semanticObject = Object.assign({}, colorObject, {
    name: `Hot ${colorObject.name}`,
    value: chroma(colorObject.value).saturate(1.5).hex(),
    semantic: true
  })

  derivatives.push(semanticObject)
  return colorObject
}

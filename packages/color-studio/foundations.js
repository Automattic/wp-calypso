const chroma = require('chroma-js')
const flatten = require('lodash/flatten')

const values = {
  gray: '#707070',
  green: '#108440',
  blue: '#016087',
  pink: '#c54475',
  red: '#cf1c3d',
  yellow: '#dbb422'
}

const derivatives = []

module.exports = {
  baseColors: flatten([
    {
      name: 'Gray',
      value: mix(values.gray, values.blue, 0.2)
    },
    createColorPair({
      name: 'Green',
      value: values.green
    }),
    {
      name: 'Celadon',
      value: mix(values.blue, values.green, 0.6)
    },
    createColorPair({
      name: 'Blue',
      value: values.blue
    }),
    {
      name: 'Purple',
      value: mix(values.blue, values.pink, 0.6)
    },
    createColorPair({
      name: 'Pink',
      value: values.pink
    }),
    createColorPair({
      name: 'Red',
      value: values.red
    }),
    createColorPair({
      name: 'Orange',
      value: mix(values.red, values.yellow)
    }),
    createColorPair({
      name: 'Yellow',
      value: values.yellow
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

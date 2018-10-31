const chroma = require('chroma-js')
const flatten = require('lodash/flatten')

const values = {
  gray: '#707070',
  hotGreen: '#008a00',
  blue: '#016087',
  hotPink: '#d52c82',
  hotRed: '#eb0001',
  hotYellow: '#f6c200'
}

values.green = colden(values.hotGreen)
values.hotBlue = hotten(values.blue)
values.pink = colden(values.hotPink)
values.red = colden(values.hotRed)
values.yellow = colden(values.hotYellow)

values.gray = mix(values.gray, values.blue, 0.2)
values.celadon = mix(values.blue, values.green, 0.6)
values.purple = mix(values.blue, values.pink, 0.6)
values.orange = mix(values.red, values.yellow)
values.hotOrange = mix(values.hotRed, values.hotYellow)

module.exports = {
  baseColors: flatten([
    {
      name: 'Gray',
      value: values.gray
    },
    {
      name: 'Green',
      value: values.green
    },
    {
      name: 'Celadon',
      value: values.celadon
    },
    {
      name: 'Blue',
      value: values.blue
    },
    {
      name: 'Purple',
      value: values.purple
    },
    {
      name: 'Pink',
      value: values.pink
    },
    {
      name: 'Red',
      value: values.red
    },
    {
      name: 'Orange',
      value: values.orange
    },
    {
      name: 'Yellow',
      value: values.yellow
    },
    {
      name: 'Hot Blue',
      value: values.hotBlue,
      semantic: true
    },
    {
      name: 'Hot Pink',
      value: values.hotPink,
      semantic: true
    },
    {
      name: 'Hot Red',
      value: values.hotRed,
      semantic: true
    },
    {
      name: 'Hot Orange',
      value: values.hotOrange,
      semantic: true
    },
    {
      name: 'Hot Yellow',
      value: values.hotYellow,
      semantic: true
    },
    {
      name: 'Hot Green',
      value: values.hotGreen,
      semantic: true
    }
  ])
}

function mix(color1, color2, ratio = 0.5) {
  return chroma.mix(color1, color2, ratio, 'lch').hex()
}

function hotten(color) {
  return chroma(color).darken(0.2).saturate(2).hex()
}

function colden(color) {
  return chroma(color).set('hsl.s', '*0.75').desaturate(0.2).hex()
}

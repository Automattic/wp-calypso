const chroma = require('chroma-js')

module.exports = {
  colden: color => {
    return chroma(color).set('hsl.s', '*0.75').desaturate(0.2).hex()
  },

  hotten: color => {
    return chroma(color).darken(0.2).saturate(2).hex()
  },

  mix: (color1, color2, ratio = 0.5) => {
    return chroma.mix(color1, color2, ratio, 'lch').hex()
  }
}

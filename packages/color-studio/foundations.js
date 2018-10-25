const chroma = require('chroma-js')

module.exports = {
  baseColors: [
    {
      name: 'Gray',
      value: chroma.mix('#707070', '#016087', 0.2, 'lch').hex()
    },
    {
      name: 'Blue',
      value: '#016087'
    },
    {
      name: 'Purple',
      value: '#794689'
    },
    {
      name: 'Red',
      value: '#dd3c57'
    },
    {
      name: 'Orange',
      value: '#df762f'
    },
    {
      name: 'Yellow',
      value: '#dbb21b'
    },
    {
      name: 'Hot Pink',
      value: '#d52b82'
    },
    {
      name: 'Hot Red',
      value: '#eb0001'
    },
    {
      name: 'Hot Yellow',
      value: '#f6c200'
    },
    {
      name: 'Hot Green',
      value: '#008a00'
    }
  ],

  textPresets: [
    {
      fontFamily: 'Noto Sans',
      fontSize: 12,
      lineHeight: 17,
      letterSpacing: 0
    },
    {
      fontFamily: 'Noto Sans',
      fontSize: 13,
      lineHeight: 19,
      letterSpacing: 0
    },
    {
      fontFamily: 'Noto Sans',
      fontSize: 14,
      lineHeight: 22,
      letterSpacing: 0
    },
    {
      fontFamily: 'Noto Sans',
      fontSize: 16,
      lineHeight: 26,
      letterSpacing: 0
    },
    {
      fontFamily: 'Noto Sans',
      fontSize: 19,
      lineHeight: 30,
      letterSpacing: 0
    },
    {
      fontFamily: 'Noto Sans',
      fontSize: 23,
      lineHeight: 35,
      letterSpacing: -0.35
    },
    {
      fontFamily: 'Noto Sans',
      fontSize: 30,
      lineHeight: 45,
      letterSpacing: -0.5
    },
    {
      fontFamily: 'Noto Sans',
      fontSize: 36,
      lineHeight: 52,
      letterSpacing: -0.65
    },
    {
      fontFamily: 'Noto Sans',
      fontSize: 43,
      lineHeight: 59,
      letterSpacing: -0.85
    },
    {
      fontFamily: 'Noto Sans',
      fontSize: 51,
      lineHeight: 68,
      letterSpacing: -1.15
    },
    {
      fontFamily: 'Noto Sans',
      fontSize: 61,
      lineHeight: 78,
      letterSpacing: -1.5
    }
  ]
}

const chroma = require('chroma-js')
const clone = require('lodash/clone')
const flatten = require('lodash/flatten')
const uniq = require('lodash/uniq')
const zip = require('lodash/zip')

const BLEND_MODE_NORMAL = 'normal'
const BLEND_MODE_HARD_LIGHT = 'hard light'
const BLEND_MODE_SOFT_LIGHT = 'soft light'

const COLOR_WHITE = '#fff'
const COLOR_BLACK = '#000'

const BRIGHT_STEP_DEFINITIONS = [
  [ // Shade 10
    { mode: BLEND_MODE_HARD_LIGHT, color: COLOR_WHITE, ratio: 0.4  },
    { mode: BLEND_MODE_SOFT_LIGHT, color: COLOR_WHITE, ratio: 1    },
    { mode: BLEND_MODE_NORMAL,     color: COLOR_WHITE, ratio: 0.77 }
  ],
  [ // Shade 20
    { mode: BLEND_MODE_HARD_LIGHT, color: COLOR_WHITE, ratio: 0.3  },
    { mode: BLEND_MODE_SOFT_LIGHT, color: COLOR_WHITE, ratio: 1    },
    { mode: BLEND_MODE_NORMAL,     color: COLOR_WHITE, ratio: 0.50 }
  ],
  [ // Shade 30
    { mode: BLEND_MODE_HARD_LIGHT, color: COLOR_WHITE, ratio: 0.25 },
    { mode: BLEND_MODE_SOFT_LIGHT, color: COLOR_WHITE, ratio: 1    },
    { mode: BLEND_MODE_NORMAL,     color: COLOR_WHITE, ratio: 0.30 }
  ],
  [ // Shade 40
    { mode: BLEND_MODE_HARD_LIGHT, color: COLOR_WHITE, ratio: 0.2  },
    { mode: BLEND_MODE_SOFT_LIGHT, color: COLOR_WHITE, ratio: 0.8  },
    { mode: BLEND_MODE_NORMAL,     color: COLOR_WHITE, ratio: 0.15 }
  ],
  [ // Shade 50
    { mode: BLEND_MODE_HARD_LIGHT, color: COLOR_WHITE, ratio: 0.15 },
    { mode: BLEND_MODE_SOFT_LIGHT, color: COLOR_WHITE, ratio: 0.6  },
    { mode: BLEND_MODE_NORMAL,     color: COLOR_WHITE, ratio: 0.1  }
  ],
  [ // Shade 60
    { mode: BLEND_MODE_HARD_LIGHT, color: COLOR_WHITE, ratio: 0.1  },
    { mode: BLEND_MODE_SOFT_LIGHT, color: COLOR_WHITE, ratio: 0.4  },
    { mode: BLEND_MODE_NORMAL,     color: COLOR_WHITE, ratio: 0.05 }
  ],
  [ // Shade 70
    { mode: BLEND_MODE_HARD_LIGHT, color: COLOR_WHITE, ratio: 0.05 },
    { mode: BLEND_MODE_SOFT_LIGHT, color: COLOR_WHITE, ratio: 0.2  },
    { mode: BLEND_MODE_NORMAL,     color: COLOR_WHITE, ratio: 0.02 }
  ]
]

const DARK_STEP_DEFINITIONS = [
  [ // Shade 90,
    { mode: BLEND_MODE_NORMAL,     color: COLOR_BLACK, ratio: 0.12 },
    { mode: BLEND_MODE_SOFT_LIGHT, color: COLOR_WHITE, ratio: 0.07 }
  ],
  [ // Shade 100
    { mode: BLEND_MODE_NORMAL,     color: COLOR_BLACK, ratio: 0.24 },
    { mode: BLEND_MODE_SOFT_LIGHT, color: COLOR_WHITE, ratio: 0.14 }
  ],
  [ // Shade 110
    { mode: BLEND_MODE_NORMAL,     color: COLOR_BLACK, ratio: 0.36 },
    { mode: BLEND_MODE_SOFT_LIGHT, color: COLOR_WHITE, ratio: 0.21 }
  ],
  [ // Shade 120
    { mode: BLEND_MODE_NORMAL,     color: COLOR_BLACK, ratio: 0.48 },
    { mode: BLEND_MODE_SOFT_LIGHT, color: COLOR_WHITE, ratio: 0.28 }
  ],
  [ // Shade 130
    { mode: BLEND_MODE_NORMAL,     color: COLOR_BLACK, ratio: 0.6  },
    { mode: BLEND_MODE_SOFT_LIGHT, color: COLOR_WHITE, ratio: 0.35 }
  ],
  [ // Shade 140
    { mode: BLEND_MODE_NORMAL,     color: COLOR_BLACK, ratio: 0.72 },
    { mode: BLEND_MODE_SOFT_LIGHT, color: COLOR_WHITE, ratio: 0.42 }
  ],
  [ // Shade 150
    { mode: BLEND_MODE_NORMAL,     color: COLOR_BLACK, ratio: 0.84 },
    { mode: BLEND_MODE_SOFT_LIGHT, color: COLOR_WHITE, ratio: 0.56 }
  ]
]

module.exports = createPaletteColors

function createPaletteColors(baseColor, baseColorName) {
  const brightShades = blendColorWithDefinitions(baseColor, BRIGHT_STEP_DEFINITIONS)
  const darkShades   = blendColorWithDefinitions(baseColor, DARK_STEP_DEFINITIONS)

  const correctedDarkShades   = correctLightness(baseColor, darkShades)
  const correctedBrightShades = correctLightness(brightShades, baseColor)
  correctedBrightShades.unshift(chroma(COLOR_WHITE).hex())

  const standardPalette = uniq(correctedBrightShades.concat(correctedDarkShades)).map((color, index) => {
    const colorIndex = index * 10
    const colorObject = {
      color,
      index: colorIndex,
      base: colorIndex === 80,
      auxiliary: false
    }

    if (baseColorName) {
      colorObject.name = baseColorName
    }

    return colorObject
  })

  const auxiliaryPalette = standardPalette.map(colorObject => {
    const copy = clone(colorObject)
    copy.color = chroma(copy.color).desaturate(1).hex()
    copy.auxiliary = true
    return copy
  })

  if (baseColorName === 'gray') {
    return standardPalette
  }
  return standardPalette.concat(auxiliaryPalette)
}

function blendColorWithDefinitions(baseColor, definitions) {
  return definitions.map(definition => blendColorIngredients(baseColor, definition))
}

function correctLightness(...colors) {
  const colorArray = flatten(colors)
  return chroma.scale(colorArray).correctLightness().colors(colorArray.length)
}

function blendColorIngredients(baseColor, ingredients) {
  return ingredients.reduce((color, ingredient) => {
    return blendColorWith(color, ingredient.color, ingredient.ratio, ingredient.mode)
  }, baseColor)
}

function blendColorWith(bottomColor, topColor, ratio, mode) {
  switch (mode) {
    case BLEND_MODE_NORMAL:
      return blendColorWithNormal(bottomColor, topColor, ratio)
    case BLEND_MODE_SOFT_LIGHT:
      return blendColorWithSoftLight(bottomColor, topColor, ratio)
    case BLEND_MODE_HARD_LIGHT:
      return blendColorWithHardLight(bottomColor, topColor, ratio)
    default:
      throw new Error('Unknown blend mode')
  }
}

function blendColorWithNormal(bottomColor, topColor, ratio) {
  return (ratio >= 1) ? topColor : chroma.mix(bottomColor, topColor, ratio).hex()
}

function blendColorWithHardLight(bottomColor, topColor, ratio) {
  const blend = chroma.blend(topColor, bottomColor, 'overlay').hex()
  return blendColorWithNormal(bottomColor, blend, ratio)
}

function blendColorWithSoftLight(bottomColor, topColor, ratio) {
  const rgb = zip(extractRGB(bottomColor), extractRGB(topColor)).map(pair => {
    const [a, b] = pair
    // Using Pegtop’s formula borrowed from
    // https://en.wikipedia.org/wiki/Blend_modes#Soft_Light
    return (1 - 2 * b) * Math.pow(a, 2) + 2 * b * a
  })

  const blend = chroma(rgb.map(c => Math.round(c * 255))).hex()
  return blendColorWithNormal(bottomColor, blend, ratio)
}

function extractRGB(color) {
  return chroma(color).rgb(false).map(c => c / 255)
}

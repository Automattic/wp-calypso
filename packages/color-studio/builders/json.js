const BASE_COLORS = require('../data/base-colors')
const PACKAGE = require('../package.json')

const createPrimaryShades = require('../utilities/create-primary-shades')
const createSecondaryShades = require('../utilities/create-secondary-shades')

const paletteColors = BASE_COLORS.map(colorObject => {
  let shades = []

  if (colorObject.formula === 'primary') {
    shades = createPrimaryShades(colorObject.value)
  } else if (colorObject.formula === 'secondary') {
    shades = createSecondaryShades(colorObject.value)
  } else {
    throw new Error('Unknown formula')
  }

  return formatShades(colorObject, shades)
})

const paletteData = {
  version: PACKAGE.version,
  colors: paletteColors
}

print(paletteData)

function formatShades(baseColorObject, shades) {
  const result = []

  shades.forEach(colorObject => {
    result.push({
      name: `${baseColorObject.name} ${colorObject.index}`,
      value: colorObject.value,
      _meta: {
        baseColor: colorObject.value === baseColorObject.value,
        baseName: baseColorObject.name,
        colorFormula: baseColorObject.formula,
        shadeIndex: colorObject.index
      }
    })
  })

  return result
}

function print(data) {
  console.log(JSON.stringify(data, null, 2))
}

const createPrimaryShades = require('./utilities/create-primary-shades')

module.exports = (baseColor, baseColorName = '') => {
  const palette = createPrimaryShades(baseColor)

  if (!baseColorName) {
    return palette
  }

  return palette.map(color => Object.assign({ name: baseColorName }, color))
}

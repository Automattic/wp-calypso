const React = require('react')
const { Artboard, Page, render, TextStyles, View } = require('react-sketchapp')

const createPaletteColors = require('../formula')
const FOUNDATIONS = require('../foundations')

const PALETTE_COLORS = FOUNDATIONS.baseColors.map(color => {
  return createPaletteColors(color.value, color.name)
})

const swatches = [
  {
    name: 'None',
    color: 'transparent',
    x: 1,
    y: 0
  },
  {
    name: 'White',
    color: '#fff',
    x: 0,
    y: 0
  }
]

PALETTE_COLORS.forEach((colors, y) => {
  colors.forEach((color, x) => {
    if (color.index <= 0) {
      return
    }
    swatches.push({
      name: `${color.name} ${color.index}${color.auxiliary ? 'A' : ''}`.trim(),
      color: color.color,
      x: x - (color.auxiliary ? 2 : 1),
      y: y + 1
    })
  })
})

const textStyles = {}
const textColors = swatches.filter(swatch => ['White', 'Gray 70', 'Gray 150'].includes(swatch.name))
const textWeights = [400, 700]
const textAlignments = [
  {
    direction: 'left',
    suffix: ''
  },
  {
    direction: 'center',
    suffix: '↔'
  },
  {
    direction: 'right',
    suffix: '→'
  }
]

FOUNDATIONS.textPresets.forEach(preset => {
  textAlignments.forEach(alignment => {
    textWeights.forEach(weight => {
      textColors.forEach(color => {
        const textStyleName = `${preset.fontFamily} ${preset.fontSize}/${color.name}/${weight} ${alignment.suffix}`.trim()
        textStyles[textStyleName] = Object.assign({}, preset, {
          fontWeight: weight,
          textAlign: alignment.direction,
          color: color.color
        })
      })
    })
  })
})

const Swatch = ({ name, color, x, y }) => (
  <Artboard name={`Color/${name.replace(' ', '/')}`} style={{ position: 'absolute', top: y * 60, left: x * 60 }}>
    <View name="bg" style={{ height: 48, width: 48, backgroundColor: color }} />
  </Artboard>
)

const Document = () => (
  <Page>
    {swatches.map(swatch => (
      <Swatch key={swatch.name} name={swatch.name} color={swatch.color} x={swatch.x} y={swatch.y} />
    ))}
  </Page>
)

export default context => {
  TextStyles.create({ context, clearExistingStyles: true }, textStyles)
  render(<Document />, context.document.currentPage())
}

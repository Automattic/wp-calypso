module.exports = value => {
  const hex = value.toLowerCase()
  const h = hex.split('')

  if (h.length === 7 && h[1] === h[2] && h[3] === h[4] && h[5] === h[6]) {
    return [0, 1, 3, 5].map(i => h[i]).join('')
  }

  return hex
}

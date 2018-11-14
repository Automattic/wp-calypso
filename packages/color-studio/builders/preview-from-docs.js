const path = require('path')
const puppeteer = require('puppeteer')

const INPUT_PATH = path.join(__dirname, '../docs/index.html')
const OUTPUT_PATH = path.join(__dirname, '../dist/meta/preview.png')

generatePreview()

async function generatePreview() {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  await page.setViewport({
    width: 1500,
    height: 100,
    deviceScaleFactor: 2
  })

  await page.goto(`file://${INPUT_PATH}`)
  await page.evaluate(() => {
    /* eslint-env browser */

    // Keep the colors only
    const element = document.getElementById('download')
    element.parentNode.removeChild(element)

    // Find every single tile and turn on their preview styling
    const elements = document.getElementsByClassName('tile')
    Array.from(elements).forEach(element => {
      element.classList.add('tile--preview')
    })
  })

  await page.screenshot({
    path: OUTPUT_PATH,
    fullPage: true
  })

  await browser.close()
}

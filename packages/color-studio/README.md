[dist-extensions]: dist/extensions/
[dist-json]: dist/colors.json
[dist-preview]: dist/meta/preview.png
[dist-scss]: dist/colors.scss
[dist-sketchpalette]: dist/colors.sketchpalette

[docs-custom]: https://automattic.github.io/color-studio/custom.html
[docs-index]: https://automattic.github.io/color-studio/

# Color Studio

> The computational color palette for Muriel, our design language system.

[![Color palette preview][dist-preview]][docs-index]

## What’s Included

Color Studio generates the following:

* [Online documentation][docs-index] with click-to-copy hex values.
* [Stylesheet partial][dist-scss] with all colors defined as SCSS variables that can be [imported](#usage-in-projects) inside any project.
* [Sketch palette file][dist-sketchpalette] that can be imported using the [Sketch Palettes](https://github.com/andrewfiorillo/sketch-palettes) plugin.
* [Custom color tester][docs-custom] that runs Color Studio’s formula against any specified value.

Also included:

* [JSON file][dist-json] with all the color values for [further use](#usage-in-projects).
* The preview image and [extensions][dist-extensions].

## Usage in Projects

```sh
yarn add automattic/color-studio
```

This package is dependency-free.

### SCSS

```scss
@import "color-studio";

button {
  background: $muriel-hot-pink-500;
  color: $muriel-white;
}
```

### JavaScript

```js
const PALETTE = require('color-studio')
```

The above imports the contents of the [JSON file][dist-json].

## Development

```sh
# Generate the JSON file, the stylesheet partial, and the Sketch palette file.
yarn palette

# Build the documentation assets from `docs-source`
yarn docs
yarn docs:watch

# Build and link the Sketch extension
yarn sketch
yarn sketch:watch

# Generate the preview image (by taking a screenshot of the documentation)
yarn meta
```

All those commands run automatically before every commit. So does the linter.

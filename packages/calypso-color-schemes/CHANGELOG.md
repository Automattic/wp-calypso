# Release Notes

## 2.0.0

This update brings backwards-incompatible changes to the package. The most notable ones include:

* Updated [Color Studio](https://color-studio.blog), the primary dependency, to the most recent version.
* Following the [files](https://github.com/Automattic/color-studio/blob/master/dist/color-properties.css) [generated](https://github.com/Automattic/color-studio/blob/master/dist/color-properties-rgb.css) by Color Studio, updated all properties to use consistent names (including index numbers).
* Phased out all SCSS variables in favor of CSS custom properties.
* Refactored the existing component-specific properties and prefixed all theme variables with `--color`.
* Introduced `-inverted` properties.
* Split all color schemes into separate partial files.

For more details, please refer to Calypso’s [color guide](https://github.com/Automattic/wp-calypso/blob/update/colors/docs/color.md) or the [default color scheme](https://github.com/Automattic/wp-calypso/blob/master/packages/calypso-color-schemes/src/shared/color-schemes/_default.scss).

## 1.0.0

The initial version.

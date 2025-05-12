# Release Notes

## Unreleased

- Clean up all definitions and usages of CSS variables ending with -rgb.

## 3.1.3

- Add a new color for Threads.

## 3.1.2

- Added a new color for X.
- Added a new color for Bluesky.

## 3.1.1

- Republish unbuilt version.

## 3.1.0

- Updated colors for checkout.
- Added a new color for Nextdoor.
- Added `root-only` entry point.

## 3.0.0

- Added a new color for Mastodon.
- Switched from `node-sass` to `sass` (Dart Sass) for processing Sass files.
  - Removed dependency `node-sass`
  - Added dependency `sass ^1.32.13`
- Updated dependencies:
  - postcss to `^8.2.15`
  - node-sass to `^6.0.0`

## 2.1.1

- Updated the color palette to the most recent version.
- Updated `--color-simplenote` with the new brand color.

## 2.1.0

- Updated the color palette to the most recent version.
- Added the following RGB counterparts of the existing properties:
  - `--color-jetpack-onboarding-background-rgb`
  - `--color-jetpack-onboarding-text-rgb`
- Removed the following properties:
  - `--color-section-nav-item-background-hover`
  - `--color-themes-active-text`
  - `--color-themes-active-text-rgb`

## 2.0.2

- Included missing SCSS dependencies in the published package.

## 2.0.1

- Included WP Admin button colors.

## 2.0.0

This update brings backwards-incompatible changes to the package. The most notable ones include:

- Updated [Color Studio](https://color-studio.blog), the primary dependency, to the most recent version.
- Following the [files](https://github.com/Automattic/color-studio/blob/HEAD/dist/color-properties.css) [generated](https://github.com/Automattic/color-studio/blob/HEAD/dist/color-properties-rgb.css) by Color Studio, updated all properties to use consistent names (including index numbers).
- Phased out all SCSS variables in favor of CSS custom properties.
- Refactored the existing component-specific properties and prefixed all theme variables with `--color`.
- Introduced semantic `-inverted` properties which are the successor to `--color-white`.
- Split all color schemes into separate partial files.

For more details, please refer to Calypso’s [color guide](https://github.com/Automattic/wp-calypso/blob/update/colors/docs/color.md) or the [default color scheme](https://github.com/Automattic/wp-calypso/blob/HEAD/packages/calypso-color-schemes/src/shared/color-schemes/_default.scss).

## 1.0.0

The initial version.

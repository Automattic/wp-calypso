# Changelog

## Unreleased

- Set `color` alongside `fill` on the search button, suggestion, match-reason, bundle and banner chevron icons, so icons drawn with `currentColor` (such as stroke-drawn `@wordpress/icons`) keep their colors.
- Require `@wordpress/icons` ^20.0.0, whose icons are drawn with strokes that take their color from `color` rather than `fill`.

## 1.0.1

- Declare React 19 compatibility for package consumers (#111721).

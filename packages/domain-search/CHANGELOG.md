# Changelog

## Unreleased

- Breaking: Require `@wordpress/components` ^45.0.0, `@wordpress/compose` ^9.2.0, `@wordpress/data` ^11.2.0, `@wordpress/element` ^10.2.0, `@wordpress/primitives` ^5.2.0 and `@wordpress/ui` ^0.27.0.
- Show the stroke-drawn `caution` icon on unavailable results and suggestion errors, since `@wordpress/icons` 21 removes `cautionFilled`.
- Trim hyphens from domain input without a regular expression that slows down on long runs of hyphens.
- Set `color` alongside `fill` on the search button, suggestion, match-reason, bundle and banner chevron icons, so icons drawn with `currentColor` (such as stroke-drawn `@wordpress/icons`) keep their colors.
- Require `@wordpress/icons` ^21.0.0, whose icons are drawn with strokes that take their color from `color` rather than `fill`.

## 1.0.1

- Declare React 19 compatibility for package consumers (#111721).

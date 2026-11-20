# Changelog

## Unreleased

- Breaking: Require `@wordpress/api-fetch` ^8.2.0, `@wordpress/components` ^45.0.0, `@wordpress/data` ^11.2.0, `@wordpress/element` ^10.2.0, `@wordpress/i18n` ^7.2.0, `@wordpress/react-i18n` ^5.2.0 and `@wordpress/url` ^5.2.0.
- Strip trailing punctuation from links without a regular expression that slows down on long runs of punctuation.
- Require `@wordpress/icons` ^21.0.0, whose icons are drawn with strokes that take their color from `color` rather than `fill`.

## 1.0.1

- Declare React 19 compatibility for package consumers (#111721).

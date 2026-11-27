# Changelog

## Unreleased

- Breaking: Require `@wordpress/api-fetch` 8.2.0, `@wordpress/components` ^45.0.0, `@wordpress/data` ^11.2.0, `@wordpress/element` ^10.2.0, `@wordpress/html-entities` ^5.2.0, `@wordpress/i18n` ^7.2.0, `@wordpress/react-i18n` ^5.2.0 and `@wordpress/url` ^5.2.0.
- Draw the attachment preview's remove control as a round badge around `closeSmall`, since `@wordpress/icons` 21 removes `cancelCircleFilled`.
- Require `@wordpress/icons` ^21.0.0, whose icons are drawn with strokes that take their color from `color` rather than `fill`.
- Remove the unused `autosize` and `@types/autosize` dependencies.

## 1.0.1

- Declare React 19 compatibility for package consumers (#111721).

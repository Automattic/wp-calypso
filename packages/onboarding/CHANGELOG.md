# Changelog

## Unreleased

### Breaking changes

- Require `@wordpress/components` ^45.0.0, `@wordpress/compose` ^9.2.0, `@wordpress/data` ^11.2.0, `@wordpress/i18n` ^7.2.0, `@wordpress/react-i18n` ^5.2.0, `@wordpress/ui` ^0.27.0 and `@wordpress/url` ^5.2.0.
- Remove `READYMADE_TEMPLATE_FLOW` and `isReadymadeFlow`. The flow they named has been removed.

### Other changes

- Color the loading wireframe's progress fill with `--wpds-color-background-indicator-neutral` too, which `@wordpress/components` 45 and `@wordpress/ui` 0.27 progress bars read.
- Require `@wordpress/icons` ^21.0.0, whose icons are drawn with strokes that take their color from `color` rather than `fill`.

## 1.0.1

- Declare React 19 compatibility for package consumers (#111721).

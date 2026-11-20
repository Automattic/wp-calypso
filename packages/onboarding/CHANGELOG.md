# Changelog

## Unreleased

### Breaking changes

- Remove `READYMADE_TEMPLATE_FLOW` and `isReadymadeFlow`. The flow they named has been removed.

### Other changes

- Color the loading wireframe's progress fill with `--wpds-color-background-indicator-neutral` too, which `@wordpress/components` 45 and `@wordpress/ui` 0.27 progress bars read.
- Require `@wordpress/icons` ^20.0.0, whose icons are drawn with strokes that take their color from `color` rather than `fill`.

## 1.0.1

- Declare React 19 compatibility for package consumers (#111721).

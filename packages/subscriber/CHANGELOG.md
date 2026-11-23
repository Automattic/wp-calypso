## trunk

- Breaking: Require `@wordpress/base-styles` ^15.1.0, `@wordpress/components` ^45.0.0, `@wordpress/data` ^11.2.0, `@wordpress/dom` ^5.2.0, `@wordpress/element` ^10.2.0, `@wordpress/i18n` ^7.2.0, `@wordpress/primitives` ^5.2.0 and `@wordpress/react-i18n` ^5.2.0.
- Stop depending on `react-popper` and `@popperjs/core`, which the package never imports.
- Require `@wordpress/icons` ^21.0.0, whose icons are drawn with strokes that take their color from `color` rather than `fill`.

## 0.0.2

- Declare React 19 compatibility for package consumers (#111721).

## 0.0.1

- Initial release

## Unreleased

### Breaking Changes

- `Icon`: Remove component. Use `Icon` from `@wordpress/ui` instead.

### Enhancements

- `Stepper`, `VerticalStepper`, `HorizontalStepper`: Add Stepper component suite with vertical and horizontal orientations, step indicators, linear flow support, and accessible ARIA semantics ([#111036](https://github.com/Automattic/wp-calypso/pull/111036)).

## 1.0.3

- Declare React 19 compatibility for package consumers (#111721).

## 1.0.2

### Enhancements

- `DateCalendar` and `DateRangeCalendar`: Ensure proper stacking context and background to support pseudo-element selection styles ([#104401](https://github.com/Automattic/wp-calypso/pull/104401)).

## 1.0.1

### Bug Fixes

- I18n: Replace `@wordpress/react-i18n` with `@wordpress/i18n` package to avoid missing dependency issue when used in WordPress ([#104325](https://github.com/Automattic/wp-calypso/pull/104325)).

## 1.0.0

### Enhancements

- `Badge`: Add component (forked from `@wordpress/components`) ([#104187](https://github.com/Automattic/wp-calypso/pull/104187)).
- `DateCalendar` and `DateRangeCalendar`: Add components ([#104224](https://github.com/Automattic/wp-calypso/pull/104224)).

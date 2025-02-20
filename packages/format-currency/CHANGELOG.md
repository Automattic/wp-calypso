# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Next

### Breaking changes

- Remove `setCurrencySymbol` ([#99924](https://github.com/Automattic/wp-calypso/pull/99924)).

### Enhancements

## 2.0.0 - 2022-12-27

### Added

In this PR we modify `formatCurrency()` and its sibling `getCurrencyObject()` to ignore the hard-coded list of data and instead use the browser's built-in library that formats currency for locales: [Intl.NumberFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat). The `null` return value is also removed from both functions so that they always return a string; if their inputs are malformed (NaN, unknown currency) they will use default values instead (0 and USD), respectively.

This PR also adds `setDefaultLocale()` which can be used to set a global default locale.

### Removed

This PR removes the hard-coded formatting data from the package, and the unnecessary `CURRENCIES` and `getCurrencyDefaults()` exports. It also removes the `decimal`, `grouping`, and `symbol` options from `formatCurrency()` and `getCurrencyObject()` because those are now totally under the control of the formatter.

## 1.0.1 - 2022-04-25

### Fixed

- Fixed tslib dependency

## 1.0.0 - 2022-04-20

### Added

- Initial release

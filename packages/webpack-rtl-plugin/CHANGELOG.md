# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

- Updated dependencies:
  - css-loader to ^5.2.4
  - mini-css-extract-plugin to ^1.6.0
  - rtlcss to ^3.1.2
- Removed unused dependency cssnano.

## 5.0.0 - 2021-03-26

### Breaking

- Drop support to minimze generated CSS code. Users that still need CSS minification can use [CssMinimizerWebpackPlugin](https://webpack.js.org/plugins/css-minimizer-webpack-plugin)
- Drop support to customize the filename used to generate RTL files. It will always be `<original-css-filename>.rtl.css`

## 4.0.0 - 2020-12-11

### Added

- Added peerDependency `webpack` to ^5.7.0

### Breaking

- Drop support for webpack 4, this plugin works with webpack 5 only.

## 3.0.0 - 2020-12-11

Initial publication after the fork.

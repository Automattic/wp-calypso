# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

### Changed

- The `require` callback now gets the module object as a parameter, not just its default field (for compatibility with `React.lazy`)
- The `ignore` option converts the `import` expression into a rejected `Promise` instead of removing it

### Removed

- Removed the `async` option and started transforming all usages to async loads by default
- Removed support for `callback` argument for `asyncRequire`, keeping only the `Promise` version

## 1.0.1

- Initial release

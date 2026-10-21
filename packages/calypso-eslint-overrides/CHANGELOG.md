# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `flatNodeConfig`, a flat-config version of `nodeConfig`. Like `nodeConfig`, it keeps the surrounding source type and allows top-level `return` in scripts and CommonJS files.

### Removed

- Breaking: `nodeConfig` and the `@automattic/calypso-eslint-overrides/node` entry point, eslintrc config that ESLint 10 can't load. Use `flatNodeConfig` in flat config instead.

## [1.0.0]

### Added

- Initial release

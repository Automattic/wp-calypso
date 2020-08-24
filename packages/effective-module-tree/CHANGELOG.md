# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## 0.1.0 - 2020-04-14
### Added
- Adds a new flag `-o` to specify the type of output: `-o tree` (an ascii tree, the default) or `-o list`

### Fixed
- Fix a bug where circular dependencies were cached, potentially mis-marking them as 'circular' in other parts of the tree

## 0.0.1 - 2020-03-10
- Initial release
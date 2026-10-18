# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

- Added a flat-config `flat/recommended` preset for ESLint 9, built from the same rules as `recommended`. Scope it to your JSON files with `files` and `extends`, as the README shows.
- On ESLint 10, `flat/recommended` gives `eslint-plugin-json-es`'s rules `context.getSourceCode()`, which ESLint 10 removed.

## 1.0.0

Initial release

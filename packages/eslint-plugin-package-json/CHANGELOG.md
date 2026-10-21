# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

- Breaking: Requires ESLint 10.13 or later within 10.x. `recommended` is a flat-config preset: scope it to your JSON files with `files` and `extends`, as the README shows. The eslintrc presets `plugin:@automattic/eslint-plugin-json/recommended` and `plugin:@automattic/eslint-plugin-json/wpcom` are removed, since ESLint 10 can't load eslintrc.
- `recommended` gives `eslint-plugin-json-es`'s rules `context.getSourceCode()`, which ESLint 10 removed, so don't register that plugin yourself next to it.

## 1.0.0

Initial release

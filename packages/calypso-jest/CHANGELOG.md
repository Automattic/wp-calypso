# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

- Breaking: Requires `@babel/core` 8, which needs Node.js `^22.18.0 || >=24.11.0`.
- The preset transforms with its own `babel-jest` dependency, so tests compile with the project's `@babel/core` rather than whichever one Jest's internal `babel-jest` copy resolves.
- Update Jest, `jest-config` and `babel-jest` to v30.
- Let `nock` refuse requests a test file left in flight before disposing its interceptors, instead of passing them through to the network.

Initial release

## 1.0.1

- Declare React 19 compatibility for package consumers (#111721).

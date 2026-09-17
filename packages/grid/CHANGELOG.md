# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## 0.2.2

- Use an npm-installable `@wordpress/compose` dependency range for package consumers.

## 0.2.1

- Declare React 19 compatibility for package consumers (#111721).

## 0.2.0

### Added

- Add `fillWidth` layout property — items fill remaining columns in their row
- Add AI agent context (`CLAUDE.md`, `AGENTS.md`)

## 0.1.3

### Bug Fixes

- Fix Grid not re-rendering when layout prop changes dynamically

## 0.1.2

- Add actionableArea grid item property

## 0.1.1

### Bug Fixes

- Add missing dependencies to package.json

## 0.1.0 - Initial Release

### Added

- Grid component for CSS Grid layouts
- Customizable columns, spacing, and row height
- Support for automated responsive layout by specifying minimum column widths
- Support for drag-and-drop reordering of grid items
- Support for resizing grid items

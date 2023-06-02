# Jest Circus Allure Reporter

[![jest](https://jestjs.io/img/jest-badge.svg)](https://github.com/facebook/jest)

A Jest Circus compatible reporter for Allure.

Most of the code is forked from [ryparker/jest-circus-allure-environment](https://github.com/ryparker/jest-circus-allure-environment) under MIT license.

<!-- TOC -->

- [Jest Circus Allure Reporter](#jest-circus-allure-reporter)
  - [❗️ Requirements](#%EF%B8%8F-requirements)
  - [:rocket: How to use](#rocket-how-to-use)
  - [:camera_flash: Allure reporting in your tests](#camera_flash-allure-reporting-in-your-tests)
  - [:gear: Options](#gear-options)
  - [📈 DocBlocks](#-docblocks)
    - [🔍 Pragmas](#-pragmas)
    - [🏷 Tag](#%F0%9F%8F%B7-tag)
    - [👥 Owner](#-owner)
    - [:part_alternation_mark: Severity](#part_alternation_mark-severity)
    - [📇 Behaviors epics, features, stories](#-behaviors-epics-features-stories)

<!-- /TOC -->

---

## ❗️ Requirements

| Resource                                                             | Description                                                                                  |
| -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| [Jest](https://jestjs.io/)                                           | A delightful JavaScript testing framework.                                                   |
| [Allure 2 CLI](https://github.com/allure-framework/allure2#download) | "A Java jar command line tool that turns Allure result files into beautiful Allure reports." |

## :rocket: How to use

1. **Run a Calypso end-to-end test**

```shell
yarn jest specs/onboarding/signup__free.ts
```

2. **Generate Allure reports**

```shell
allure serve ./allure-results
```

## :gear: Options

Options that can be passed into the `environmentOptions` property of your `jest.config.js`

| Parameter       | Description                                                                         | Default            |
| --------------- | ----------------------------------------------------------------------------------- | ------------------ |
| resultsDir      | Path where Allure result files will be written.                                     | `"allure-results"` |
| environmentInfo | Key value pairs that will appear under the environment section of the Allure report | `{}`               |

## 📈 DocBlocks

You may set code comments inside your tests called DocBlocks, that can be parsed for specific allure report pragmas. These are the supported DocBlock pragmas you may add to a test.

### 🔍 Pragmas

Add DocBlock pragmas that document the tested functionality.

```typescript
test('does something important, when triggered by user', () => {
  /** This uses a 3rd party API that typically undergoes maintenance on Tuesdays.
   */

  ...
})
```

### 🏷 Tag

Tag a test with a custom label.

_Set multiple tags using a `,` delineator._

```typescript
test('does something important, when triggered by user', () => {
  /**
   * @tag beta
   * @tag feature-flagged, api-v3
   */

  ...
})
```

### 👥 Owner

Set an owner for a test.

```TS
test('does something important, when triggered by user', () => {
  /**
   * @owner ios-team
   */

  ..
})
```

### :part_alternation_mark: Severity

Mark tests with a severity rating to indicate the importance of the tested functionality in respect to the overall application.

| Level            | Description                                                                  |
| ---------------- | ---------------------------------------------------------------------------- |
| blocker          | Tests that if failing, will halt further development.                        |
| critical         | Tests that must pass; or risk disrupting crucial application logic.          |
| normal (default) | Tests that are of average importance to the overall application.             |
| minor            | Tests that if failing, should only effect a small subset of the application. |
| trivial          | Tests that validate unreleased, disabled, or deprecated features.            |

Example of setting a test as "critical" severity

```typescript
test('does something important, when triggered by user', () => {
  /**
   * @severity critical
   */

  ...
})
```

### 📇 Behaviors (epics, features, stories)

Mark tests with a behavior label to organize tests in a feature based hierarchy.

| Level   | Description                                                              |
| ------- | ------------------------------------------------------------------------ |
| epic    | Tests that if fail, will effect the expected functionality of an epic.   |
| feature | Tests that if fail, will effect the expected functionality of a feature. |
| story   | Tests that if fail, will effect the expected functionality of story.     |

Example:

```typescript
test('validation message appears, when email field is skipped', () => {
  /**
   * @epic Automate user sign up
   * @feature Registration page
   * @story Validate required registration fields before creating new user
   */

  ...
})
```

# Writing Tests

This document will outline tips to write successful tests for both Selenium and Playwright suites.

Refer to the [Selenium style guide](docs/style-guide-selenium.md) or [Playwright style guide](docs/style-guide-playwright.md) for more information.

## Table of contents

<!-- TOC -->

- [Writing Tests](#writing-tests)
  - [Table of contents](#table-of-contents)
  - [Get Started](#get-started)
  - [Top-level block](#top-level-block)
  - [Child-level block](#child-level-block)
  - [Setup](#setup)
  - [Test step](#test-step)
  - [Variable naming](#variable-naming)

<!-- /TOC -->

## Get Started

Create a spec file under `test/e2e/specs` in the appropriate directory.
Follow this general structure when naming a file:

`wp-<feature>__<subfeature or suite>-spec.js`

This is for multiple reasons:

1. better visual identification of feature-specific specs.
2. separation of subfeatures into separate files for parallelization.

Begin the test file by importing the basics:

```typescript
import {
	setupHooks,
	DataHelper,
	LoginFlow
} from '@automattic/calypso-e2e';
```

## Top-level block

As referenced in the [Style Guide](style-guide-playwright.md#Tests), there should only be one top-level `describe` block in a spec file.

Using the `DataHelper.createSuiteTitle` function, define a name for the overall suite:

```typescript
describe( DataHelper.createSuiteTitle( 'Feature' ), function() {})
```

This will be transformed into something like:

```
[WPCOM] Feature: (desktop) @parallel
```

## Child-level block

Unlike top-level blocks, there are no restrictions on the number of child-level `describe` blocks.

Using child-level `describe` blocks, separate out distinct test cases for the feature. Do not use `DataHelper.createSuiteTitle` for child-level blocks:

```typescript
describe( DataHelper.createSuiteTitle( 'Feature' ), function() {
	describe( 'Use Feature with valid string', function() {});

	describe( 'Use Feature with invalid string', function() {});

	describe( 'Deactivate Feature', funtion() {});
})
```

:warning: while there are no limits to the number of child blocks, exercise restraint - only the individual files are run in parallel, so if a file takes 2 minutes to complete the CI task will inevitably take that long!

## Setup

At a minimum, setup steps are required to start the browser instance.

Invoke the `setupHooks` call to obtain an instance of a `Page` object:

```typescript
describe( DataHelper.createSuiteTitle( 'Feature' ), function () {
	let page: Page;

	setupHooks( ( args ) => {
		page = args.page;
	} );
});
```

## Test step

Test steps are where most of the action happens in a spec.

Refer to the [Style Guide](style-guide-playwright.md#test-steps) for do's and don'ts of writing a test step.

Define a test step using the `it` keyword and give it a unique, descriptive name:

```typescript
it( 'Navigate to Media', async function() {
	await SidebarComponent.gotoMenu( 'Media' );
	await MediaPage.viewGallery();
})
```

`Jest` enforces that test steps within a `describe` block must have unique names.

If a test is to be parametrized, use Jest's built-in `each`:

```typescript
it.each([
	{ a: 1, b: 2},
	{ a: 3, b: 4},
])( 'Navigate to $a', async function( {b}) {

});
```

## Variable naming

Variables that derive from a page/component object (eg. SidebarComponent) should be named after the object it derives from following the camelCase convention.

**Avoid**:

```typescript
const bar = new SidebarComponent( page );
const mhp = new MyHomePage( page );
```

**Instead**:

```typescript
const sidebarComponent = new SidebarComponent( page );
const myHomePage = new MyHomePage( page );
```

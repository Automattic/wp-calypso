# Writing Tests

<!-- TOC -->

- [Writing Tests](#writing-tests)
  - [Example](#example)
  - [Quick start](#quick-start)
  - [Top-level describe block](#top-level-describe-block)
  - [Child-level describe blocks](#child-level-describe-blocks)
  - [Test step](#test-step)
  - [Hooks](#hooks)
  - [Block Smoke Testing](#block-smoke-testing)
    - [Overview](#overview)
    - [How To](#how-to)
    - [Examples](#examples)

<!-- /TOC -->

## Example

```typescript
/**
 * @group calypso-pr
 * @group gutenberg
 */

import { setupHooks, DataHelper, LoginPage } from '@automattic/calypso-e2e';

const xyz = 'someconst';

describe( DataHelper.createSuiteTitle( 'Feature' ), function () {
	let page: Page;

	setupHooks( ( args ) => {
		page = args.page;
	} );

	describe( 'Input valid search query', function () {
		let someComponent: SomeComponent;
		const searchQuery = 'valid search string';

		it( 'Check title', async function () {
			someComponent = await SomeComponent.Expect( page );
			await someComponent.clickMyPages();
			const resultValue = await someComponent.getTitle();
			assert.strictEqual( resultValue, expectedValue );
		} );

		it( 'Enter search string', async function () {
			await someComponent.search( searchQuery );
			await someComponent.clickResult( 1 );
		} );
	} );

	describe( 'Change preview value', function () {
		let anotherComponent: AnotherComponent;

		it.each`
			value         | expected
			${ 'small' }  | ${ 's' }
			${ 'medium' } | ${ 'm' }
		`( 'Click on $value on AnotherComponent', function ( { value, expected } ) {
			anotherComponent = await AnotherComponent.Expect( page );
			const resultValue = await anotherComponent.click( value );
			assert.strictEqual( resultValue, expected );
		} );
	} );
} );
```

## Quick start

1. Create a TypeScript file with the following naming structure.

```
test/e2e/specs/specs-playwright/wp-<major feature>__<subfeature>.ts
```

This is for multiple reasons:

- visual grouping of test specs by feature.
- separation of tests into separate files to take advantage of parallelization.

2. Import the basics

```typescript
import { setupHooks, DataHelper, LoginPage } from '@automattic/calypso-e2e';
```

3. Assign a test group.

Specs are grouped into suites using [jest-runner-groups](https://github.com/eugene-manuilov/jest-runner-groups). **Specs must be explicitly added to suites to be run as part of CI pipelines.**  
To add your spec file to suites, add a jsdoc block at the top of the file, and use the `@group` tag. Multiple suites are supported.

```typescript
/**
 * @group calypso-pr
 * @group gutenberg
 */
```

The current suites used are...

- `calypso-pr` - tests run pre-merge on every Calypso PR.
- `calypso-release` - tests run post-merge and pre-release in the Calypso deployment process.
- `gutenberg` - WPCOM focused tests run as part of Gutenberg upgrades.
- `coblocks` - tests for CoBlocks features.
- `i18n` - internationalization tests.
- `p2` - P2 tests.
- `quarantined` - flakey tests that need to prove their stability.

4. Populate test steps.

This is the longest and most arduous portion of the process.

In some cases, this will be straightforward - all required methods would have been implemented in page objects already. In other cases, it may be required to implement new page objects from scratch.

For guide on how writing page objects, components and flows please refer to the [Library Objects](library_objects.md) page.

## Top-level `describe` block

As referenced in the [Style Guide](style-guide-playwright.md#Tests), there should only be one top-level `describe` block in a spec file.

Using the `DataHelper.createSuiteTitle` function, define a short, descriptive name for the overall suite:

```typescript
describe( DataHelper.createSuiteTitle( 'Feature' ), function () {
	...
} );
```

## Child-level describe blocks

Do not use `DataHelper.createSuiteTitle` for child-level blocks:

Unlike top-level blocks, there are no restrictions on the number of child-level `describe` blocks.

> :warning: while there are no limits to the number of child blocks, exercise restraint - child blocks run sequentially, so if a file takes 8 minutes to complete the CI task will inevitably take that long!

Using child-level `describe` blocks, group test cases for a feature:

```typescript
describe( DataHelper.createSuiteTitle( 'Feature' ), function() {
	describe( 'Use Feature with valid string', function() {
		// Valid string test
	});

	describe( 'Use Feature with invalid string', function() {
		// Invalid string test
	});

	describe( 'Use Feature with a number', funtion() {
		// Number instead of string test
	});
})
```

Another way to use child-level `describe` blocks is to group distinct steps:

```typescript
describe( DataHelper.createSuiteTitle( 'Feature' ), function() {
	describe( 'Set up feature', function() {
		// Steps to set up the feature under test
	});

	describe( 'Test feature', function() {
		// Interact and test the feature
	});

	describe( 'Turn off feature', funtion() {
		// Test deactivating the feature
	});
})
```

## Test step

Test steps are where most of the action happens in a spec.

> :warning Refer to the [Style Guide](style-guide-playwright.md#test-steps) for do's and don'ts of writing a test step.

Define a test step using the `it` keyword and give it a unique, descriptive name:

```typescript
it( 'Navigate to Media', async function () {
	await SidebarComponent.navigate( 'Media' );
} );
```

`Jest` enforces that test steps within a `describe` block must have unique names.

If a test is to be parametrized, use Jest's built-in [`each`](https://jestjs.io/docs/api#testeachtablename-fn-timeout):

```typescript
it.each( [ { target: 'Media' }, { target: 'Settings' } ] )(
	'Navigate to $a',
	async function ( { target } ) {
		await SidebarComponent.navigate( target );
	}
);
```

## Hooks

[Hooks](https://jestjs.io/docs/api) are steps run before/after each file or before/after each step in order to perform setup/teardown.

Define hooks as follows:

```typescript
beforeAll( async () => {
	logoImage = await MediaHelper.createTestImage();
} );
```

## Block Smoke Testing

### Overview

The in-depth testing for a given Gutenberg block should be written and executed in the source repo for that block (e.g. Jetpack, Gutenberg, Newspack).

However, it is often valuable to perform a very basic smoke test on blocks to ensure they function as intended in the WPCOM & Calypso environment.
For consistency and ease of test writing and maintenance, all of this block testing is done in a shared format, where the same basic flow is iterated over all the blocks under test.

With a few exceptions (like media blocks), block smoke tests should be grouped together according to the _source_ of the block. E.g. all the blocks from Newspack should be in the same spec, all of the core Gutenberg blocks
should be in the same spec, etc. This allows for granular test execution when those sources are updated and the new versions are included in WPCOM.

### How To

1. Create a new class to represent the block flow in the appropriate subdirectory of [calypso-e2e/src/lib/blocks](../../../packages/calypso-e2e/src/lib/blocks).
2. That class should implement the interface `BlockFlow` defined [here](../../../packages/calypso-e2e/src/lib/blocks/schemas.ts).
3. By convention, any test data needed to configure or validate during the block flow should be provided to the class in the constructor.
   - Also by convention, this is usually done in a single object typed locally with an interface called `ConfigurationData`.
4. In the spec file, simply instantiate (with the needed test data) all the block flows you want to include in that spec, and pass that array to `createBlockTests` found in [specs/specs-playwright/shared-specs/block-testing.ts](../specs/specs-playwright/shared-specs/block-testing.ts).

### Examples

<details>
<summary>Block flow class:</summary>

```typescript
import { BlockFlow, EditorContext, PublishedPostContext } from '..';

interface ConfigurationData {
	neededTestString: string;
	neededTestNumber: number;
	// ... type however you want, based on what test data you need!
}

const selectors = {
	// add selectors here
};

export class ExampleBlockFlow implements BlockFlow {
	private configurationData: ConfigurationData;

	constructor( configurationData: ConfigurationData ) {
		this.configurationData = configurationData;
	}

	blockSidebarName = 'Example';
	blockEditorSelector = '[aria-label="Block: Example"]';

	async configure( context: EditorContext ): Promise< void > {
		// use the editor context (things like the editor iframe and Playwrihgt Page) and the configuration data to configure the block in the editor.
	}

	async validateAfterPublish( context: PublishedPostContext ): Promise< void > {
		// use the publsihed post context and the configuration data to do a quick validation of the block content in a published post.
	}
}
```

</details d>

<details>
<summary>Spec test file:</summary>

```typescript
/**
 * @group gutenberg
 * @group example-blocks
 */

import { ExampleABlockFlow, ExampleBBlockFlow, BlockFlow } from '@automattic/calypso-e2e';
import { createBlockTests } from './shared-specs/block-testing';

const blockFlows: BlockFlow[] = [
	new ExampleABlockFlow( {
		neededString: 'a test data string needed by block Example A',
	} ),
	new ExampleBBlockFlow( {
		neededObj: {
			// an object of test data needed by block Example B
		},
	} ),
];

createBlockTests( 'Example Blocks', blockFlows );
```

</details>

<div style="width: 45%; float:left" align="left"><a href="./tests_ci.md"><-- Running tests on CI</a> </div>
<div style="width: 5%; float:left" align="center"><a href="./../README.md">Top</a></div>
<div style="width: 45%; float:right"align="right"><a href="./library_objects.md">Library Objects --></a> </div>

<br><br>

# Writing Tests

<!-- TOC -->

- [Writing Tests](#writing-tests)
    - [Example test spec](#example-test-spec)
    - [Quick start](#quick-start)
    - [Child-level describe blocks](#child-level-describe-blocks)
    - [Test step](#test-step)
    - [Hooks](#hooks)
    - [Viewports](#viewports)
    - [Block Smoke Testing](#block-smoke-testing)
        - [Overview](#overview)
        - [How To](#how-to)
        - [Examples](#examples)

<!-- /TOC -->

## Example test spec

```shell
specs/search__preview.ts
```

```typescript
/**
 * @group calypso-pr
 * @group gutenberg
 */

import { DataHelper, TestAccount } from '@automattic/calypso-e2e';

// Define constants below the import, but above the global declaration.
const xyz = 'someconst';
const accountName = 'defaultUser';

// Declare the global constant browser, representing an instance of the browser
// launched by Playwright.
declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Search: Preview' ), function () {
	// Define a persistent page object, representing an instance of Playwright's Page
	// object which interacts with the actual DOM.
	// This instance of the `page` will be used throughout the test spec.
	let page: Page;

	// Hook which will run before every `it` and `describe` in this spec.
	beforeAll( async function () {
		// Launch a new page instance.
		page = await browser.newPage();

		// Authentication boilerplate.
		// `accountName` should map to an existing user in the encrypted secrets file.
		const testAccount = new TestAccount( accountName );
		await testAccount.authenticate( page );
	} );

	// Note use of a child-level describe block to group a set of steps in the flow.
	describe( 'Input a search query', function () {
		const searchQuery = 'some valid search string';
		// Define child-level describe scoped variable for a component to be shared
		// across this scope. Note the use of camelCase for variable naming.
		let someComponent: SomeComponent;

		// Note the short yet descriptive step name that definitively states the
		// action performed in this step.
		it( 'Check page title', async function () {
			someComponent = new SomeComponent( page );

			await someComponent.clickMyPages();
			const resultValue = await someComponent.getTitle();

			// Use Jest's built-in `expect` when asserting in a test spec.
			expect( resultValue ).toStrictEqual( expectedValue );
		} );

		// Short, decisive actions in each step.
		it( 'Enter search string', async function () {
			await someComponent.search( searchQuery );
			await someComponent.clickResult( 1 );
		} );
	} );

	describe( 'Change preview value', function () {
		// Use of Jest's built-in parametrization method to test slightly different
		// variations of the input value.
		it.each`
			value         | expected
			${ 'small' }  | ${ 's' }
			${ 'medium' } | ${ 'm' }
		`( 'Click on preview: $value', function ( { value, expected } ) {
			const anotherComponent = new AnotherComponent( page );

			const resultValue = await anotherComponent.click( value );
			expect( resultValue ).toStrictEqual( expected );
		} );
	} );
} );
```

## Quick start

1. Create a TypeScript file with the following naming structure.

```
test/e2e/specs/<major_feature>/<major_feature>__<sub_feature>.ts
```

2. Import the boilerplate.

```typescript
import { DataHelper, TestAccount } from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';
```

3. Assign test group(s). See [Feature/Test groups](./tests_ci.md#featuretest-groups)

```typescript
/**
 * @group calypso-pr
 * @group gutenberg
 * ...more as required.
 */
```

4. Define a top-level `describe` block.

As per the [Style Guide](./style_guide.md#only-one-top-level-describe-block), there should only be one top-level `describe` block in a spec file.

Using the `DataHelper.createSuiteTitle()` function, define a short, descriptive name for the overall suite:

```typescript
describe( DataHelper.createSuiteTitle( '<major_feature>: <sub_feature>' ), function () {
	...
} );
```

5. Populate test steps as necessary.

This is the longest and most arduous portion of the process, where functions provided by page and component objects are called in sequence to execute some action.

In some cases, this will be straightforward - all required methods would have been implemented in page objects already. In other cases, it may be required to implement new page objects from scratch.

For guide on how writing page objects, components and flows please refer to the [Library Objects](library_objects.md) page.

## Child-level describe blocks

Do not use `DataHelper.createSuiteTitle` for child-level blocks.

Unlike top-level blocks, there are no restrictions on the number of child-level `describe` blocks.

> :warning: while there are no limits to the number of child blocks, exercise restraint - child blocks run sequentially, so if a file takes 8 minutes to complete the CI task will inevitably take that long!

Using child-level `describe` blocks, group test cases for a feature:

```typescript
declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Feature' ), function () {
	describe( 'Use Feature with valid string', function () {
		// Valid string test steps
	} );

	describe( 'Use Feature with invalid string', function () {
		// Invalid string test steps
	} );

	describe( 'Use Feature with a number', function () {
		// Number instead of string test steps
	} );
} );
```

Another way to use child-level `describe` blocks is to group distinct parts of an overall flow:

```typescript
declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Feature' ), function () {
	describe( 'Set up feature', function () {
		// Steps to set up the feature under test
	} );

	describe( 'Test feature', function () {
		// Interact and test the feature
	} );

	describe( 'Turn off feature', function () {
		// Test deactivating the feature
	} );
} );
```

## Test step

Test steps are where most of the action happens in a spec.

> :warning: Refer to the [Style Guide](style_guide.md#test-steps) for do's and don'ts of writing a test step.

Define a test step using the `it` keyword and give it a unique, descriptive name:

```typescript
it( 'Navigate to Media', async function () {
	await SidebarComponent.navigate( 'Media' );
} );
```

`Jest` enforces that test steps within a `describe` block must have unique names.

For steps that carry out same actions but with a set of slightly different input data, use Jest's built-in [`each` parametrization](https://jestjs.io/docs/api#testeachtablename-fn-timeout):

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

## Viewports

For the vast majority of our tests, it is expected that the tests will pass when run against both a mobile and desktop viewport.

The viewports used for mobile and desktop testing are fixed and based on user data and important Calypso breakpoints. Whether the mobile or desktop viewport is used is controlled by an environment variable, `VIEWPORT_NAME`. For more information on supported environment variables, see the [Environment Variables](environment_variables.md) page.

If a page requires different selectors or actions based on the viewport, those differences should be handled in the POM class methods and abstracted away from the test scripts as much as possible.

Example:

```typescript
// In the POM page or component class...
async doThing(): Promise< void > {
	if ( envVariables.VIEWPORT_NAME === 'mobile' ) {
		// Actions required to do thing on mobile
	} else {
		// Actions required to do thing on desktop
	}
}

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
		// use the editor context (things like the editor Locator and Playwright Page) and the configuration data to configure the block in the editor.
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

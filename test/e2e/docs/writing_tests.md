[← Documentation index](./overview.md)

# Writing Tests

<!-- TOC -->

- [Writing Tests](#writing-tests)
  - [Example test spec](#example-test-spec)
  - [Quick start](#quick-start)
  - [Test steps](#test-steps)
  - [Repeating a test over input data](#repeating-a-test-over-input-data)
  - [Setup and teardown](#setup-and-teardown)
  - [Viewports](#viewports)

<!-- /TOC -->

## Example test spec

```shell
specs/tools/marketing__seo.spec.ts
```

```typescript
import { DataHelper } from '@automattic/calypso-e2e';
import { expect, tags, test } from '../../lib/pw-base';

test.describe(
	DataHelper.createSuiteTitle( 'Marketing: SEO' ),
	{ tag: [ tags.CALYPSO_PR ] },
	() => {
		// Fixtures are declared in the test signature. Declaring an account fixture logs
		// in as that account, so take only the ones the test needs.
		test( 'As a WordPress.com business plan user with an atomic site, I can see the SEO settings page', async ( {
			accountAtomic,
			helperData,
			page,
			pageMarketing,
		} ) => {
			const frontPageText = helperData.getRandomPhrase();

			await test.step( `Given I am authenticated as '${ accountAtomic.accountName }'`, async function () {
				await accountAtomic.authenticate( page );
			} );

			await test.step( 'When I visit the Tools > Marketing > Traffic page', async function () {
				await pageMarketing.visitTab( accountAtomic.getSiteURL( { protocol: false } ), 'traffic' );
			} );

			await test.step( 'Then I can validate and preview the text', async function () {
				await pageMarketing.validatePreviewTextForPageStructureCategory( frontPageText );
			} );
		} );
	}
);
```

See [Custom fixtures](./custom_fixtures.md) for the fixtures available in the test signature.

## Quick start

1. Create a TypeScript file with the following naming structure. Playwright only collects
   files ending in `.spec.ts`.

```
test/e2e/specs/<major_feature>/<major_feature>__<sub_feature>.spec.ts
```

2. Import the boilerplate.

```typescript
import { tags, test } from '../../lib/pw-base';
```

3. Assign test tag(s). See [Feature/Test tags](./tests_ci.md#featuretest-tags). A spec with no
   tag is never selected by a build, so it never runs on CI.

4. Define a top-level `test.describe` block with a short, descriptive name and the tags that
   select which CI builds run the spec:

```typescript
test.describe( '<major_feature>: <sub_feature>', { tag: [ tags.CALYPSO_PR, tags.GUTENBERG ] }, () => {
	...
} );
```

5. Populate test steps as necessary.

This is the longest and most arduous portion of the process, where functions provided by page
and component objects are called in sequence to execute some action.

In some cases, this will be straightforward - all required methods would have been implemented
in page objects already. In other cases, it may be required to implement new page objects from
scratch.

For a guide on writing page objects, components and flows please refer to the
[Library Objects](./library_objects.md) page.

## Test steps

Test steps are where most of the action happens in a spec.

> :warning: Refer to the [Style Guide](./style_guide.md#specification-structure) for the do's
> and don'ts of writing a test step.

Define a step with `test.step` and give it a descriptive name, starting with
Given/When/Then/And:

```typescript
await test.step( 'When I navigate to Media', async function () {
	await componentSidebar.navigate( 'Media' );
} );
```

## Repeating a test over input data

Playwright has no `each` helper. Loop over the data and define one test per entry, keeping the
titles unique:

```typescript
for ( const target of [ 'Media', 'Settings' ] ) {
	test( `As a user, I can navigate to ${ target }`, async ( { componentSidebar } ) => {
		await componentSidebar.navigate( target );
	} );
}
```

## Setup and teardown

Prefer a [fixture](./custom_fixtures.md) over a hook: fixtures only run for the tests that
declare them, and they tear themselves down.

Where a hook is genuinely needed, Playwright provides `test.beforeAll`, `test.beforeEach`,
`test.afterEach` and `test.afterAll`. Note that `beforeAll` runs once per worker, not once per
file, so anything it creates is shared by every test that worker runs.

## Viewports

For the vast majority of our tests, it is expected that the tests will pass when run against
both a mobile and desktop viewport.

The viewports used for mobile and desktop testing are fixed and based on user data and
important Calypso breakpoints. Whether the mobile or desktop viewport is used is controlled by
an environment variable, `VIEWPORT_NAME`. For more information on supported environment
variables, see the [Environment Variables](./environment_variables.md) page.

If a page requires different selectors or actions based on the viewport, those differences
should be handled in the library object methods and abstracted away from the specs as much as
possible.

Example:

```typescript
// In the page or component class...
async doThing(): Promise< void > {
	if ( envVariables.VIEWPORT_NAME === 'mobile' ) {
		// Actions required to do thing on mobile
	} else {
		// Actions required to do thing on desktop
	}
}
```

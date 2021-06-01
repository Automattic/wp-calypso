# Style Guide

<!-- TOC -->

- [Style Guide](#style-guide)
    - [General structure - test](#general-structure---test)
    - [General structure - pages and components](#general-structure---pages-and-components)
    - [General structure - flows](#general-structure---flows)
    - [Async / Await](#async--await)
    - [Page Objects](#page-objects)
    - [Use of this, const and lets](#use-of-this-const-and-lets)
    - [Arrow functions](#arrow-functions)
    - [Default values using destructuring](#default-values-using-destructuring)
    - [Nesting step blocks](#nesting-step-blocks)
    - [Catching errors in a step block](#catching-errors-in-a-step-block)
    - [Waiting for elements](#waiting-for-elements)

<!-- /TOC -->

## General structure - test

Tests for Playwright E2E continue to be written in JavaScript.

There should only be [one top-level describe block](style-guide.md#maximum-1-top-level-describe-block) per file.

<details>
<summary>Example Test File</summary>

```javascript

/**
 * External dependencies
 */ 

/**
 * Internal dependencies
 */

/**
 * Constants
 */

describe( 'Feature: @parallel', function() {
	describe( 'Test case 1', function() {
		let someComponent;
		
		it( 'Check title', async function() {
			someComponent = await SomeComponent.Expect( this.page );
			await someComponent.clickMyPages();
			const resultValue = await someComponent.getTitle();
			assert( resultValue === expectedValue );
		} );
	} );

	describe( 'Test case 2', function() {
		let anotherComponent;

		before( 'Set up before all test steps', async function() {
			anotherComponent = await AnotherComponent.Expect( this.page, 'param' );
		} );

		it( 'Test step', async function() {
			...
		} );
	} );
} );
```

</details>

## General structure - pages and components

Playwright E2E tests rely heavily on the `@automattic/calypso-e2e` library, written in TypeScript.

`Pages` and `Components` often have fuzzy boundaries and is not precisely defined. With that said, it is possible to draw a distinction between the two.

**Pages**: represent an overall page on WPCOM. A good example of is the [Login Page](https://github.com/Automattic/wp-calypso/blob/trunk/packages/calypso-e2e/src/lib/pages/login-page.ts); it encapsulates element selectors and actions that can be performed on the given page.

**Components**: represent a sub-portion of the page, and are often shared across multiple pages (_though not always!_). A good example is the Sidebar Component, persisting across multiple pages in the My Home dashboard. It encapsulates element selectors and actions for only the Sidebar, leaving interactions on the main content pane for the respective Page objects.

<details>
<summary>Example Page Object</summary>

```typescript

/**
 * External dependencies
 */ 

/**
 * Internal dependencies
 */

/**
 * Type dependencies
 */

/**
 * Constants
 */

const selectors = {
	titleInput: '.editor-post-title__input',
	publishPanelToggle: '.editor-post-publish-panel__toggle',
	...
}

/**
 * JSDoc is expected for Class definitions.
 * 
 * @augments {BaseContainer}
 */
export class SomePage extends BaseContainer {
	/**
	 * JSDoc is expected for constructor.
	 * 
	 * @param {Page} page Page object.
	 */
	constructor( page: Page ) {
		...
	}

	/**
	 * JSDoc is expected for functions.
	 * 
	 * @param {string} text Text to be entered into the field.
	 */
	async enterText( text: string ): Promise<void> {
		await this.page.waitForSelector( selectors.selectorName );

		//Some tricky section of code
		await Promise.all([
			...
		])
		...
	}
}
```
</details>

## General structure - flows

Flows in the `@automattic/calypso-e2e` library encapsulate the sequence of steps required to perform an action.

For instance, the Log in process is a flow, as it spans across multiple pages

## Async / Await

We use async functions and `await` to wait for commands to finish. This lets asynchronous methods execute like synchronous methods.
For every method which returns a promise or thenable object `await` should be used. Keep in mind that `await` is only valid inside async function.

We don't chain function calls together and avoid using `.then` calls.

**Avoid**:
```
async function openModal() {
	const modal = await this.page.waitForSelector('modal-open');
	await modal
		.click( )
		.then( () => this.page.waitForSelector( 'modal-is-open' ) );
}
```

**Instead**:
```
async function openModal() {
	const modal = await this.page.waitForSelector('modal-open');
	await modal.click();
	await this.page.waitForSelector( 'modal-is-open' ) );
}
```

## Page Objects

Page Objects are to be used to represent a corresponding page on WPCOM. 




All pages have asynchronous functions. Constructors for pages can't be asynchronous so we never construct a page object directly (using something like `new PageObjectPage(...)`), instead we use the static methods `Expect` and `Visit`, which are on the asyncBaseContainer and hence available for every page, to construct the page object.

Don't do:

```
step( 'Can select domain only from the domain first choice page', function() {
	const domainFirstChoicePage = new DomainFirstPage( driver );
	return await domainFirstChoicePage.chooseJustBuyTheDomain();
} );
```

Instead you should do this if you're expecting a page to appear during a flow:

```
step( 'Can select domain only from the domain first choice page', function() {
	const domainFirstChoicePage = await DomainFirstPage.Expect( driver );
	return await domainFirstChoicePage.chooseJustBuyTheDomain();
} );
```

or this to directly visit a page:

```
step( 'Can select domain only from the domain first choice page', function() {
	const domainFirstChoicePage = await DomainFirstPage.Visit( driver );
	return await domainFirstChoicePage.chooseJustBuyTheDomain();
} );
```

**Note:** not all pages can be visited as they require a direct URL to be defined, some pages come only as part of flows (eg. sign up pages)

## Use of this, const and lets

It is preferred to use `const`, or `lets`, instead of `this.`, as the scope is narrower and less likely to cause confusion across test steps.

For example:

```
step( 'Can select domain only from the domain first choice page', function() {
	this.domainFirstChoicePage = await DomainFirstPage.Expect( driver );
	return await this.domainFirstChoicePage.chooseJustBuyTheDomain();
} );
```

can use a `const` instead:

```
step( 'Can select domain only from the domain first choice page', function() {
	const domainFirstChoicePage = new DomainFirstPage( driver );
	return await domainFirstChoicePage.chooseJustBuyTheDomain();
} );
```

## Arrow functions

Passing arrow functions (“lambdas”) to Mocha is discouraged. Lambdas lexically bind this and cannot access the Mocha context [(source)](https://mochajs.org/#arrow-functions)

Avoid:

```
step( 'We can set the sandbox cookie for payments', () => {
	const wPHomePage = await WPHomePage.Visit( driver );
	await wPHomePage.checkURL( locale );
} );
```

instead:

```
step( 'We can set the sandbox cookie for payments', async function() {
	const wPHomePage = await WPHomePage.Visit( driver );
	await wPHomePage.checkURL( locale );
} );
```

## Default values using destructuring

Use destructuring for default values as this makes calling the function explicit and avoids boolean traps.

Avoid:

```
constructor( driver, visit = true, culture = 'en', flow = '', domainFirst = false, domainFirstDomain = '' ) {
```

instead:

```
constructor( driver, { visit = true, culture = 'en', flow = '', domainFirst = false, domainFirstDomain = '' } = {} ) {
```

that way, the page can be called like:

```
new StartPage( driver, { visit: true, domainFirst: true } ).displayed();
```

instead of:

```
new StartPage( driver, true, 'en', '', true, '' ).displayed();
```

## Nesting step blocks

Do not nest test steps.

This is a general structure of an e2e test scenario:

```
describe(
	'An e2e test scenario @parallel',
	function() {
		before( async function() {
			return await driverManager.ensureNotLoggedIn( driver );
		} );

		it( 'First step', async function() {
			// Do something with a page
		} );

		it( 'Second step', async function() {
			// Do something next - this will only execute if the first step doesn't fail
		} );

		after( async function() {
			// Do some cleanup
		} );
	}
);
```

## Catching errors in a step block

Sometimes we don't want a `step` block to fail on error - say if we're cleaning up after doing an action and it doesn't matter what happens. As we use async methods using a standard try/catch won't work as the promise itself will still fail. Instead, return an async method that catches the error result:

```
step( 'Can delete our newly created account', async function() {
	return ( async () => {
		const closeAccountPage = await new CloseAccountPage( driver );
		await closeAccountPage.chooseCloseAccount();
		await closeAccountPage.enterAccountNameAndClose( blogName );
		return await new LoggedOutMasterbarComponent( driver ).displayed();
	} )().catch( err => {
		SlackNotifier.warn( `There was an error in the hooks that clean up the test account but since it is cleaning up we really don't care: '${ err }'` );
	} );
} );
```

## Waiting for elements

When waiting for elements we should always use a quantity of the config value defined as `explicitWaitMS` instead of hardcoding values. This allows us to change it readily, and also adjust this for different environments, for example the live branch environment is not as fast as production so it waits twice as long.

Avoid:

```
export default class TransferDomainPrecheckPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.transfer-domain-step__precheck' ), null, 40000 );
	}
}
```

instead:

```
export default class TransferDomainPrecheckPage extends AsyncBaseContainer {
	constructor( driver ) {
		super(
			driver,
			By.css( '.transfer-domain-step__precheck' ),
			null,
			config.get( 'explicitWaitMS' ) * 2
		);
	}
}
```

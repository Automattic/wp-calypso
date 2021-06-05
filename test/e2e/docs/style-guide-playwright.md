# Style Guide

<!-- TOC -->

- [Style Guide](#style-guide)
    - [Tests](#tests)
    - [Components](#components)
    - [Page Objects](#page-objects)
    - [Flows](#flows)
    - [Async / Await](#async--await)
    - [Selectors](#selectors)
        - [Type](#type)
        - [Naming](#naming)
    - [Test Naming](#test-naming)

<!-- /TOC -->

## Tests

Tests for Playwright E2E continue to be written in JavaScript.

There should only be [one top-level describe block](style-guide.md#maximum-1-top-level-describe-block) per file.

<details>
<summary>Example Test File</summary>

```javascript
describe( 'Feature: @parallel', function () {
	describe( 'Test case 1', function () {
		let someComponent;

		it( 'Check title', async function () {
			someComponent = await SomeComponent.Expect( this.page );
			await someComponent.clickMyPages();
			const resultValue = await someComponent.getTitle();
			assert( resultValue === expectedValue );
		} );
	} );

	describe( 'Test case 2', function () {
		let anotherComponent;

		before( 'Set up before all test steps', async function () {
			anotherComponent = await AnotherComponent.Expect( this.page, 'param' );
		} );

		it( 'Test step', async function () {
			// tests here
		} );
	} );
} );
```

</details>

---

## Components

Components represent a sub-portion of the page, and are often shared across multiple pages (_though not always!_). A good example is the Sidebar Component, persisting across multiple pages in the My Home dashboard. It encapsulates element selectors and actions for only the Sidebar, leaving interactions on the main content pane for the respective Page objects.

<details>
<summary>Example Component Object</summary>

```typescript

const selectors = {
	sidebar: '.sidebar',
	myHome: '.my-home',
}

/**
 * JSDoc is expected for Class definitions.
 *
 * @augments {BaseContainer}
 */
export class SomeComponent extends BaseContainer {
	/**
	 * JSDoc is expected for constructor.
	 *
	 * @param {Page} page Page object.
	 */
	constructor( page: Page ) {
	}

	/**
	 * JSDoc is expected for functions.
	 *
	 * @param {string} menu Menu to be clicked.
	 * @returns {Promise<void>} No return value.
	 */
	async clickOnMenu( menu: string ): Promise<void> {
		await this.page.waitForSelector( selectors.selectorName );

		await this.page.click( menu );
		await this.page.waitForNavigation();
	}
}

// Then, in a test file, page, or flow...

	const someComponent = await SomeComponent.Expect( this.page );
	await someComponent.clickOnMenu();

```

</details>

---

## Page Objects

Page objects are to be used to represent a corresponding page on WPCOM. It can hold element selectors, class methods to interact with the page and define other helper functions.

A well-implemented page object will abstract complex interactions on the page to an easily understandable method call. The method should be well-contained, predictable and easy to understand.

Every page object file should contain an object outside of the class definition to hold element selectors. The Page object should access element selector values using dot notation within the method calls.

On many pages of WPCOM elements will load asynchronously. This leads to issues when initializing page objects as constructors cannot be asynchronous. To address this, page objects almost always inherit from the `BaseContainer` class as it provides asynchronous initialization of the page object through use of static method `Expect`. Only use synchronous class constructor if the page in question does not require any post-initialization setup.

Some in-repo example pages:

- [Login Page](packages/calypso-e2e/src/lib/pages/login-page.ts)

<details>
<summary>Example Page Object</summary>

```typescript

const selectors = {
	titleInput: '.editor-post-title__input',
	publishPanelToggle: '.editor-post-publish-panel__toggle',
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
	}

	/**
	 * JSDoc is expected for functions.
	 *
	 * @param {string} text Text to be entered into the field.
	 * @returns {Promise<void>} No return value.
	 */
	async enterText( text: string ): Promise<void> {
		await this.page.waitForSelector( selectors.selectorName );

		//Some tricky section of code
		await Promise.all([
			// calls
		])
	}
}

// Then, in a test file...

it('Test case', async function() {
	const somePage = await SomePage.Expect( this.page );
	await somePage.enterText( 'blah' );
})

```

</details>

---

## Flows

Flows in the `@automattic/calypso-e2e` library encapsulate the sequence of steps required to perform an action.

For instance, the Log In process is considered a flow as it spans across multiple pages.

Another example of a flow could be the Sign Up flow as the user interacts with multiple screens to achieve an end result.

<details>
<summary>Example Flow Object</summary>

```typescript
/**
 * JSDoc is expected for flow class.
 */
export class SomeFlow {
	constructor( page: Page ) {
		// construct here
	}

	/**
	 * JSDoc is expected for methods.
	 */
	async executeFlow(): Promise< void > {
		const componentA = await ComponentA.Expect( this.page );
		await componentA.clickOnSomething();
		const componentB = await ComponentB.Expect( this.page );
		const componentC = await ComponentC.Expect( this.page );
		await componentC.doFinalSomething();
	}
}

// Then in a test file...

const someFlow = await SomeFlow( this.page );
await someFlow.executeFlow();
```

</details>

---

## Async / Await

We use async functions and `await` to wait for commands to finish. This lets asynchronous methods execute like synchronous methods.
For every method which returns a promise or thenable object `await` should be used. Keep in mind that `await` is only valid inside async function.

We don't chain function calls together and avoid using `.then` calls.

**Avoid**:

```typescript
async function openModal() {
	const modal = await this.page.waitForSelector('modal-open');
	await modal
		.click( )
		.then( () => this.page.waitForSelector( 'modal-is-open' ) );
}
```

**Instead**:

```typescript
async function openModal() {
	const modal = await this.page.waitForSelector('modal-open');
	await modal.click();
	await this.page.waitForSelector( 'modal-is-open' ) );
}
```

---

## Selectors

### Type

Where possible, prioritize selector types as follows:

`CSS > Text = CSS with Attribute > Xpath`

Please refer to the [Playwright documentation](https://playwright.dev/docs/selectors/#quick-guide) for more information.

**Avoid**:

```
await page.click( 'xpath=//button' );
```

**Instead**:

```
await page.click( '.button text("Contact us")' );
```

### Naming

Where possible, name selectors based on the CSS selector instead its location.

If the above is not possible, fall back to describing its usage, function or type.

Avoid appending the term 'Selector' or something similar to the selector name. It is redundant.

Avoid using the location of the element as its name. Element placement can shift, but its role likely does not change.

**Avoid**:

```
const selectors = {
	buttonOnHeaderPane: '.button contact-us',
	secondButtonOnPopupSelector: '.button send-form',
	...
}
```

**Instead**:

```
const selectors = {
	contactUsButton: '.button contact-us',
	submitFormButton: '.button send-form',
	...
}
```

---

## Test Naming

Use step description.

Avoid the use of modal verbs such as `can`, `should`, `could` or `must`.

**Avoid**:

```
it( 'Can log in' )

it( 'Should be able to start new post' )
```

**Instead**:

```
it( 'Log In' )

it( 'Start new post' )
```

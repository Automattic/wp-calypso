# Style Guide

<!-- TOC -->

- [Style Guide](#style-guide)
  - [Tests](#tests)
    - [Other Notes on TypeScript Test Scripts](#other-notes-on-typescript-test-scripts)
  - [Components](#components)
  - [Page Objects](#page-objects)
  - [Flows](#flows)
  - [Variable naming](#variable-naming)
  - [Async / Await](#async--await)
  - [Selectors](#selectors)
    - [Engine](#engine)
    - [Naming](#naming)
    - [Stability](#stability)
    - [Dynamic Selectors](#dynamic-selectors)
  - [Test steps](#test-steps)
    - [Naming](#naming)
    - [Step size](#step-size)
  - [Maximum 1 top-level describe block](#maximum-1-top-level-describe-block)
  - [Destructure parameters](#destructure-parameters)

<!-- /TOC -->

## Tests

Tests for Playwright E2E can be written in either JavaScript or in TypeScipt - both are supported!

There should only be [one top-level describe block](style-guide.md#maximum-1-top-level-describe-block) per file.

<details>
<summary>Example Test File</summary>

```typescript
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

</details>

### Other Notes on TypeScript Test Scripts

Because Jest, the test runner, is already to configured to use Babel as a transpiler before executing scripts, there is no extra pre-build command you need to execute to run TypeScript test scripts. You can simply just have Jest run all the scripts in the `specs/specs-playwright` directory, and it will automatically take care of running both `.js` and `.ts` files.

Please note: [Babel does not do type-checking as it runs](https://jestjs.io/docs/getting-started#using-typescript), so if you want to do a specific type-check for your test scripts, you can use the local `tsconfig.json` by running `yarn tsc --project ./tsconfig.json`. We run this as part of the Playwright CI script, so all types will be checked before tests are run on TeamCity.

The local `tsconfig.json` also adds global Jest typings, so you do **not** need to explicitly import `describe` or `it` into your TypeScript testing files.

---

## Components

Components represent a sub-portion of the page, and are often shared across multiple pages (_though not always!_). A good example is the Sidebar Component, persisting across multiple pages in the My Home dashboard. It encapsulates element selectors and actions for only the Sidebar, leaving interactions on the main content pane for the respective Page objects.

<details>
<summary>Example Component Object</summary>

```typescript
const selectors = {
	sidebar: '.sidebar',
	myHome: '.my-home',
};

/**
 * JSDoc is expected for Class definitions.
 *
 * @augments {BaseContainer}
 */
export class SomeComponent extends BaseContainer {
	/**
	 * JSDoc is expected for constructor if present.
	 *
	 * @param {Page} page Page object.
	 */
	constructor( page: Page ) {}

	/**
	 * JSDoc is expected for functions.
	 *
	 * @param {string} menu Menu to be clicked.
	 * @returns {Promise<void>} No return value.
	 */
	async clickOnMenu( menu: string ): Promise< void > {
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

Page objects are to be used to represent a corresponding page on WPCOM. It can hold attributes, class methods to interact with the page and define other helper functions.

A well-implemented page object will abstract complex interactions on the page to an easily understandable method call. The method should be well-contained, predictable and easy to understand.

- **Don't Repeat Yourself (DRY)**: common actions can be called from the page object.
- **maintainability**: if a page changes, update the page object at one spot.
- **readability**: named variables and functions are much easier to decipher than series of strings.

Some in-repo example pages:

- [Login Page](packages/calypso-e2e/src/lib/pages/login-page.ts)

<details>
<summary>Example Page Object</summary>

```typescript
const selectors = {
	titleInput: '.editor-post-title__input',
	publishPanelToggle: '.editor-post-publish-panel__toggle',
};

/**
 * JSDoc is expected for Class definitions.
 */
export class SomePage {
	/**
	 * JSDoc is expected for constructor.
	 *
	 * @param {Page} page Page object.
	 */
	constructor( page: Page ) {}

	/**
	 * JSDoc is expected for functions.
	 *
	 * @param {string} text Text to be entered into the field.
	 * @returns {Promise<void>} No return value.
	 */
	async enterText( text: string ): Promise< void > {
		await this.page.waitForSelector( selectors.selectorName );

		//Some tricky section of code
		await Promise.all( [
			// calls
		] );
	}
}

// Then, in a test file...

it( 'Test case', async function () {
	const somePage = new SomePage( this.page );
	await somePage.enterText( 'blah' );
} );
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
		const componentA = new ComponentA( page );
		await componentA.clickOnSomething();
		const componentB = new ComponentB( page );
		const componentC = new ComponentC( page );
		await componentC.doFinalSomething();
	}
}

// Then in a test file...

const someFlow = new SomeFlow( page );
await someFlow.executeFlow();
```

</details>

---

## Variable naming

Variables that derive from a page/component object (eg. SidebarComponent) should be named after the object following camelCase convention.

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

---

## Async / Await

We use async functions and `await` to wait for commands to finish. This lets asynchronous methods execute like synchronous methods.
For every method which returns a promise or thenable object `await` should be used. Keep in mind that `await` is only valid inside async function.

We don't chain function calls together and avoid using `.then` calls.

**Avoid**:

```typescript
async function openModal() {
	const modal = await this.page.waitForSelector( 'modal-open' );
	await modal.click().then( () => this.page.waitForSelector( 'modal-is-open' ) );
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

Selectors form the core of any automated e2e test scripts. For an overview please refer to the [MDN page on CSS selectors](https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Selectors).

Ideally, a selector satisfies all of the following:

- **unique**: one selector, one element.
- **reliable**: the same element is selected with each iteration.
- **brief**: selector is short and easy to read.

Place selectors within the same file, but outside of the class representing the object. Never place a selector within the class definition itself.

**Avoid**:

```typescript
class SomeObject() {
	submitButtonSelector: '#submit'
}
```

**Instead**:

```typescript
const selectors = {
	submitButton: '#submit',
}

class SomeObject() {
	// class things
}

```

Selectors should be defined in an key:value object mapping as follows:

```typescript
const selectors = {
	// Buttons
	submitButton: '#submit',
	cancelButton: '#cancel',
};
```

Within the class, call on selectors as follows:

```typescript
await this.page.click( selectors.submitButton );
```

While defining one-off selectors within a code block is acceptable, if the same selector is used multiple times in different sections of the code, move the selector into the `selectors` object:

**Avoid**:

```typescript
class SomeObject() {
	async doSomething() {
		await this.page.click( '#submit' );
	}

	async doSomethingElse() {
		await this.page.click( '#submit' );
	}
}
```

**Instead**:

```typescript
const selectors = {
	submitButton: '#submit',
}

class SomeObject() {
	async doSomething() {
		await this.page.click( selectors.submitButton );
	}

	async doSomethingElse() {
		await this.page.click( selectors.submitButton );
	}
}

```

### Engine

Where possible, use text or CSS selectors:

`Text > CSS > Text/CSS with Attribute > Xpath`

Please refer to the [Playwright documentation](https://playwright.dev/docs/selectors/#quick-guide) for more information on selector engines.

**Avoid**:

```
await page.click( 'xpath=//button' );
```

```
await page.click( 'div.someclass .yet-another-class .attribute .very-long-attrbute');
```

**Instead**:

```
await page.click( 'button:text("Contact us")' );
```

### Naming

Where possible, name selectors based on the CSS selector instead of its location.

If the above is not possible, fall back to describing its usage, function or type.

Avoid appending the term 'Selector' or something similar to the selector name. It is redundant.

**Avoid**:

```typescript
const selectors = {
	contactButtonOnHeaderPane: '.button contact-us',
	secondButtonOnPopupSelector: '.button send-form',
	...
}
```

**Instead**:

```typescript
const selectors = {
	contactUsButton: '.button contact-us',
	submitFormButton: '.button send-form',
	...
}
```

### Stability

Where possible, use CSS selectors that rely on user-facing attributes (like an `aria-label` instead of a `class` name). These are less likely to change over time and add stability to your tests.

You can read more about this in the [Playwright selector best practices](https://playwright.dev/docs/selectors/#prioritize-user-facing-attributes).

Furthermore, where possible, only involve selectors that are required for the test flow.

**Avoid**:

```typescript
await this.page.waitForSelector( '.some-unnecessary-selector-not-related-to-the-test-flow' );
await this.page.fill( '.someclass__form-input .is-selected' );
```

**Instead**:

```typescript
await this.page.fill( 'input[aria-placeholder="Enter contact details"]' );
```

### Dynamic Selectors

Define dynamic selectors as follows:

```typescript
const selectors = {
	isVisible: (viewport) => {
		const suffix = viewport === 'mobile' ? '.is-mobile' : '.is-desktop';
		return 'div span${suffix}`;
	}
}
```

---

## Test steps

### Naming

Use step description.

Avoid the use of modal verbs such as `can`, `should`, `could` or `must`.

**Avoid**:

```typescript
it( 'Can log in' );

it( 'Should be able to start new post' );
```

**Instead**:

```typescript
it( 'Log In' );

it( 'Start new post' );
```

### Step size

Prefer more of smaller steps.

**Avoid**:

```typescript
it( 'Log in, select home page and start a search' );
```

**Instead**:

```typescript
it( 'Log In' );

it( 'Navigate to home page' );

it( 'Search for ${string}' );
```

---

## Maximum 1 top-level describe block

Each test file should only contain at most 1 top-level `describe` block.

Additionally, you should avoid going too deep on the layers of nested `describe` blocks beneath that top level, as it can make the overall flow of the spec a bit more confusing to follow.

---

## Destructure parameters

Use destructuring for default values as this makes calling the function explicit and avoids boolean traps.

**Avoid**:

```typescript
constructor( selector: string, visit:boolean = true, culture:string = 'en', flow:string = '', domainFirst:boolean = false, domainFirstDomain:string = '' ) {}

// In another file

const startPage = new StartPage( selector, true, 'en', '', true, '' ).displayed();
```

**Instead**:

```typescript
constructor( selector: string, { visit = true, culture = 'en', flow = '', domainFirst = false, domainFirstDomain = '' }: {visit: boolean, culture: string, flow: string, domainFirst: boolean, domainFirstDomain: string} = {} ) {}

// In another file

const startPage = new StartPage( selector, { visit: true, domainFirst: true } ).displayed();
```

---

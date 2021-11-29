# Style Guide

<!-- TOC -->

- [Style Guide](#style-guide)
    - [Variable naming](#variable-naming)
    - [Use async/await](#use-asyncawait)
    - [Selectors](#selectors)
        - [No selectors in class](#no-selectors-in-class)
        - [Move repetitive selectors out](#move-repetitive-selectors-out)
        - [Prefer user-facing selectors](#prefer-user-facing-selectors)
        - [Naming](#naming)
        - [Aim for stability](#aim-for-stability)
        - [Convert repetitive variations to dynamic selector](#convert-repetitive-variations-to-dynamic-selector)
    - [Test steps](#test-steps)
        - [Avoid modla verbs](#avoid-modla-verbs)
        - [Prefer smaller steps](#prefer-smaller-steps)
    - [Maximum 1 top-level describe block](#maximum-1-top-level-describe-block)
    - [Destructure parameters](#destructure-parameters)

<!-- /TOC -->

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
 */
export class SomeComponent {
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
		await this.page.click( selectors.myHome );
		await this.page.waitForNavigation();
	}
}

// Then, in a test file, page, or flow...

const someComponent = new SomeComponent( page );
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
	staticSelector: '.editor-post-title__input',
	dynamicSelector: (text: string) => `button:has-text("${text}")`,
};

/**
 * JSDoc is expected for Class definitions.
 */
export class SomePage {
	private page: Page;

	/**
	 * JSDoc is expected for constructor.
	 *
	 * @param {Page} page Page object.
	 */
	constructor( page: Page ) {
		this.page = page;
	}

	/**
	 * JSDoc is expected for functions.
	 *
	 * @param {string} text Text to be entered into the field.
	 * @returns {Promise<void>} No return value.
	 */
	async enterText( text: string ): Promise< void > {
		await this.page.waitForLoadState( 'networkidle' );

		// Some tricky section of code
		await Promise.all( [
			this.page.fill(selectors.staticSelector),
			this.page.click( selectors.dynamicSelector('Submit') )
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

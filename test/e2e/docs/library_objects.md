# Library Objects

The `@automattic/calypso-e2e` package offers a robust set of library objects patterned after the Page Object Model. When developing a new test spec, try to leverage these objects as much as possible for a seamless experience.

For a brief introduction to Page Object Models, please refer to [this page](https://www.selenium.dev/documentation/guidelines/page_object_models/).

<!-- TOC -->

- [Library Objects](#library-objects)
  - [Distinction](#distinction)
  - [Components](#components)
  - [Page](#page)
  - [Flows](#flows)

<!-- /TOC -->

## Distinction

There exists clear distinction between pages and components.

**Components** - these form the smallest unit of functionality in a Page Object Model based library. Components represent functionality that are often embedded across distinct pages. For instance, if a search bar is embedded on multiple pages, the search bar functionality is best abstracted as a SearchBarComponent.

**Pages** - these are the most common objects in a Page Object Model. Each Page contains methods to interact with the page and any necessary helper methods. Selectors to support the methods should also be located in the file, but not as part of the Page object itself.

There is less clear distinction between Pages and Flows and the general recommendation is to prefer Pages unless Flows absolutely make sense.

**Flows** - these encapsulate interactions that span multiple pages or components, or start at one location and end at another. Interactions for each page of the flow can be implemented directly in the Flow object, or by importing relevant Page/Component objects and calling their methods.

## Components

Components represent a sub-portion of the page, and are often shared across multiple pages (_though not always!_). A good example is the Sidebar Component, persisting across multiple pages in the My Home dashboard. It encapsulates element selectors and actions for only the Sidebar, leaving interactions on the main content pane for the respective Page objects.

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

---

## Page

Pages are to be used to represent a page in Calypso. It can hold attributes, class methods to interact with the page and define other helper functions.

A well-implemented page object will abstract complex interactions on the page to an easily understandable method call. The method should be well-contained, predictable and easy to understand. Code reuse is promoted via the following principles:

- **Don't Repeat Yourself (DRY)**: common actions can be called from the page object.
- **maintainability**: if a page changes, update the page object at one spot.
- **readability**: named variables and functions are much easier to decipher than series of strings.

```typescript
const selectors = {
	staticSelector: '.editor-post-title__input',
	dynamicSelector: (text: string) => `button:has-text("${text}")`,
};

/**
 * JSDoc is expected for Class definitions.
 */
export class FormPage {
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
		await this.page.fill(selectors.staticSelector),
	}
}

// Then, in a test file...

it( 'Test case', async function () {
	const somePage = new FormPage( this.page );
	await somePage.enterText( 'blah' );
} );
```

---

## Flows

Flows capture a process that spans across multiple pages or components. Its purpose is to abstract a multi-step flow into one call which clearly articulates its intention.

```typescript
/**
 * JSDoc is expected for flow class.
 */
export class SignupFlow {
	constructor( page: Page ) {
		// construct here
	}

	/**
	 * JSDoc is expected for methods.
	 */
	async signup( { user: string, email: string, password: string } ): Promise< void > {
		const componentA = new ComponentA( page );
		await componentA.fillSignupForm( user, email, password );
		const pageB = new PageB( page );
		await pageB.agreeToEULA();
		await pageB.submit();
		const componentC = new ComponentC( page );
		await componentC.navigateToDashboard();
	}
}

// Then in a test file...

const signupFlow = new SignupFlow( page );
await signupFlow.signup( ...params );
```

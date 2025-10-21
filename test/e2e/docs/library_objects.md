[← Writing tests](./writing_tests.md) | [Top](../README.md) | [Style Guide →](./style_guide.md)

# Library Objects

The `@automattic/calypso-e2e` package offers a robust set of library objects patterned after the Page Object Model. When developing a new test spec, try to leverage these objects as much as possible. Doing so will reduce code duplication and make test development faster.

For a brief introduction to Page Object Models, please refer to [this page](https://playwright.dev/docs/test-pom).

> ⚠️ **If adding a new library object file to `calypso-e2e`**: Make sure you update `index.ts` in the same directory to export the file's content otherwise it won't be available from the test project.

<!-- TOC -->

- [Library Objects](#library-objects)
  - [Distinction](#distinction)
  - [Components](#components)
  - [Page](#page)
  - [Flows](#flows)

<!-- /TOC -->

## Distinction

There exists clear distinction between pages and components.

**Components** - these form the smallest unit of functionality in a Page Object Model based library. Components represent functionality that is often embedded across distinct pages. For instance, if the same search bar is embedded on multiple pages, the search bar functionality is best abstracted as a SearchBarComponent.

Example: [NotificationComponent](../../../packages/calypso-e2e/src/lib/components/notifications-component.ts)

**Pages** - these are the most common objects in a Page Object Model. Each Page contains methods to interact with the page and any necessary helper methods. Selectors to support the methods should also be located in the file, but as a top-level constant.

The distinction between Pages and Flows is less clear, and the general recommendation is to prefer Pages unless Flows absolutely make sense.

Example: [EditorPage](../../../packages/calypso-e2e/src/lib/pages/editor-page.ts)

**Flows** - these encapsulate interactions that span multiple pages or components, or start at one location and end at another. Interactions for each page of the flow can be implemented directly in the Flow object, or by importing relevant Page/Component objects and calling their methods.

Example: [StartSiteFlow](../../../packages/calypso-e2e/src/lib/flows/start-site-flow.ts)

## Components

Components represent a sub-portion of the page, and are typically shared across multiple pages. A good example is the `SidebarComponent`, persisting across multiple pages in the Calypso dashboard.

The SidebarComponent, as an example, encapsulates element selectors and actions for only the Sidebar, leaving interactions on the main content pane for the respective Page objects.

```typescript
/**
 * Represents a reusable component for interacting with the sidebar.
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
await someComponent.clickOnMenu( 'My Home' );
```

---

## Page

Pages are to be used to represent a page in Calypso. It can hold attributes, class methods to interact with the page and define other helper functions. Pages can also import components and/or other pages to call their methods.

A well-implemented page object will abstract complex interactions on the page to an easily understandable method call. The method should be well-contained, predictable and easy to understand. Code reuse is promoted via the following principles:

- **Don't Repeat Yourself (DRY)**: common actions can be called from the page object.
- **Readability**: named variables and functions are much easier to decipher than series of strings.
- **readability**: named variables and functions are much easier to decipher than series of strings.

```typescript
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
		await this.page.fill( selectors.staticSelector );
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

```

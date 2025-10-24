# Library Objects

The `@automattic/calypso-e2e` package offers a set of library objects patterned after the Page Object Model. When developing a new test spec, try to leverage these objects as much as possible. Doing so will reduce code duplication and make test development faster.

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

TODO: include example of component using new framework

---

## Page

Pages are to be used to represent a page in Calypso. It can hold attributes, class methods to interact with the page and define other helper functions. Pages can also import components and/or other pages to call their methods.

A well-implemented page object will abstract complex interactions on the page to an easily understandable method call. The method should be well-contained, predictable and easy to understand. Code reuse is promoted via the following principles:

- **Don't Repeat Yourself (DRY)**: common actions can be called from the page object.
- **readability**: named variables and functions are much easier to decipher than series of strings.

```typescript
/**
 * Represents the generic Import Content page.
 */
export class ImportContentPage {
	private page: Page;

	readonly heading: Locator;
	readonly importFileContentPage: ImportFileContentPage;

	/**
	 * Constructs an instance of the page.
	 *
	 * @param {Page} page The underlying page.
	 */
	constructor( page: Page ) {
		this.page = page;

		this.heading = this.page.getByRole( 'heading', { name: 'Import Content' } );
		this.importFileContentPage = new ImportFileContentPage( page );
	}

	/**
	 * Navigates to the import content from Medium page.
	 *
	 * @param siteSlug Site slug.
	 */
	async visit( siteSlug: string ): Promise< void > {
		await this.page.goto( DataHelper.getCalypsoURL( `import/${ siteSlug }` ) );
	}
}
```

Then in a test spec (using a custom fixture)

```typescript
test( 'Three: As a New WordPress.com free plan user with a simple site, I can use the Calypso "Import Content" page to import my content from my Medium account', async ( {
	sitePublic,
	pageImportContent,
} ) => {
	await test.step( 'When I visit the "Import Content" page for my new site', async function () {
		await pageImportContent.visit( sitePublic.blog_details.site_slug );
	} );
} );
```

## Flows

Flows capture a process that spans across multiple pages or components. Its purpose is to abstract a multi-step flow into one call which clearly articulates its intention. Creating a single flow that has ten "steps" can be more efficient that creating ten different page objects to represent every step.

```typescript
/**
 * Class encapsulating the flow when starting a new writing blog (`/setup/start-writing`)
 */
export class StartWritingFlow {
	private page: Page;
	readonly yourBlogsReadyHeading: Locator;

	/**
	 * Constructs an instance of the flow.
	 *
	 * @param {Page} page The underlying page.
	 */
	constructor( page: Page ) {
		this.page = page;
		this.yourBlogsReadyHeading = this.page.getByRole( 'heading', { name: 'Your blog’s ready!' } );
	}

	/**
	 * Navigates to the /setup/start-writing endpoint.
	 * @returns {Promise<void>}
	 */
	async visit(): Promise< void > {
		await this.page.goto( DataHelper.getCalypsoURL( '/setup/start-writing' ) );
	}
}
```

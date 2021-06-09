# Style Guide

<!-- TOC -->

- [Style Guide](#style-guide)
  - [Naming Branches](#naming-branches)
  - [Async / Await](#async--await)
  - [Page Objects](#page-objects)
  - [Use of this, const and let](#use-of-this-const-and-let)
  - [Catching errors in a step block](#catching-errors-in-a-step-block)
  - [Waiting for elements](#waiting-for-elements)

<!-- /TOC -->

## Naming Branches

We follow the Automattic [branch naming scheme](https://github.com/Automattic/wp-calypso/blob/HEAD/docs/git-workflow.md#branch-naming-scheme).

## Async / Await

We use async functions and `await` to wait for commands to finish. This lets asynchronous methods execute like synchronous methods.
For every method which returns a promise or thenable object `await` should be used. Keep in mind that `await` is only valid inside async function.

We don't chain function calls together and avoid using `.then` calls.

**Avoid**:

```
async function openModal() {
	const modalButtonLocator = By.css( 'button.open-modal' );
	const modalLocator = By.css( '.modal' );
	await driverHelper
		.clickWhenClickable( this.driver, modalButtonLocator )
		.then( () => driverHelper.waitUntilElementLocatedAndVisible( modalLocator ) );
}
```

**Instead**:

```
async function openModal() {
	const modalButtonLocator = By.css( 'button.open-modal' );
	const modalLocator = By.css( '.modal' );
	await driverHelper.clickWhenClickable( this.driver, modalButtonLocator );
	await driverHelper.waitUntilElementLocatedAndVisible( modalLocator );
}
```

## Page Objects

All pages have asynchronous functions. Constructors for pages can't be asynchronous so we never construct a page object directly (using something like `new PageObjectPage(...)`), instead we use the static methods `Expect` and `Visit`, which are on the asyncBaseContainer and hence available for every page, to construct the page object.

**Avoid**:

```
step( 'Can select domain only from the domain first choice page', function() {
	const domainFirstChoicePage = new DomainFirstPage( driver );
	return await domainFirstChoicePage.chooseJustBuyTheDomain();
} );
```

**Instead** if you're expecting a page to appear during a flow:

```
step( 'Can select domain only from the domain first choice page', function() {
	const domainFirstChoicePage = await DomainFirstPage.Expect( driver );
	return await domainFirstChoicePage.chooseJustBuyTheDomain();
} );
```

or to directly visit a page:

```
step( 'Can select domain only from the domain first choice page', function() {
	const domainFirstChoicePage = await DomainFirstPage.Visit( driver );
	return await domainFirstChoicePage.chooseJustBuyTheDomain();
} );
```

> :warning: not all pages can be visited as they require a direct URL to be defined, some pages come only as part of flows (eg. sign up pages)

## Use of this, const and let

It is preferred to use `const`, or `let`, instead of `this`, as the scope is narrower and less likely to cause confusion across test steps.

**Avoid**:

```
step( 'Can select domain only from the domain first choice page', function() {
	this.domainFirstChoicePage = await DomainFirstPage.Expect( driver );
	return await this.domainFirstChoicePage.chooseJustBuyTheDomain();
} );
```

**Instead**:

```
step( 'Can select domain only from the domain first choice page', function() {
	const domainFirstChoicePage = new DomainFirstPage( driver );
	return await domainFirstChoicePage.chooseJustBuyTheDomain();
} );
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

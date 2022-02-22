<div style="width: 45%; float:left" align="left"><a href="./style_guide.md"><-- Style Guide</a> </div>
<div style="width: 5%; float:left" align="center"><a href="./../README.md">Top</a></div>
<div style="width: 45%; float:right"align="right"><a href="./debugging.md">Debugging --></a> </div>

# Patterns, Tricks, and Gotcha's

<!-- TOC -->

- [Patterns, Tricks, and Gotchas](#patterns-tricks-and-gotchas)
  - [Asserting against page content](#asserting-against-page-content)
    - [Returned values and Jest expect()](#returned-values-and-jest-expect)
	- [Using waitForSelector, text selectors, and 'validate*' methods](#using-waitforselector-text-selectors-and-validate-methods)
  - [Race conditions with handler registration](#race-conditions-with-handler-registration)
  - [Handling Calypso navigation](#handling-calypso-navigation)

<!-- /TOC -->

## Asserting against page content

Let's say you want to validate some state or content on a page in Calypso. How should you go about doing that? There are two patterns that are used throughout our E2E tests.

### Returned values and Jest expect()

If it's easy to find and return some discrete piece of information from the page under test, you can return that discrete value from the POM class function, and assert against it using the Jest `expect` library.

Example:

```typescript
// In the POM class...
async getActiveTabName(): Promise< string > {
	return 'foo';
}

// In the test spec...
it( 'Active tab is "foo"', async function () {
	expect( await pomClass.getActiveTabName() ).toBe( 'foo' );
} );
```

**Be Warned!** This is not always as easy as it seems! Many of Playwright's functions that check state (like `isVisible()`) return _immediately_. This can be really tricky with async React apps like Calypso, which often require some measure of waiting for state to be propogated and components to be rendered.

For that reason, a more wait-safe option you will often see is...

### Using waitForSelector, text selectors, and 'validate*' methods

You can validate something about a given page under test by leveraging Playwright's [waitForSelector](https://playwright.dev/docs/api/class-page#page-wait-for-selector) function (or the comparable [locator.waitFor](https://playwright.dev/docs/api/class-locator#locator-wait-for) function).

Because these functions throw an error if the provided selector is not found within the timeout period, they can be used for validation, as the thrown error will fail the test. This, combined with [Playwright's powerful syntax for text-based selectors](https://playwright.dev/docs/selectors#text-selector), can provide an effective way to do wait-safe validation during a test.

If you are doing a simple text validation, you can can include the `waitForSelector` call directly in the testing spec. However, if the selector is more complicated or has logic, it should be included in the POM class in a function prefixed with `validate*`.

Example:

```typescript
// In the POM class...
async validateActiveTab( name: string ): Promise< void > {
	if ( envVariables.VIEWPORT_NAME === 'mobile' ) {
		this.page.waitForSelector( selectors.mobileActiveTab( name ) );
	} else {
		this.page.waitForSelector( selectors.desktopActiveTab( name ) );
	}
}

// In the test spec...
it( 'Active tab is "foo"', async function () {
	await pomClass.validateActiveTab( 'foo' );
} );
```

## Race conditions with handler registration

Good news! Playwright has a lot of [built-in auto-waiting](https://playwright.dev/docs/actionability) that keys off of various attributes and states of elements in the DOM.

Bad news... Sometimes that's not enough in Calypso.

Because Calypso is a React app and Playwright is blazingly fast, there are rare race conditions that can happen on pages where an elements attributes may not accurately reflect it's immediate actionability. For example, there may be a button in the DOM that is loaded and rendered as part of some on-page asynchronous operation. That button may be visible and not marked as `disabled`, but it event handler isn't registered yet. Playwright can sometimes be so fast it clicks on that button before the handler is registered! In this case, Playwright thinks the element is visible and enabled, and so proceeds with the click. That click is swallowed by the void, and the test then fails.

So what can you do when this happens??

Best practice usually recommends only ever waiting on elements you are going to interact with directly. However, in these cases, it's often best to try to find something in the component's lifecycle that you can reliably key off of to know the component is done loading and rendering. Often this is another element or some text that appears on the page. After waiting on that "informative" element's selector, you can then proceed with the action you need to take on the element under test.

## Handling Calypso navigation

Being a single-page React application, "navigation" in Calypso is often not true, traditional web page navigation. There are also several places in Calypso where an asynchronous redirect will fire that changes which component is rendered on the page.

Playwright has two patterns that are very helpful for handling these kinds of cases:

- [Asynchronous navigation](https://playwright.dev/docs/navigations#asynchronous-navigation)
- [Multiple navigations](https://playwright.dev/docs/navigations#multiple-navigations)
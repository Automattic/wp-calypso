[← Documentation index](./overview.md)

# Style Guide

<!-- TOC -->

- [Style Guide](#style-guide)
  - [Principles](#principles)
  - [Specification structure](#specification-structure)
    - [Test describe block](#test-describe-block)
    - [Test block](#test-block)
    - [Test step block](#test-step-block)
  - [Variable naming](#variable-naming)
  - [Use async/await](#use-asyncawait)
  - [Selectors](#selectors)
    - [No selectors within class definition](#no-selectors-within-class-definition)
    - [Extract repetitive selectors](#extract-repetitive-selectors)
    - [Do not use Xpath](#do-not-use-xpath)
    - [Prefer user-facing selectors](#prefer-user-facing-selectors)
    - [Naming](#naming)
    - [Involve minimal selectors in methods](#involve-minimal-selectors-in-methods)
    - [Convert repetitive variations to dynamic selector](#convert-repetitive-variations-to-dynamic-selector)
  - [Test steps](#test-steps)
    - [Only one top-level test.describe block](#only-one-top-level-testdescribe-block)
    - [Do not use modal verbs in step names](#do-not-use-modal-verbs-in-step-names)
    - [Prefer smaller steps](#prefer-smaller-steps)
  - [Single responsibility function](#single-responsibility-function)
  - [Destructure parameters](#destructure-parameters)

<!-- /TOC -->

## Principles

- YAGNI: You Ain’t Gunna Need It
- KISS: Keep It Stupidly Simple

## Specification structure

A consistent structure means tests are not only easier to read and update, but the generated
test reports read as system specifications:

![Playwright Test Report Example](./files/example_test_report.webp 'Playwright Test Report Example')

### Test describe block

Details the feature.

Example: `test.describe( 'Authentication: Apple', () => {`

Contains feature name: Authentication, and optional sub-feature name: Apple

### Test block

Details the test scenario. Each test scenario within a feature should be independent from the
others and be capable of running independently and in parallel with other test scenarios.

Example: `test( 'As a WordPress.com user, I can use my Apple Id to authenticate ', async ( {`

Uses the [user story format](https://en.wikipedia.org/wiki/User_story):
`As a <role> I can <capability> (optional so that <receive benefit>)`

### Test step block

Details an individual test step as part of a test scenario.

Examples:

`await test.step( 'Given I am on the login page', async function () {`

`await test.step( 'When I enter my Apple ID', async function () {`

`await test.step( 'And I enter my Apple password', async function () {`

`await test.step( 'Then I can see My Home on WordPress.com', async function () {`

These typically start with the terms [Given/When/Then](https://en.wikipedia.org/wiki/Given-When-Then)
to provide structure and readability, although this isn’t strictly enforced like other tools
that parse plain text specifications. The term And can be used to join two steps of the same
type.

`Given <some precondition> When <some action> Then <some outcome>`

---

## Variable naming

Variables that derive from a page/component/flow object (eg. SidebarComponent) should be named after the object following camelCase convention.

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

## Use async/await

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

Selectors are the core of automated e2e testing. The Playwright project has an excellent documentation page on [selectors](https://playwright.dev/docs/selectors) and [best practices](https://playwright.dev/docs/selectors#best-practices).

Ideally, a selector satisfies all of the following:

- **unique**: one selector, one element.
- **reliable**: the same element is selected with each iteration.
- **brief**: selector is short and easy to read.

The following guidance are in addition to suggestions by the Playwright project.

### No selectors within class definition

Place selectors within the same file, but outside of the class representing the object. Never place a selector within the class definition itself.

For examples see [EditorPage](https://github.com/Automattic/wp-calypso/blob/8428228ee6547007faf3e765133d2396967d504a/packages/calypso-e2e/src/lib/pages/editor-page.ts) or [NotificationComponent](https://github.com/Automattic/wp-calypso/blob/8428228ee6547007faf3e765133d2396967d504a/packages/calypso-e2e/src/lib/components/notifications-component.ts).

**Avoid**:

```typescript
class SomeObject() {
	submitButtonSelector: 'button[type="submit"]'
}
```

**Instead**:

```typescript
const selectors = {
	submitButton: 'button[type="submit"]',
};

class SomeObject() {
	async someMethod(): {
		await this.page.click( selectors.submitButton )
	}
}
```

### Extract repetitive selectors

While one-off selectors within a code block is acceptable, if the same selector is used more than twice, move the selector into the `selectors` object:

**Avoid**:

```typescript
class SomeObject() {
	async doSomething() {
		await this.page.click( '#submit' );
	}

	async doSomethingElse() {
		await this.page.click( '#submit' ); // Notice the #submit selector is used twice.
	}
}
```

**Instead**:

```typescript
const selectors = {
	submitButton: '#submit', // Move it into the `selectors` object.
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

### Do not use Xpath

This is simple; do not use Xpath selectors.

**Avoid**:

```typescript
const locator = page.locator( '//button' );
```

**Instead**:

```typescript
await locator = page.locator( 'button' ); // or 'button[type="submit"]' or literally anything else.
```

### Prefer user-facing selectors

Where possible, prefer user-facing attributes such as ARIA, user-facing text, role selectors. Use CSS selectors as last resort if no other suitable selectors can be found.

See also: [the Playwright maintainers' definitive guide](https://playwright.dev/docs/selectors#best-practices).

**Avoid**:

```typescript
await page.click( 'div.someclass .yet-another-class .attribute .very-long-attribute' );
await page.click( 'button .is-highlighted' );
```

**Instead**:

```typescript
await page.click( 'button:has-text("Submit")' ); // Text based selector.
await page.click( 'button[aria-label="Some Class"]' ); // ARIA selector.
await page.click( 'role=spinbutton[name="Continue"]' ); // Role-based selector.
```

### Naming

Name selectors based on function, type and description. Try to avoid using element location unless multiple similar buttons exist. This way the selector name does not become outdated if the UI changes.

Do not append the term 'Selector' or similar to the selector name. It is redundant.

**Avoid**:

```typescript
const selectors = {
	contactButtonOnHeaderPane: '.button contact-us', // What if the button moves?
	secondButtonOnPopupSelector: '.button send-form', // Breaks the 'selector' sub-rule.
	select: 'select.month', // Not descriptive at all.
};
```

**Instead**:

```typescript
const selectors = {
	contactUsButton: '.button contact-us',
	submitFormButton: '.button send-form',
	monthSelect: 'select.month',
};
```

### Involve minimal selectors in methods

When method(s) need to wait on an element on the page, involve the minimal number of selectors as possible. Playwright has a strong [auto-wait mechanism](https://playwright.dev/docs/actionability) that handles 95% of the cases.

For instance, when loading the Calypso Media page:

- Good: wait either on the gallery being present, or the thumbnails having generated.
- Bad: wait on the header text _and_ the gallery _and_ the upload button _and_ the thumbnails.

**Avoid**:

```typescript
await this.page.waitForSelector( 'h1:has-text("New Page")' ); // Waiting for the h1 accomplishes nothing except to add another selector to complicate matters.
await this.page.fill( 'input[placeholder="New Text"]' );
```

**Instead**:

```typescript
await this.page.fill( 'input[placeholder="New Text"]' );
```

### Convert repetitive variations to dynamic selector

Combine similar or repetitive selectors into a dynamic selector.
Dynamic selector is also useful when the target selector depends on a known conditional (eg. mobile/desktop, language).

**Avoid**:

```typescript
const selectors = {
	submitButton: 'button:text("Submit")',
	cancelButton: 'button:text("Cancel")',
	pauseButton: 'button:text("Pause")',
	// Note the repetitive selectors varying only by text.
};
```

**Instead**:

```typescript
const selectors = {
	button: ( action: string ) => `button:text("${ action }")`,
};

// then, in the POM

async funtion clickButton( text: string ) {
	await this.page.click( selectors.button( text ) );
}
```

---

## Test steps

### Only one top-level `test.describe` block

Only place one top/root-level `test.describe` block. The tags that select the spec on CI are
declared on it.

Multiple root-level `test.describe` blocks are a sign that the file needs to be split into smaller files or the flow re-examined.

**Avoid**:

```typescript
test.describe( 'Feature 1', { tag: [ tags.CALYPSO_PR ] }, () => {} );

test.describe( 'Feature 2', { tag: [ tags.CALYPSO_PR ] }, () => {} );

test.describe( 'Feature 3', { tag: [ tags.CALYPSO_PR ] }, () => {} );
```

**Instead**:

```typescript
// In feature__sub-feature-1.spec.ts
test.describe( 'Feature: Sub-feature 1', { tag: [ tags.CALYPSO_PR ] }, () => {} );

// In feature__sub-feature-2.spec.ts
test.describe( 'Feature: Sub-feature 2', { tag: [ tags.CALYPSO_PR ] }, () => {} );
```

### Do not use modal verbs in step names

Avoid the use of modal verbs such as `can`, `should`, `could` or `must` in a `test.step` name.
Instead state the action the step performs, or the end result of what _should_ happen after it.

Test names are the exception: they use the user story format, so `can` belongs there.

**Avoid**:

```typescript
await test.step( 'Given I can be logged in', async function () {} );

await test.step( 'When I should be able to start a new post', async function () {} );
```

**Instead**:

```typescript
await test.step( 'Given I am logged in', async function () {} );

await test.step( 'When I start a new post', async function () {} );
```

### Prefer smaller steps

Break large steps into smaller pieces for clarity and ease of debugging.

**Avoid**:

```typescript
await test.step( 'When I log in, select the home page and start a search', async function () {
	// too many things done here.
} );
```

**Instead**:

```typescript
await test.step( 'Given I am logged in', async function () {} );

await test.step( 'When I navigate to the home page', async function () {} );

await test.step( `And I search for '${ query }'`, async function () {} );
```

---

## Single responsibility function

Each function should focus on one or two key responsibilities.
Avoid overloading the function to perform increasing number of tasks.

**Avoid**

```typescript
async function publish(
	tags = '',
	saveFirst = false,
	visitAfter = false,
	setDate = ''
): Promise< void > {
	// This function is responsible for too many tasks.
	// The first clue is the long list of parameters.
	// A publishing function should publish and only publish, and do that well.
}
```

**Instead**

```typescript
async function publish( { visitAfter }: { visitAfter: boolean } = {} ): Promise< void > {
	// Publish post, and possibly visit the post after publishing.
}

async function saveDraft(): Promise< void > {
	// Saves post as draft first.
}

async function applyTags( tags: string[] ): Promise< void > {
	// Applies tags.
}

async function setPublishDate( date: string ): Promise< void > {
	// Sets the publish date.
}
```

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

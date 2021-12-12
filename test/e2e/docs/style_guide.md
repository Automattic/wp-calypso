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
    - [Involve minimal selectors](#involve-minimal-selectors)
    - [Convert repetitive variations to dynamic selector](#convert-repetitive-variations-to-dynamic-selector)
  - [Test steps](#test-steps)
    - [Avoid modal verbs](#avoid-modal-verbs)
    - [Prefer smaller steps](#prefer-smaller-steps)
  - [Focused function](#focused-function)
  - [Destructure parameters](#destructure-parameters)

<!-- /TOC -->

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

### No selectors in class

Place selectors within the same file, but outside of the class representing the object. Never place a selector within the class definition itself.

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

### Move repetitive selectors out

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

### Prefer user-facing selectors

Where possible, use text, CSS or user-facing attributes (like an `aria-label` instead of a `class` name). These are less likely to change over time.

**Avoid**:

```typescript
await page.click( 'xpath=//button' );
await page.click( 'div.someclass .yet-another-class .attribute .very-long-attribute)
```

**Instead**:

```typescript
await page.click( 'button:has-text("Submit")' );
await page.click( 'button[aria-label="Some Class"]' );
```

### Naming

Name selectors based on function, type and description. Try to avoid using element location unless multiple similar buttons exist.

Do not append the term 'Selector' or similar to the selector name. It is redundant.

**Avoid**:

```typescript
const selectors = {
	contactButtonOnHeaderPane: '.button contact-us',
	secondButtonOnPopupSelector: '.button send-form',
};
```

**Instead**:

```typescript
const selectors = {
	contactUsButton: '.button contact-us',
	submitFormButton: '.button send-form',
};
```

### Involve minimal selectors

Only involve selectors that are required for the test flow. Do not wait on unrelated selectors.

**Avoid**:

```typescript
await this.page.waitForSelector( '.some-unnecessary-selector-not-related-to-the-test-flow' );
await this.page.fill( '.someclass__form-input .is-selected' );
```

**Instead**:

```typescript
await this.page.fill( 'input[aria-placeholder="Enter contact details"]' );
```

### Convert repetitive variations to dynamic selector

Combine many selectors into one dynamic selector.
Dynamic selector is also useful when the target selector depends on a known conditional (eg. mobile/desktop, language).

**Avoid**:

```typescript
const selectors = {
	submitButton: ':text("Submit")',
	cancelButton: ':text("Cancel")',
	pauseButton: ':text("Pause")',
};
```

**Instead**:

```typescript
const selectors = {
	button: ( action: string ) => `:text("${ action }")`,
};
```

---

## Test steps

### Avoid modal verbs

Avoid the use of modal verbs such as `can`, `should`, `could` or `must`.
Instead state the action(s) the step is expected to perform.

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

### Prefer smaller steps

Use more of smaller steps over monolithic step.

**Avoid**:

```typescript
it( 'Log in, select home page and start a search', async function () {
	// too many things done here.
} );
```

**Instead**:

```typescript
it( 'Log In', async function () {} );

it( 'Navigate to home page', async function () {} );

it( 'Search for ${string}', async function () {} );
```

---

## Focused function

Each function should focus on one or two purposes only.
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

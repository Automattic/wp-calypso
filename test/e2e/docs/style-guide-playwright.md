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

Name selectors based on function, type and description. Try to avoid using element location unless multiple similar buttons exist.

Do not append the term 'Selector' or similar to the selector name. It is redundant.

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

### Aim for stability

Only involve selectors that are required for the test flow.

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
}
```

**Instead**:

```typescript
const selectors = {
	button: (action: string) => `:text("${action}")`,
}
```

---

## Test steps

### Avoid modla verbs

Avoid the use of modal verbs such as `can`, `should`, `could` or `must`.
Instead state the action contained in the step using plain terms.

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

Prefer more of smaller steps.

**Avoid**:

```typescript
it( 'Log in, select home page and start a search', async function() {
	// too many things done here.
} );
```

**Instead**:

```typescript
it( 'Log In' );

it( 'Navigate to home page' );

it( 'Search for ${string}' );
```

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

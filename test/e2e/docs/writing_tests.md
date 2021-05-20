# Writing Tests

This document will outline tips to write successful tests for both Selenium and Playwright suites.

Refer to the [style guide](docs/style-guide.md) for coding style information.

## Table of contents

<!-- TOC -->

- [Writing Tests](#writing-tests)
  - [Table of contents](#table-of-contents)
  - [Selector](#selector)
  - [Component](#component)
  - [Page](#page)
    - [Structure](#structure)
    - [Guidelines](#guidelines)
  - [Flow](#flow)
    - [Structure](#structure)
    - [Guidelines](#guidelines)
  - [Gutenberg Blocks](#gutenberg-blocks)

<!-- /TOC -->

## Selector

Selectors form the core of any automated e2e test scripts. For a quick overview of selectors, please refer to the [MDN page on CSS selectors](https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Selectors).

For modern automated e2e tests, `CSS` selectors are mainstream, although `xpath` and text selectors are also sometimes used.

Ideally, a selector satisfies all of the following:

- **unique**: one selector, one element.
- **reliable**: the same element is selected with each iteration.
- **brief**: selector is short and easy to read.

## Component

Components cover elements that persist across multiple pages.

Encapsulating behavior of a component in an object permits code reuse, promotes object oriented thinking and separation of duties.

On `wp-calypso`, some components are:

- left sidebar
- master bar

## Page

Page Object Model (or _POM_ for short) is a common technique used for automated end-to-end testing.

Similar to a `Class` in software development, the POM groups together attributes, functions and other code on a page.

Automated end-to-end tests create instances of page objects to invoke actions on the page.

Similar to comonents, page objects encourage:

- **Don't Repeat Yourself (DRY)**: common actions can be called from the page object.
- **maintainability**: if a page changes, update the page object at one spot.
- **readability**: named variables and functions are much easier to decipher than series of strings.

Developers should add a new page object under `test/e2e/lib/pages` upon completion of a feature that adds a new page not covered by existing page objects.

Take a look at some examples in the directory above for general structure and guideline in implementing a new page object.

### Structure

```
external dependencies

internal dependencies

constants

export default class <class_name> {
    constructor

    interactions to simulate on page
}
```

eg. `test/e2e/lib/pages/cancel-domain-page.js`

```
export default class CancelDomainPage extends AsyncBaseContainer {
	constructor()
        // instantiate the page object here, as well as selectors used to interact with objects on the DOM.
        const confirmButtonSelector = some value

	async completeSurveyAndConfirm()
    // cancel domain page asks user to complete a survey - this function implements that behavior.

	async waitToDisappear()
    // helper function to encapsulate waiting for the overlay to disappear once cancel is confirmed.
```

### Guidelines

- selectors used more than once throughout the file is a good candidate to be turned into a constant.
- strive to keep functions small and focused.

## Flow

Flows can be considered as encapsulating a set of user actions that begin at Point A and end at Point B. In a sense, a given e2e test script is a _flow_ as well.

For the purpose of this document however, a flow typically refers to a set of actions constrained within a feature or two:

- **user login**: beginning at login page and ending at the successful completion of the login process.
- **new site onboarding**: beginning at selecting site name and ending with confirmation of site creation.

### Structure

Flows are larger in scope than page objects, typically executing actions across multiple (related) pages.

```
external dependencies

internal dependencies

constants

export default class <class_name> {
    constructor

    interactions

    helper functions
}
```

eg. `test/e2e/lib/flows/login-flow.js`

```
export default class LoginFlow {
    constructor()
        // instantiate selectors and any other attributes that will help legibility here.
        const selector = selector

    login(parameters)
        // navigate to the login page
        // select fields
        // enter data
        // submit and wait for confirmation

    loginAndStartNewPost(parameters)
        // leverage the login() method and perform additional tasks on top of that.
}
```

### Guidelines

- aggressively refactor such that basic actions can be extended by other functions.
- tightly control scope so that flows do not become the e2e tests themselves.

## Gutenberg Blocks

It's preferable to put specific block tests into same spec file. For example, all Markdown Block tests should be added in `specs/gutenberg-markdown-block-spec.js`.

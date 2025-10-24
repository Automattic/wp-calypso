# (New) Style Guide

## Table of contents

- [Principles](#principles)
- [Specifications Structure](#specifications-structure)
  - [Test Describe Block](#test-describe-block)
  - [Test Block](#test-block)
  - [Test Step Block](#test-step-block)

## Principles

- YAGNI: You Ain’t Gunna Need It
- KISS: Keep It Stupidly Simple

## Specifications Structure

Having a consistent structure means that tests are not only easier to read and update, but test reports generated are easy to read as system specifications:

![Playwright Test Report Example](./files/example_test_report.png 'Playwright Test Report Example')

### Test Describe Block

Details the feature.

Example: `test.describe( 'Authentication: Apple', () => {`

Contains feature name: Authentication, and optional sub-feature name: Apple

### Test Block

Details the test scenario. Each test scenario within a feature should be independent from the others and be capable of running independently and in parallel with other test scenarios.

Example: `test( 'As a WordPress.com user, I can use my Apple Id to authenticate ', async ( {`

Uses the [user story format](https://en.wikipedia.org/wiki/User_story): `As a <role> I can <capability> (optional so that <receive benefit>)`

### Test Step Block

Details an individual test step as part of a test scenario.

Examples:

`await test.step( 'Given I am on the login page', async function () {`

`await test.step( 'When I enter my Apple ID', async function () {`

`await test.step( 'And I enter my Apple password', async function () {`

`await test.step( 'Then I can see My Home on WordPress.com', async function () {`

These typically start with the terms [Given/When/Then](https://en.wikipedia.org/wiki/Given-When-Then) to provide structure and readability, although this isn’t strictly enforced like other tools that parse plain text specifications. The term And can be used to join two steps of the same type.

`Given <some precondition> When <some action> Then <some outcome>`

### Page Objects and Flows

TBD

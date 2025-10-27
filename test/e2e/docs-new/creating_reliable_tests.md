# Creating Reliable Tests

## Table of contents

- [Using `repeat-each` to test your tests](#using-repeat-each-to-test-your-tests)
- [Use `expect.poll` to poll for expected values](#use-expectpoll-to-poll-for-expected-values)
- [Repeatable tests using new WordPress.com sites](#repeatable-tests-using-new-wordpresscom-sites)

## Using `repeat-each` to test your tests

[Playwright Test](https://playwright.dev/docs/test-intro) is a popular end-to-end testing framework for web applications. You can utilise Playwright Test's built-in `repeat-each` parameter to ensure that a new or updated test runs consistently in parallel and numerous times.

For example, running this test 100 times should result in 100 passes if the test is reliable, which is a good indication that the test is repeatable and reliable.

```
yarn test:pw ./specs/dashboard/dashboard__authentication.spec.ts --repeat-each=100

Running 100 tests using 10 workers
  100 passed (1.7m)
```

## Use `expect.poll` to poll for expected values

Given the following function on a page object:

```
async is404Page(): Promise< boolean > {
    return this.page.getByRole( 'heading', { name: '404 Not Found' } ).isVisible();
}
```

If you were to use a standard `expect` call the test may be unreliable since the 404 heading may NOT be immediately visible.

```
await test.step( 'Then I see a 404 error page', async function () {
    expect( await pageDashboard.is404Page() ).toBe( true ); // Don't do this: using a standard expect call is unreliable because the heading may not be immediately visible, which can result in flaky tests.
} );
```

Instead you should use Playwright's built-in polling mechanism to ensure that the page is indeed a 404:

```
await test.step( 'Then I see a 404 error page', async function () {
    await expect.poll( async () => await pageDashboard.is404Page() ).toBe( true );
} );
```

This is because `.isVisible();` returns immediately and does not wait for the element to become visible, which may lead to flaky tests.

If you are not using a page object function to return the visibility, you can use `.toBeVisible`, which automatically waits for the element to become visible using built-in polling:

```
    await expect( page.getByRole( 'heading', { name: '404 Not Found' } ) ).toBeVisible();
```

## Repeatable tests using new WordPress.com sites

Tests should be repeatable so that they can be run in parallel across different devices. Any e2e test that updates a setting or performs an action with lasting effects should be run against a new site.

For example, changing site visibility settings from public to private or password protected shouldn't be done on an existing test site as if two of these tests are running at the same time, for example on desktop and mobile, or across different TeamCity jobs on different pull requests, they can potentially overwrite the site visibility settings at the same time as another test causing non-deterministic results.

A fixture is a reusable setup or resource in your tests, such as a test site, user, or configuration, that helps ensure tests run in a consistent and isolated environment.

For example, you might use a fixture to automatically create a new WordPress.com site before each test and delete it afterwards, ensuring that each test runs with a fresh site and does not interfere with others.

Fortunately the [custom fixtures](./custom-fixtures.md), specifically the public site fixture `sitePublic`, allow you to quickly spin up and tear down a public site that can easily be used to independently test things like changing site visibility settings or importing site content.

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

## Capturing a browser API response

There are some use-cases where we want to capture the API response in the browser, for example when creating a new user account on WordPress.com, the browser calls `https://public-api.wordpress.com/rest/v1.1/users/new?http_envelope=1` and we want to capture the response which includes `username` and `user_id`.

```typescript
async signupWithEmail( email: string ): Promise< NewUserResponse > {
    await this.page.fill( selectors.emailInput, email );

    // Click the button first, then wait for the response
    await this.page.click( selectors.submitButton );

    const response = await this.page.waitForResponse( /.*new\?.*/, { timeout: 20000 } );

    if ( ! response ) {
        throw new Error( 'Failed to sign up as new user: no or unexpected API response.' );
    }

    return await response.json();
}
```

If we do a standard call to `waitForResponse(...)` followed by `await response.json();` like above the issue arises that by the time the call to retrieve the json is conducted the browser has automatically navigated to a different page, which means this results in an exception: `Error: response.body: Target page, context or browser has been closed`

A way to capture this response before the browser moves on is to intercept the route, capture the response and fulfill the original request:

```typescript
async signupWithEmail( email: string ): Promise< NewUserResponse > {
    await this.page.fill( selectors.emailInput, email );

    const responsePromise = new Promise< NewUserResponse >( ( resolve, reject ) => {
        this.page.route(
            /.*\/users\/new\?.*/,
            async ( route ) => {
                try {
                    const response = await route.fetch();
                    const body = await response.body();
                    // Fulfill the original request
                    await route.fulfill( { response } );
                    // Resolve the promise with the parsed body
                    resolve( JSON.parse( body.toString() ) as NewUserResponse );
                } catch ( error ) {
                    reject( error );
                }
            },
            { times: 1 }
        );
    } );

    // Trigger the signup.
    await this.page.click( selectors.submitButton );

    // Wait for the promise to be resolved by the route handler.
    return responsePromise;
}
```

This approach ensures the response is captured consistently.

## Repeatable tests using new WordPress.com sites

Tests should be repeatable so that they can be run in parallel across different devices. Any e2e test that updates a setting or performs an action with lasting effects should be run against a new site.

For example, changing site visibility settings from public to private or password protected shouldn't be done on an existing test site as if two of these tests are running at the same time, for example on desktop and mobile, or across different TeamCity jobs on different pull requests, they can potentially overwrite the site visibility settings at the same time as another test causing non-deterministic results.

A fixture is a reusable setup or resource in your tests, such as a test site, user, or configuration, that helps ensure tests run in a consistent and isolated environment.

For example, you might use a fixture to automatically create a new WordPress.com site before each test and delete it afterwards, ensuring that each test runs with a fresh site and does not interfere with others.

Fortunately the [custom fixtures](./custom-fixtures.md), specifically the public site fixture `sitePublic`, allow you to quickly spin up and tear down a public site that can easily be used to independently test things like changing site visibility settings or importing site content.

Please note that unless you are behind an a8c proxy (Trialmattician or external contributor) spawning multiple new sites in quick sucession will hit an API rate limit.

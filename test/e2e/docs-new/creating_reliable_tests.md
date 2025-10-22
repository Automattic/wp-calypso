## Creating Reliable Tests

### Using `repeat-each` to test your tests

You can utilise Playwright Test's built-in `repeat-each` parameter to ensure that a new or updated test runs consistently in parallel and numerous times.

For example, running this test 100 times produces 100 passes which is a good signal the test is repeatable and reliable.

```
yarn test:pw ./specs/dashboard/dashboard__authentication.spec.ts --repeat-each=100

Running 200 tests using 10 workers
  200 passed (1.7m)
```

### Use `expect.poll` to poll for expected values

Given the following function on a page object:

```
async is404Page(): Promise< boolean > {
    return this.page.getByRole( 'heading', { name: '404 Not Found' } ).isVisible();
}
```

If you were to use a standard `expect` call the test can be unreliable since the 404 heading may NOT be immediately visible.

```
await test.step( 'Then I see a 404 error page', async function () {
    expect( await pageDashboard.is404Page() ).toBe( true ); // Don't do this
} );
```

Instead you should use Playwright's built-in polling mechanism to ensure that the page is indeed a 404:

```
await test.step( 'Then I see a 404 error page', async function () {
    await expect.poll( async () => await pageDashboard.is404Page() ).toBe( true );
} );
```

This is because `.isVisible();` returns immediately.

If you are not using a page object function to return the visibility you can use `.toBeVisible` which has built-in polling:

```
    await expect( page.getByRole( 'heading', { name: '404 Not Found' } ) ).toBeVisible();
```

### Capturing a browser API response

There are some use-cases where we want to capture the API response in the browser, for example when creating a new user account on WordPress.com, the browser calls `https://public-api.wordpress.com/rest/v1.1/users/new?http_envelope=1` and we want to capture the response which includes `username` and `user_id`.

```ts
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

```ts
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

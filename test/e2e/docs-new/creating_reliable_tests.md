## Creating Reliable Tests

### Using `repeat-each` to test your tests

You can utilise Playwright Test's in built `repeat-each` parameter to ensure that a new or updated test runs consistently in parallel and numerous times.

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

Instead you should use Playwright's in built polling mechanism to ensure that the page is indeed a 404:

```
await test.step( 'Then I see a 404 error page', async function () {
    await expect.poll( async () => await pageDashboard.is404Page() ).toBe( true );
} );
```

This is because `.isVisible();` returns immediately.

If you are not using a page object function to return the visibility you can use `.toBeVisible` which has in built polling:

```
    await expect( page.getByRole( 'heading', { name: '404 Not Found' } ) ).toBeVisible();
```

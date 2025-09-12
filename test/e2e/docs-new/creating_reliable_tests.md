## Creating Reliable Tests

You can utilise Playwright Test's in built `repeat-each` parameter to ensure that a new or updated test runs consistently in parallel and numerous times.

For example, running this test 100 times produces 100 passes which is a good signal the test is repeatable and reliable.

```
yarn test:pw ./specs/dashboard/dashboard__authentication.spec.ts --repeat-each=100

Running 200 tests using 10 workers
  200 passed (1.7m)
```

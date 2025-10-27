# Custom Fixtures

## Table of contents

- [Background](#background)
- [Example](#example)
- [Location of Fixtures](#location-of-fixtures)
- [Naming of Fixtures](#naming-of-fixtures)

## Background

> "Playwright Test is based on the concept of test fixtures. Test fixtures are used to establish the environment for each test, giving the test everything it needs and nothing else. Test fixtures are isolated between tests. With fixtures, you can group tests based on their meaning, instead of their common setup."

[Playwright Test Fixtures](https://playwright.dev/docs/test-fixtures)

## Example

```typescript
import { expect, test } from '../lib/pw-base';

test( 'should login and load editor', async ( { pageEditor, pageLogin } ) => {
	await pageLogin.login( 'user', 'pass' );
	await pageEditor.open();
	// ...test logic...
} );
```

## Location of Fixtures

All custom fixtures are located in `test/e2e/lib/pw-base.ts`. This file exports the customized version of Playwright Test's `test` constant which can be used in a spec by importing this constant.

## Naming of Fixtures

Custom fixtures should be prefixed by the fixture type, for example `pageEditor`, or `accounti18n`.
Using a consistent prefix convention helps new contributors quickly identify the purpose and scope of each fixture, improves code readability, and makes it easier to locate and maintain fixtures as the test suite grows. This approach also reduces confusion and potential naming conflicts by clearly distinguishing between different fixture types.

| Prefix      | Types                                     | Example            |
| ----------- | ----------------------------------------- | ------------------ |
| account     | `TestAccount`                             | `accounti18n`      |
| client      | `EmailClient` or `RestAPIClient`          | `clientEmail`      |
| component   | `packages/calypso-e2e/src/lib/components` | `componentSidebar` |
| environment | `EnvVariables`                            | `environment`      |
| helper      | `DataHelper` or `MediaHelper`             | `helperData`       |
| page        | `packages/calypso-e2e/src/lib/pages`      | `pageAdvertising`  |
| secrets     | `Secrets`                                 | `secrets`          |
| site        | `NewSiteResponse`                         | `sitePublic`       |

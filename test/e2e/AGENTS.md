# E2E Test Framework Instructions

## Documentation

Full documentation is available in:

- docs/ - Playwright Test framework documentation; docs/overview.md indexes every page

Key docs to reference:

- docs/overview.md
- docs/setup.md
- docs/tests_local.md
- docs/writing_tests.md
- docs/creating_reliable_tests.md
- docs/style_guide.md
- docs/custom_fixtures.md

## Framework

Every spec runs on Playwright Test.

- Test files: `test/e2e/specs/**/*.spec.ts`
- Examples: `specs/tools/import__sites-squarespace.spec.ts`, `specs/tools/marketing__seo.spec.ts`
- Documentation: docs/

## Running Tests

**IMPORTANT**: Always use `--reporter=list` to prevent the HTML report from opening automatically on failure. Without this flag, the test process will hang waiting for the HTML report browser window to close.

```bash
# Good - process exits immediately after test completion
yarn playwright test specs/path/to/test.spec.ts --reporter=list

# Bad - hangs on failure waiting for HTML report to close
yarn playwright test specs/path/to/test.spec.ts
```

## Quick Reference

### Spec skeleton

```typescript
import { tags, test, expect } from '../../lib/pw-base';

test.describe( 'Test Suite', { tag: [ tags.TAG_NAME ] }, () => {
  test( 'As a user, I can do something', async ( { page } ) => {
    await test.step( 'Given precondition', async function () {
      // test code
    } );
  } );
} );
```

### Authentication

```typescript
test( 'Test', async ( { accountDefaultUser, page } ) => {
  await test.step( 'Given I am authenticated', async function () {
    await accountDefaultUser.authenticate( page );
  } );
} );
```

### Page Objects & Components

```typescript
test( 'Test', async ( { pageLogin, componentSidebar } ) => {
  await pageLogin.visit();
  await componentSidebar.navigate( 'Menu', 'Item' );
} );
```

### Available Fixtures

**Accounts**: one fixture per key of `fixtureAccounts` in [`lib/pw-base.ts`](lib/pw-base.ts), plus `accountGivenByEnvironment` and `accountSMS`. Declaring an account fixture logs in as it, whether or not the test body uses it, so take only the ones the test needs.

**Pages/Components**: Follow naming conventions:

- `page*` - Pages (e.g., `pageLogin`, `pageEditor`, `pagePeople`)
- `component*` - Components (e.g., `componentSidebar`, `componentGutenberg`)
- `flow*` - Flows (e.g., `flowLOHPThemeSignup`)

**Clients**: `clientEmail`, `clientRestAPI`

**Other**: `secrets`, `environment`, `pageIncognito`, `sitePublic`

### Given/When/Then Pattern

Use `test.step()` with descriptive names:

- **Given**: Preconditions
- **When**: Actions
- **Then**: Assertions
- **And**: Continuation

```typescript
await test.step( 'Given I am on the login page', async function () {} );
await test.step( 'When I enter credentials', async function () {} );
await test.step( 'Then I am logged in', async function () {} );
```

### Skip Conditions

```typescript
test( 'Test', async ( { environment } ) => {
  test.skip( environment.TEST_ON_ATOMIC, 'Reason' );
} );
```

### Multiple Contexts

```typescript
test( 'Test', async ( { page, pageIncognito } ) => {
  // page = authenticated context
  // pageIncognito = unauthenticated context
} );
```

# E2E Test Framework Instructions

## Documentation

Full documentation is available in:

- docs/ - Legacy framework documentation
- docs-new/ - New Playwright Test framework documentation

Key docs to reference:

- docs-new/overview.md
- docs-new/setup.md
- docs-new/running_debugging_tests.md
- docs-new/creating_reliable_tests.md
- docs-new/new_style_guide.md
- docs-new/custom_fixtures.md

## Framework Migration Status

We are migrating from the legacy framework to Playwright Test:

### Legacy Framework (Playwright + Jest runner)

- Test files: `test/e2e/specs/**/*.ts` (without `.spec.` in filename)
- Examples: `specs/blocks/blocks__core.ts`, `specs/published-content/likes__post.ts`
- Documentation: docs/
- Status: Being phased out, do not write new tests in this format

### New Framework (Playwright Test)

- Test files: `test/e2e/specs/**/*.spec.ts` (with `.spec.` in filename)
- Examples: `specs/tools/import__sites-squarespace.spec.ts`, `specs/tools/marketing__seo.spec.ts`
- Documentation: docs-new/
- Status: Target framework for all new and migrated tests

## Guidelines

- Always write new tests using Playwright Test (`.spec.ts` files)
- When modifying existing tests, consider migrating them to the new framework
- Follow the patterns and style guide in docs-new/
- Reference legacy docs only for understanding existing code

## Running Tests

When running Playwright Test specs (`.spec.ts` files):

**IMPORTANT**: Always use `--reporter=list` to prevent the HTML report from opening automatically on failure. Without this flag, the test process will hang waiting for the HTML report browser window to close.

```bash
# Good - process exits immediately after test completion
yarn playwright test specs/path/to/test.spec.ts --reporter=list

# Bad - hangs on failure waiting for HTML report to close
yarn playwright test specs/path/to/test.spec.ts
```

For legacy tests (`*.ts` without `.spec.`), use the Jest runner:

```bash
yarn test specs/path/to/test.ts
```

## Migration Quick Reference

### File Structure Changes

**Legacy**: `specs/feature/test-name.ts`
**New**: `specs/feature/test-name.spec.ts`

### Import Changes

```typescript
// Legacy
import { DataHelper, LoginPage, TestAccount } from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';
declare const browser: Browser;

// New
import { tags, test, expect } from '../../lib/pw-base';
```

### Test Structure Changes

```typescript
// Legacy
describe( DataHelper.createSuiteTitle( 'Test Suite' ), function () {
  let page: Page;

  beforeAll( async () => {
    page = await browser.newPage();
  } );

  it( 'Step 1', async function () {
    // test code
  } );

  afterAll( async () => {
    await page.close();
  } );
} );

// New
test.describe( 'Test Suite', { tag: [ tags.TAG_NAME ] }, () => {
  test( 'As a user, I can do something', async ( { page } ) => {
    await test.step( 'Given precondition', async function () {
      // test code
    } );
  } );
} );
```

### Authentication Changes

```typescript
// Legacy
const testAccount = new TestAccount( 'accountName' );
await testAccount.authenticate( page );

// New - use fixtures
test( 'Test', async ( { accountDefaultUser, page } ) => {
  await test.step( 'Given I am authenticated', async function () {
    await accountDefaultUser.authenticate( page );
  } );
} );
```

### Page Objects & Components

```typescript
// Legacy
const loginPage = new LoginPage( page );
const sidebar = new SidebarComponent( page );

// New - use fixtures
test( 'Test', async ( { pageLogin, componentSidebar } ) => {
  await pageLogin.visit();
  await componentSidebar.navigate( 'Menu', 'Item' );
} );
```

### Available Fixtures

**Accounts**: one fixture per key of `fixtureAccounts` in [`lib/pw-base.ts`](lib/pw-base.ts), plus `accountGivenByEnvironment` and `accountSMS`. Declaring an account fixture logs in as it, whether or not the test body uses it, so take only the ones the test needs. To have a build log in as an account before the suite instead of during it, add it to that build type's `AUTHENTICATE_ACCOUNTS` parameter; see [`setup/prime-logins.setup.ts`](setup/prime-logins.setup.ts).

To see what every build type logs in as before its suite, without starting a build:

```bash
# From the repository root. Regenerate only after a .teamcity change; the DSL needs JDK 17.
( cd .teamcity && JAVA_HOME=$(/usr/libexec/java_home -v 17) mvn -q teamcity-configs:generate )
yarn workspace @automattic/calypso-e2e build
( cd test/e2e && node bin/primed-accounts.js )
```

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
// Legacy
skipDescribeIf( condition )( 'Suite', function () {} );

// New
test( 'Test', async ( { environment } ) => {
  test.skip( environment.TEST_ON_ATOMIC, 'Reason' );
} );
```

### Multiple Contexts

```typescript
// Legacy
const newContext = await browser.newContext();
const newPage = await newContext.newPage();

// New
test( 'Test', async ( { page, pageIncognito } ) => {
  // page = authenticated context
  // pageIncognito = unauthenticated context
} );
```

---
paths:
  - "test/e2e/**"
---
# E2E Test Framework Instructions

## Documentation

Full documentation is available in:
- @test/e2e/docs/ - Legacy framework documentation
- @test/e2e/docs-new/ - New Playwright Test framework documentation

Key docs to reference:
- [Overview](test/e2e/docs-new/overview.md)
- [Setup](test/e2e/docs-new/setup.md)
- [Running and Debugging Tests](test/e2e/docs-new/running_debugging_tests.md)
- [Creating Reliable Tests](test/e2e/docs-new/creating_reliable_tests.md)
- [New Style Guide](test/e2e/docs-new/new_style_guide.md)
- [Custom Fixtures](test/e2e/docs-new/custom_fixtures.md)

## Framework Migration Status

We are migrating from the legacy framework to Playwright Test:

**Legacy Framework (Playwright + Jest runner)**
- Test files: `test/e2e/specs/**/*.ts` (without `.spec.` in filename)
- Examples: @test/e2e/specs/blocks/blocks__core.ts, @test/e2e/specs/published-content/likes__post.ts
- Documentation: @test/e2e/docs/
- Status: Being phased out, do not write new tests in this format

**New Framework (Playwright Test)**
- Test files: `test/e2e/specs/**/*.spec.ts` (with `.spec.` in filename)
- Examples: @test/e2e/specs/tools/import__sites-squarespace.spec.ts, @test/e2e/specs/tools/marketing__seo.spec.ts
- Documentation: @test/e2e/docs-new/
- Status: Target framework for all new and migrated tests

## Guidelines

- Always write new tests using Playwright Test (`.spec.ts` files)
- When modifying existing tests, consider migrating them to the new framework
- Follow the patterns and style guide in @test/e2e/docs-new/
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

**Accounts**: `accountDefaultUser`, `accountGivenByEnvironment`, `accountAtomic`, `accountGutenbergSimple`, `accounti18n`, `accountPreRelease`, `accountSimpleSiteFreePlan`, `accountSMS`

**Pages/Components**: Follow naming conventions:
- `page*` - Pages (e.g., `pageLogin`, `pageEditor`, `pagePeople`)
- `component*` - Components (e.g., `componentSidebar`, `componentGutenberg`)
- `flow*` - Flows (e.g., `flowStartWriting`)

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

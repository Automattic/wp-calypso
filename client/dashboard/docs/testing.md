# Testing Strategy

The testing strategy for the dashboard aims to ensure reliability, maintainability, and performance. Since it's a UI heavy project, E2E testing is a key to ensure trust while iterating on the dashboard.

## E2E Testing

### Currently

We're using Calypso's existing infrastructure, which separates the actual tests (`specs`) from so-called "page objects" (and optionally "components"). The latter represent pages (e.g. `DashboardPage`) with specific methods for interaction and inspection:

- test/e2e/specs/dashboard/
- packages/calypso-e2e/src/lib/pages/dashboard-page.ts

The setup itself lacks centralised documentation, IMO, particularly around decrypting the secrets necessary to letting Playwright run Calypso. What we get in return is a system that has already solved many problems (user authentication, etc.).

### Next

Consider a lighter, less abstracted way of writing tests, without page objects. I don't think the new dashboard justifies the added complexity.

## Unit Testing

The unit tests run on [Vitest](https://vitest.dev/):

```bash
yarn test-dashboard                      # Run every Dashboard test
yarn test-dashboard client/dashboard/me  # Run the tests whose paths match
yarn test-dashboard:watch                # Re-run the tests affected by each change
```

Vitest's globals (`describe`, `test`, `expect`) are available without an import; import `vi` from `vitest`.

The rules in this doc apply to every Dashboard test, and they win over the style of the file you're editing. The client-wide [testing conventions in `client/AGENTS.md`](../../AGENTS.md#testing) apply too.

### What Lint Enforces

`client/dashboard/eslint.config.mjs` reports these in test files, so you can rely on `yarn eslint <file>` for them instead of checking by hand:

- `test()` instead of `it()`, inside `describe()` too (`vitest/consistent-test-it`).
- Tests only in `*.test.ts` and `*.test.tsx` files directly in a `test/` folder (`dashboard-tests/no-skipped-test-file`). See [File Naming and Structure](#file-naming-and-structure).
- `.tsx` only for a file that contains JSX (`dashboard-react/jsx-filename-extension`).
- `vi` instead of the `jest` global (`no-restricted-globals`).
- No mock of the packages a test must run for real, or of the router (`dashboard-tests/no-banned-module-mocks` and `dashboard-tests/no-router-mocks`). See [Mocking Modules](#mocking-modules) for the list and its exceptions.
- Vitest's recommended rules, such as `vitest/expect-expect`.

The `dashboard-tests/*` rules are defined in `client/dashboard/eslint-rules/index.mjs`. Lint doesn't check the rest of this doc, so follow it as you write.

### What a Test Checks

A test verifies behavior a user can see or use, not how the code is built: what a screen or a component renders and lets the user do, or what a hook or a utility gives its callers (see [Hook and Utility Tests](#hook-and-utility-tests)).

Follow these tests as examples:

- [`sites/test/index.test.tsx`](../sites/test/index.test.tsx): assertions on a DataViews list.
- [`sites/overview/test/index.test.tsx`](../sites/overview/test/index.test.tsx): assertions on the cards and sections of a screen.
- [`sites/settings-php/test/index.test.tsx`](../sites/settings-php/test/index.test.tsx): submitting a form.
- [`app/hooks/test/use-visit-counter.test.tsx`](../app/hooks/test/use-visit-counter.test.tsx): a hook.
- [`domains/dataviews/test/field-domain-name.test.tsx`](../domains/dataviews/test/field-domain-name.test.tsx): a component that needs the real route tree.

### File Naming and Structure

Put a test in the `test/` folder next to the file it tests, with the same name and the extension `.test.tsx`, or `.test.ts` if the test has no JSX. Vitest only runs `*.test.ts` and `*.test.tsx` files directly in a `test/` folder and skips tests in any other file under `test/`, so lint reports them. Files in `test/` without the suffix are for fixtures and helpers.

Name the top-level `describe()` block after what the file tests: the component's name in angle brackets for a component (`describe( '<PHPVersionSettings>', … )`), and the plain name for a hook or a utility (`describe( 'usePersistentVisitCounter', … )`).

### Integration Tests

Use `@testing-library/react` to test whole slices of the front-end dashboard and to allow more user-focused assertions.

Render with the `render()` function from `client/dashboard/test-utils.tsx`, not the one from `@testing-library/react`. It wraps your component in the providers its hooks need (the query client, the app config, analytics, auth and a router), so hooks work as expected. You can also avoid some manual mocking by using `nock` to mock and assert against network requests.

If the component uses `useSuspenseQuery()`, it shows nothing until its data loads. Wait for an element that shows once it has, such as the heading, with a `findBy` query before asserting anything else.

`render()` only registers a root route, so `useParams()` and `useSearch()` return nothing and links built from the app's route objects (e.g. `pluginRoute.fullPath`) don't resolve. Pick the setup by what the code needs:

- It only reads a param or search value: pass the value in as a prop and test the component with `render()`.
- It reads or writes route search, or builds links from route objects: build the real route tree and a test router, as `domains/dataviews/test/field-domain-name.test.tsx` does, instead of mocking the router (see [Mocking Modules](#mocking-modules)).

Under `render()`, a component's first render sees the router as `idle`, so `useConsumeSearchParams` consumes on mount. A route's component mounts while its navigation is still `pending`, unless it suspends first. To get that in a test, seed the query cache so the component doesn't suspend, render a wrapper that shows it once `state.location.pathname` changes, then navigate with `await act( async () => router.history.push( … ) )`. A `usePersistentView` list suspends on the user's preferences, so seed `rawUserPreferencesQuery()` too: with only the request mocked, the list mounts after the navigation settles.

### Queries and Assertions

Assert on what the user sees on the screen, with simple, readable assertions rather than logic of your own.

- Query anything that has a role by that role: a button, a link, a form field, a heading, a table and its rows and cells, a dialog. Use `screen.findByRole()`, `screen.getByRole()` or `screen.queryByRole()`, and `within()` to look inside one element.
- Query text that has no role of its own, such as a notice, a description or a value in a card, with `ByText`.
- Never query by test ID, CSS class or DOM structure. If a control can't be reached by its role, fix the component's accessibility instead.
- To assert that something isn't there, query it with `queryBy`, which returns `null` where `getBy` throws.

[`client/AGENTS.md`](../../AGENTS.md#testing) says which matchers to assert with and how to simulate user input.

### Hook and Utility Tests

Test a hook or a utility through what its callers get:

- Render a hook with `renderHook()` and assert on the values it returns and the requests or navigation it causes, not on how it gets there.
- Call a utility directly and assert on what it returns.

Some utility functions do little more than destructure or perform a single boolean operation. Before adding a test file for a utility:

1. **Check complexity.** Does it have regex, date parsing, validation logic, or multiple edge cases?
2. **If no:** Write an integration test for a component that uses the utility. Do not create an isolated test file.
3. **If yes:** Write isolated unit tests covering edge cases.

**Example:** A simple utility like `isP2()` should get coverage from an integration test like `"button is disabled for P2s"`, not its own test file.

### Test Data

- Keep test objects minimal: include only the properties the test needs.
- Cast a partial object with `as Type` instead of filling in fields the test doesn't use.

### Mocking Network Requests

Use `nock` to intercept HTTP requests made by queries and mutations. All dashboard API calls go through `https://public-api.wordpress.com`.

```tsx
import nock from 'nock';
```

Note: `nock.cleanAll()` is already called globally after each test, so you don't need `afterEach( () => nock.cleanAll() )` in your test files.

**URL path rules:**

- `apiNamespace: 'wpcom/v2'` → path starts with `/wpcom/v2/…`
- REST API (no namespace) → path starts with `/rest/v1.1/…`

**Intercepting a query (GET):**

```tsx
nock( 'https://public-api.wordpress.com' )
	.get( `/wpcom/v2/sites/${ siteId }/hosting/error-logs` )
	.query( true ) // match any query string
	.reply( 200, { data: { logs: [], total_results: 0, scroll_id: null } } );
```

**Intercepting a mutation (POST):**

```tsx
const scope = nock( 'https://public-api.wordpress.com' )
	.post( '/rest/v1.1/me/preferences', ( body ) => {
		// optionally inspect the request body
		return true;
	} )
	.reply( 200, { calypso_preferences: {} } );

// …trigger the mutation…

// Optionally assert all endpoints in the scope have been called.
expect( scope.isDone() ).toBe( true );
```

**DELETE requests:** `wpcom.req.post( { method: 'DELETE', … } )` sends an actual HTTP
DELETE, so use `.delete()` not `.post()`:

```tsx
nock( 'https://public-api.wordpress.com' )
	.delete( `/wpcom/v2/sites/${ productionSiteId }/staging-site/${ stagingSiteId }` )
	.reply( 200, {} );
```

**Tips:**

- Avoid `nock.delay()` — it leaves open handles that keep the test run from exiting.
- Use `scope.isDone()` to assert the request was actually made.
- Use `.query( true )` when you don't care about specific query string values.
- To test a refetch, wait until the screen shows data from the first response, then replace the mock and call `invalidateQueries()`. While a query has no data, TanStack Query keeps the fetch that is in flight instead of sending a second request.

#### Asserting the request body

Assert the request body inside nock's body callback using `expect` matchers, then use
`scope.isDone()` to verify the request was actually made.

```tsx
const scope = nock( 'https://public-api.wordpress.com' )
	.post( '/rest/v1.1/me/preferences', ( body ) => {
		expect( body ).toEqual(
			expect.objectContaining( {
				my_key: 'strict string check',
				some_string: expect.any( String ),
				pi: expect.closeTo( 3.14 ),
			} )
		);
		return true;
	} )
	.reply( 200, { calypso_preferences: {} } );

// …trigger the mutation…

await waitFor( () => {
	expect( scope.isDone() ).toBe( true );
} );
```

### Mocking Query Cache Data

If the data which needs to be mocked can not be done at the network level (e.g. staging site delete progress), create a fresh `QueryClient`, seed it, and pass it to `render()` in your test function. Don't mock the query packages instead (see [Mocking Modules](#mocking-modules)).

Wherever possible, prefer to mock network requests (see above).

```tsx
import { QueryClient } from '@tanstack/react-query';
import { render } from '../../test-utils';

const queryClient = new QueryClient();
queryClient.setQueryData( [ 'staging-site', 1, 'is-deleting' ], true );

render( <MyComponent />, { queryClient } );
```

### Mocking Modules

Mock a module only for what a test can't run or control any other way:

- A service that reaches outside the app, e.g. analytics, error and log reporting, surveys.
- A switch the code reads from the environment, e.g. a feature flag from `@automattic/calypso-config`.
- `@wordpress/data`, to stub the snackbars and notices a component creates. Moving these tests to the real notices store is separate work.

Don't mock the dashboard's own components or hooks to make a test pass: render the real ones. Data from the API is mocked at the network level (see above).

Lint reports a `vi.mock()`, `vi.doMock()` or `vi.importMock()` of these modules, or of a path inside them, in any file under `test/` and in `test-utils.tsx`:

- `@tanstack/react-query`, `@automattic/api-queries` and `@automattic/api-core`. Mock the network request with `nock`, or seed a `QueryClient` (see above).
- `@wordpress/i18n`. In tests, `__()` and the other functions already return the strings they're given.
- `@tanstack/react-router` and the dashboard's `app/router/*` modules. Their mocks break whenever the code reads a route the mock doesn't define. Build the real route tree (see [Integration Tests](#integration-tests)).

The test files that mocked the router before lint reported it are listed in the `calypso/dashboard/vitest/router-mock-exceptions` block of `eslint.config.mjs`. Never add a file to that list. To take one off, build its real route tree.

#### Use ES imports, not `require()`

Do not use inline `require()` to load a mocked module "after" `vi.mock()` is set up. Vitest hoists `vi.mock()` calls above all imports, so a top-level ES import already receives the mocked version. Inline `require()` is also an ESLint error (`@typescript-eslint/no-require-imports`).

```tsx
// ❌ Bad: lazy require to "get the mock"
test( 'shows the banner when the flag is on', () => {
	// eslint-disable-next-line @typescript-eslint/no-require-imports
	const { isEnabled } = require( '@automattic/calypso-config' );
	isEnabled.mockReturnValue( true );
} );
```

```tsx
// ✅ Good: top-level import + `vi.mocked()`
import { isEnabled } from '@automattic/calypso-config';
import { vi } from 'vitest';

vi.mock( '@automattic/calypso-config', () => ( { isEnabled: vi.fn() } ) );

test( 'shows the banner when the flag is on', () => {
	vi.mocked( isEnabled ).mockReturnValue( true );
} );
```

Deferred loading is only genuinely needed with `vi.resetModules()` or `vi.doMock()` — and even then use `await import()`, not `require()`.

One exception: a `vi.mock()` factory runs before imports are initialized, so it cannot reference top-level imports. Inside a factory, use `await vi.importActual()`:

```tsx
vi.mock( 'some-module', async () => {
	const { createElement } = await vi.importActual< typeof import( 'react' ) >( 'react' );
	// …
} );
```

A factory returns the module's ES exports, so a default export goes under `default`:

```tsx
vi.mock( '../use-some-hook', () => ( { default: vi.fn() } ) );
```

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

### Integration Tests

Use `@testing-library/react` to test whole slices of the front-end dashboard and to allow more user-focused assertions.

Use the `render()` function from `client/dashboard/test-utils.tsx`, which will render your component with context providers so that hooks work as expected. You can also avoid some manual mocking by using `nock` to mock and assert against network requests.

### Mocking Network Requests

Use `nock` to intercept HTTP requests made by queries and mutations. All dashboard API calls go through `https://public-api.wordpress.com:443`.

```tsx
import nock from 'nock';

afterEach( () => nock.cleanAll() );
```

**URL path rules:**

- `apiNamespace: 'wpcom/v2'` → path starts with `/wpcom/v2/…`
- REST API (no namespace) → path starts with `/rest/v1.1/…`

**Intercepting a query (GET):**

```tsx
nock( 'https://public-api.wordpress.com:443' )
  .get( `/wpcom/v2/sites/${ siteId }/hosting/error-logs` )
  .query( true ) // match any query string
  .reply( 200, { data: { logs: [], total_results: 0, scroll_id: null } } );
```

**Intercepting a mutation (POST):**

```tsx
const scope = nock( 'https://public-api.wordpress.com:443' )
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
nock( 'https://public-api.wordpress.com:443' )
  .delete( `/wpcom/v2/sites/${ productionSiteId }/staging-site/${ stagingSiteId }` )
  .reply( 200, {} );
```

**Tips:**

- Always call `nock.cleanAll()` in `afterEach` to avoid leaking interceptors between tests.
- Avoid `nock.delay()` — it leaves open handles causing "Jest did not exit" warnings.
- Use `scope.isDone()` to assert the request was actually made.
- Use `.query( true )` when you don't care about specific query string values.
- Capture the request body and assert with Jest (as below) rather than asserting inside
  nock's body callback — Jest matchers produce clearer diffs on failure.

#### Asserting the request body

Capture the body in a variable via nock's callback, then assert with Jest matchers.
This gives more readable test failures than validating inside nock's callback directly.

```tsx
let requestBody: SomeType | undefined;
nock( 'https://public-api.wordpress.com:443' )
  .post( '/rest/v1.1/me/preferences', ( body ) => {
    requestBody = body;
    return true; // always match — assert separately below
  } )
  .reply( 200, { calypso_preferences: {} } );

// …trigger the mutation…

expect( requestBody ).toEqual(
  expect.objectContaining( {
    my_key: 'strict string check',
	some_string: expect.any( String ),
	pi: expect.closeTo( 3.14 ),
  } )
);
```

### Mocking Query Cache Data

Do not mock `@tanstack/react-query` or `@automattic/api-queries`. If the data which needs to be mocked can not be done at the network level (e.g. staging site delete progress), create a fresh `QueryClient` and pass it to `render()` in your test function.

Wherever possible, prefer to mock network requests (see above).

```tsx
import { QueryClient } from '@tanstack/react-query';
import { render } from '../../test-utils';

const queryClient = new QueryClient();
queryClient.setQueryData( [ 'staging-site', 1, 'is-deleting' ], true );

render( <MyComponent />, { queryClient } );
```

### Utility Function Tests

Some utility functions do little more than destructure or perform a single boolean operation.

When adding test coverage for utility functions:

1. **Check complexity.** Does it have regex, date parsing, validation logic, or multiple edge cases?
2. **If no:** Write an integration test for a component that uses the utility. Do not create an isolated test file.
3. **If yes:** Write isolated unit tests covering edge cases.

**Example:** A simple utility like `isP2()` should get coverage from an integration test like `"button is disabled for P2s"`, not its own test file.

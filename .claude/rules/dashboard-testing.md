---
paths:
  - 'client/dashboard/**/test/**'
---

# Writing tests for the dashboard

Tests MUST verify user-visible behavior, not implementation details. Test what a user can see or do, not how the component is built internally.

CRITICAL: consult these reference examples:

- @client/dashboard/sites/test/index.test.tsx - DataViews assertions
- @client/dashboard/sites/overview/test/index.test.tsx - more complex assertions for cards / sections in the screen
- @client/dashboard/sites/settings-php/test/index.test.tsx - form submission
- @client/dashboard/app/hooks/test/use-visit-counter.test.tsx - a hook

These rules win over the style of the file you're editing.

## Setup

- Put the test file under the `test/` subdirectory, with the same name as the file it tests but with the `.test.tsx` extension (`.test.ts` without JSX).
- Use the component name (surrounded by `<>`) as the top-level `describe()` block. For a hook or a utility, use its name as is.
- Use `test()` instead of `it()` for test cases.
- Use the custom `render()` function from @client/dashboard/test-utils.tsx — it wraps components with all required providers (QueryClient, Router, Auth, Analytics).
- If the component uses `useSuspenseQuery()`, wait for a stable element (e.g., heading) before asserting.

## Assertions

For a screen or a component:

- Assert on what the user sees on the screen.
- Query anything that has a role (a button, a link, a form field, a heading, a table and its rows and cells, a dialog) by that role, using e.g. `screen.findByRole()`, `screen.getByRole()`, `screen.queryByRole()`, and `within()`.
- Query text that has no role of its own (a notice, a description, a value in a card) with `ByText`.
- Never query by test ID, CSS class, or DOM structure.
- If a control isn't reachable by role, fix the component's accessibility instead.
- Assert that something shows with `toBeVisible()`. Assert that it doesn't with a `queryBy` query and `.not.toBeInTheDocument()`.
- Prefer simple, readable assertions over complex logic.

A hook or a utility has no screen, so its behavior is what its callers get:

- Render a hook with `renderHook()` and assert on the values it returns and the requests or navigation it causes, not on how it gets there.
- Call a utility directly and assert on what it returns.

## Mocking

- Mock data at the network boundary: use `nock` to intercept REST API calls to `https://public-api.wordpress.com`.
- DO NOT mock `@tanstack/react-query` or `@automattic/api-queries`.
- DO NOT mock the dashboard's own components, hooks, or router to make a test pass. Render the real ones.
- Mock a module only for what a test can't run or control any other way:
  - a service that reaches outside the app, e.g. analytics, error and log reporting, surveys.
  - a switch the code reads from the environment, e.g. a feature flag from `@automattic/calypso-config`.

## Test data

- Keep test objects minimal — include only properties relevant to the test.
- Use `as Type` to cast partial objects instead of filling unused fields.

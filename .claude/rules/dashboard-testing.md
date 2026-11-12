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

These rules win over the style of the file you're editing: add `test()` cases to a file of `it()` cases, and leave the existing ones alone unless the rename is the task.

## Setup

- Put the test file under the `test/` subdirectory, with the same name as the file it tests but with the `.test.tsx` extension (`.test.ts` without JSX).
- Use the component name (surrounded by `<>`) as the top-level `describe()` block. For a hook or a utility, use its name as is.
- Use `test()` instead of `it()` for test cases.
- Use the custom `render()` function from @client/dashboard/test-utils.tsx — it wraps components with all required providers (QueryClient, Router, Auth, Analytics).
- If the component uses `useSuspenseQuery()`, wait for a stable element (e.g., heading) before asserting.

## Assertions

For a screen or a component:

- Assert on what the user sees on the screen.
- Query by accessible role using e.g. `screen.findByRole()`, `screen.getByRole()`, `screen.queryByRole()`, and `within()`.
- Never query by test ID, CSS class, or DOM structure.
- If an element isn't reachable by role, fix the component's accessibility instead.
- Prefer simple, readable assertions over complex logic.

A hook or a utility has no screen, so its behavior is what its callers get:

- Render a hook with `renderHook()` and assert on the values it returns and the requests or navigation it causes, not on how it gets there.
- Call a utility directly and assert on what it returns.

## Mocking

- DO NOT mock React components, hooks, or modules.
- DO NOT mock TanStack queries.
- Only mock network requests at the boundary using `nock` to intercept REST API calls to `https://public-api.wordpress.com`.

## Test data

- Keep test objects minimal — include only properties relevant to the test.
- Use `as Type` to cast partial objects instead of filling unused fields.

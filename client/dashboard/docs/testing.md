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

### Utility Function Tests

Some utility functions do little more than destructure or perform a single boolean operation.

When adding test coverage for utility functions:

1. **Check complexity.** Does it have regex, date parsing, validation logic, or multiple edge cases?
2. **If no:** Write an integration test for a component that uses the utility. Do not create an isolated test file.
3. **If yes:** Write isolated unit tests covering edge cases.

**Example:** A simple utility like `isP2()` should get coverage from an integration test like `"button is disabled for P2s"`, not its own test file.


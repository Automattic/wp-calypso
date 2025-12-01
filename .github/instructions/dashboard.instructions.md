---
applyTo: "client/dashboard/**"
---

# Dashboard Code Review Instructions

## Documentation to consult

For any pull request that touches `client/dashboard`:

**You MUST consult the documentation in `client/dashboard/docs` before providing code review feedback.** These docs are the authoritative source for dashboard best practices and patterns.

Before making any style, component, or architectural suggestions, you MUST read and reference the relevant documentation:

- [`client/dashboard/docs/ui-components.md`](../../client/dashboard/docs/ui-components.md) - Component usage and styling guidelines
- [`client/dashboard/docs/data-library.md`](../../client/dashboard/docs/data-library.md) - Data fetching patterns and state management
- [`client/dashboard/docs/router.md`](../../client/dashboard/docs/router.md) - Routing architecture and patterns
- [`client/dashboard/docs/entry-points.md`](../../client/dashboard/docs/entry-points.md) - Entry point architecture
- [`client/dashboard/docs/typography-and-copy.md`](../../client/dashboard/docs/typography-and-copy.md) - Typography and content guidelines
- [`client/dashboard/docs/i18n.md`](../../client/dashboard/docs/i18n.md) - Internationalization practices
- [`client/dashboard/docs/testing.md`](../../client/dashboard/docs/testing.md) - Testing guidelines

**When providing feedback:**
- Base your suggestions on the patterns and examples described in these docs
- If a change appears to violate documented best practices, explicitly call that out
- **Quote or link the relevant section** from the docs to support your feedback
- Do not suggest approaches that contradict the documented patterns without first referencing why an exception might be needed

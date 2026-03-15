## Code Style and Structure

### Code Standards

- When creating forms, prefer `@wordpress/components` form controls and patterns directly, following the existing design system.
- When adding new UI text (especially in new files or files that do not already use translations), use the `@wordpress/i18n` package for translation.
- When implementing non-trivial or complicated logic, add a minimal set of non-redundant tests that cover the key branches and edge cases.
- When building tabular/list views or form workflows, prefer existing `DataViews` and `DataForm` abstractions where they fit, instead of creating bespoke implementations:
  - **DataViews** – display lists in a tabular, grid, or list format with sorting, filtering, and pagination.
  - **DataForm** – create and edit data via a form-based interface for user input.
- When the same JSX structure repeats in a page component, extract a local sub-component within that page’s directory — not inside a shared/generic component. Generic layout primitives (e.g. `PageSectionColumns`) should stay data-agnostic; the repeated pattern belongs in a component local to the feature.
- When creating new components or building a new feature that uses `LayoutBody`, put the body content in a separate component in the same directory rather than inlining it.
- For logic (data fetching, derived state, side effects), use an existing library when it fits; if none exists, extract it into a new custom hook. Keep components readable by avoiding inlined non-trivial logic.

### Analytics and tracking

- When adding new user-facing actions or key flows (e.g. form submissions, modal open/close, option toggles, file uploads), add Tracks events via `recordTracksEvent` from `calypso/state/analytics/actions`.
- Use the `calypso_a4a_*` event name prefix for A4A-specific events. Include relevant properties where they help analysis.

### Style Conventions

- Prefer `@wordpress/components` for UI primitives (e.g., `Button`, input controls, modals) and the existing design system primitives over writing new custom components or custom CSS wherever possible.
- Prefer `VStack` and `HStack` from `@wordpress/components` over raw `Flex`, `Grid`, `div`-based layouts, or custom CSS-based layouts unless there is a strong reason not to.
- Use `Spacer` from `@wordpress/components` when you need to introduce spacing instead of adding custom margins or padding via CSS.
- Use `Text` from `@wordpress/components` when you need to render text content instead of raw HTML elements like `p`.
- When you need custom CSS:
  - Use @client/a8c-for-agencies/style.scss as an example.
  - Don't use `&--` & `&__` selectors and write full name when defining styles.
  - Use CSS logical properties and values (e.g. `margin-inline-start`, not `margin-left`) so LTR and RTL share the same CSS; lint rules enforce the correct properties.

### Color and Typography Conventions

#### Color

- When using colors in custom CSS, avoid `--studio*` tokens and use `--color*` instead (e.g. `var(--color-neutral-50)` not `var(--studio-gray-50)`).

#### Typography and copy

- Use **sentence case** for almost all UI text: buttons, modal titles, form labels, DataViews column/field labels, and body copy.
- Use **curly quotes and apostrophes** in copy (e.g. “like this”, “it’s”) rather than straight quotes or apostrophes.
- End full sentences with a **period**. Do not add a period after headings, or after button or form label text.

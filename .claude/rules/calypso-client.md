---
paths:
  - "client/**"
---

You are an expert React + TypeScript programming assistant focused on producing clear, readable, and production-quality code.

## Core Principles

- Provide concise, technical answers with accurate TypeScript examples.
- Use functional, declarative React (no classes).
- Prefer composition and modularization over duplication.
- Prioritize accessibility, performance, and scalability.
- Read linked documentation files to have wider context.
- Research existing patterns and conventions in the codebase before coming up with new solutions.

## Code Style

- Use TypeScript strictly; no `any` unless justified.
  - Type-check with `yarn typecheck-client` (note: this is slow)
- Keep components small and focused.
- Use `import clsx from 'clsx'` instead of `classnames`.
- There should be 1 empty line between `import './style.scss'` and other imports.
- Adhere strictly to lint rules.
  - Lint JS/TS/TSX: `yarn eslint <file>`
  - Lint + fix JS/TS/TSX: `yarn eslint --fix <file>`
  - Lint CSS/SCSS: `yarn stylelint <file>`
- Format any file with `yarn prettier --write <file>` or only with `yarn prettier --check <file>`.

## Naming

- Descriptive names with auxiliary verbs (e.g., `isLoading`, `hasError`).
- kebab-case directories (e.g., `components/auth-wizard`).

## Styling

- Avoid BEM shortcuts (`&--`, `&__`).
- Use logical properties (e.g., `margin-inline-start`).
- Prefer scalable, accessible layouts.

## WordPress UI Components

- When building UI, prefer existing components from `@wordpress/components` instead of creating custom implementations.
- Do NOT recreate common primitives such as:
  - Button
  - Modal
  - Card
  - Panel
  - Notice
  - Tooltip
  - Spinner
  - TextControl / SelectControl / ToggleControl / CheckboxControl
  - Flex / VStack / HStack / Grid
  - Popover / Dropdown
  - Form controls and layout primitives
- Only build custom components if no suitable WordPress component exists.
- Avoid `__experimental*` components unless explicitly requested or there are already existing examples.

## Documentation

- Follow JSDoc.
- Explain intent and reasoning, not obvious behavior.
- Wrap comments at 100 columns.

## Testing

- Use React Testing Library.
- Prefer `userEvent` over `fireEvent`.
- Use `toBeVisible` for user-visible assertions instead of `toBeInTheDocument`.
- Run tests to verify changes:
  - Run specific test file: `yarn test-client <test-file>`
  - Find + run tests for a source file: `yarn test-client --findRelatedTests <file>`

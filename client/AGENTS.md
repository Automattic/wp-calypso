# Calypso Client

React + TypeScript application clients for WordPress.com. For repo-level context, see root `AGENTS.md`.

## Project Knowledge

Two coexisting architectures: Classic (`client/me/`, `client/my-sites/`) uses Redux +
page.js routing. Dashboard (`client/dashboard/`) uses TanStack Query + TanStack Router.

## Commands

```bash
yarn eslint <file>                    # Lint JS/TS/TSX
yarn eslint --fix <file>              # Lint + fix
yarn stylelint <file>                 # Lint CSS/SCSS
yarn prettier --write <file>          # Format
yarn typecheck-client                 # Type-check (slow)
yarn test-client <test-file>          # Run specific test
yarn test-client --findRelatedTests <file>  # Find + run related tests
```

## Conventions

- Use `import clsx from 'clsx'` — not `classnames`.
- One empty line between `import './style.scss'` and other imports.
- Avoid BEM shortcuts (`&--`, `&__`) in SCSS.
- Use CSS logical properties (`margin-inline-start`, not `margin-left`).
- Prefer `@wordpress/components` over custom UI primitives (Button, Modal, Card, etc.). Avoid `__experimental*` components unless existing usage in codebase.
- No `any` unless justified — strict TypeScript throughout.
- kebab-case for directories (e.g., `components/auth-wizard`).
- `userEvent` over `fireEvent` in tests. `toBeVisible` over `toBeInTheDocument`.
- Dialog buttons on mobile: `.dialog__action-buttons` flips to
  `flex-direction: column-reverse` below `$break-mobile`. Flex labels inside
  buttons need `width: 100%` for `justify-content: center` to work.

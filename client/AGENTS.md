# Calypso Client

React + TypeScript application clients for WordPress.com.

## Architecture

Two coexisting architectures:

- Classic Calypso (`client/me/`, `client/my-sites/`) uses Redux + page.js routing.
- Dashboard (`client/dashboard/`) uses TanStack Query + TanStack Router.

## Commands

```bash
yarn eslint <file>                          # Lint JS/TS/TSX
yarn eslint --fix <file>                    # Lint + fix
yarn stylelint <file>                       # Lint CSS/SCSS
yarn prettier --write <file>                # Format
yarn typecheck-client                       # Type-check (slow)
yarn test-client <file>                     # Run specific test
yarn test-client --findRelatedTests <file>  # Find + run related tests
```

## Conventions

### File structure

- Use kebab-case for directories (e.g., `components/auth-wizard`).

### Imports

- Use `import clsx from 'clsx'`, not `classnames`.
- Add one empty line between `import './style.scss'` and other imports.

### Types

- Use strict TypeScript. No `any` unless justified.
- Prefer simple, concrete types over complex generics.

### UI

- Prefer `@wordpress/components` primitives (Button, Modal, Card, etc.).
- Avoid `__experimental*` components unless already used in the codebase.
- Prefer `VStack`, `HStack` over `Flex` components.
- Minimize custom CSS; rely on the design system first.

### CSS/SCSS

- Use CSS logical properties (`margin-inline-start`, not `margin-left`).
- Do not use BEM shortcuts (`&--`, `&__`) in SCSS.
- Dialog buttons on mobile: `.dialog__action-buttons` flips to `flex-direction: column-reverse` below `$break-mobile`. Flex labels inside buttons need `width: 100%` for `justify-content: center` to work.

### Internationalization

- Use `@wordpress/i18n` for translations.

### Testing

- Prefer `userEvent` over `fireEvent` in tests.
- Prefer `toBeVisible()` over `toBeInTheDocument()`.

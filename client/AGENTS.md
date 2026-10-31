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
- Pass `__next40pxDefaultSize` to every new `Button` (including `size="compact"` ones) and other controls that accept it, so they're ready for when 40px becomes the default upstream. `DropdownMenu` renders its own toggle button, so pass it via `toggleProps={ { __next40pxDefaultSize: true } }`; otherwise the toggle stays 36px and misaligns next to 40px buttons.
- Avoid `__experimental*` components unless already used in the codebase.
- Prefer `VStack`, `HStack` over `Flex` components.
- Use the `Heading` component for headings, not `Text` (or raw elements) styled with heading mixins.
- Minimize custom CSS; rely on the design system first.
- When adding a state or variant to an existing component, structure it like its siblings. For example, if each screen state is its own component, add a new component rather than inline markup in the parent.

### CSS/SCSS

- Use CSS logical properties (`margin-inline-start`, not `margin-left`).
- Do not use BEM shortcuts (`&--`, `&__`) in SCSS.
- Do not use hardcoded color values (`#fff`, `rgb()`, `hsl()`, named colors) in CSS/SCSS.
- Use predefined color variables instead, preferably semantic CSS custom properties like `var(--color-text)`, `var(--color-surface)`, `var(--color-border-subtle)`, or `var(--color-primary)`.
- Dialog buttons on mobile: `.dialog__action-buttons` flips to `flex-direction: column-reverse` below `$break-mobile`. Flex labels inside buttons need `width: 100%` for `justify-content: center` to work.
- Import the stylesheet for every class a component renders. Don't rely on another component having imported it.

### Internationalization

- Use `@wordpress/i18n` for translations.
- Format displayed counts and quantities with `formatNumber()` from `@automattic/number-formatters`; preserve required decimal precision, use `%s` for formatted values, and keep numeric counts for plural selection. Use compact notation only when the layout needs it. See [number formatting guidance](../docs/i18n.md#formatting-displayed-quantities).

### Testing

- Prefer `userEvent` over `fireEvent` in tests.
- Prefer `toBeVisible()` over `toBeInTheDocument()`.

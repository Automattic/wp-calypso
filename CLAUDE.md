# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build commands

- Build and start: `yarn start`
- Lint JS/TS: `yarn lint:js`
- Lint CSS/SCSS: `yarn lint:css`
- Typecheck: `yarn typecheck`
- Run all tests: `yarn test`
- Run client tests: `yarn test-client`
- Run specific test file: `yarn test-client path/to/test-file.js`

## Code style guidelines

- Use tabs for indentation
- Line length: max 100 characters (80 preferred)
- TypeScript: Use types where helpful but don't over-type
- React: Use functional components over class components
- Variables: Use `const` by default, `let` only when needed, never `var`
- Imports: One blank line between style imports and other imports
- Naming: camelCase for variables/functions, PascalCase for components
- Error handling: Use early returns to avoid deep nesting
- Use WordPress components from `@wordpress/components` when possible
- Prefer named exports for components
- Functional programming favored: use map/filter/reduce over for/while loops
- Always include JSDoc comments for public functions
- For CSS: Use margin-inline-start/end (not left/right) for RTL support

## Architecture principles

- @wordpress/components and design system based, avoid CSS as much as possible
- Build as a separate section/url in Calypso /v2 but avoid importing Calypso's components, CSS and state
- Be very explicit about what dependencies we include
- Avoid Redux and calypso/state
- Use @wordpress/i18n package for translation
- Reuse feature flags, authentication, REST API lib
- If hacks are used, document them in the README and propose a long term solution
- Use a modern router (React or TanStack Router)
- Using TanStack Query is ok
- Document all the architecture decisions (design docs)
- Performance testing and e2e testing are key
- Use TypeScript for all new code
- Use @wordpress/i18n package for translation

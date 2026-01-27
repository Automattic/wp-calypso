# Package Import Restrictions

The dashboard restricts imports from `calypso/` and `@automattic/` packages. This is enforced by ESLint rules in `.eslintrc.js`.

## Why imports are restricted

- Many packages pull in Calypso code/concepts we want to avoid
- Non-core UI elements that don't match the design system
- They may depend on Calypso context providers or Redux store dependencies

## Ideal dependencies

The ideal dependencies for this project:

- Have minimal dependencies of their own
- Use `@automattic/api-core` for API types
- Do not depend on Calypso "providers" or Redux state
- Do not provide whole chunks or UI, only utilities or UI primitives

## Adding exceptions

Exceptions are discussed during normal PR review. When adding a new exception, discuss why it's needed and how it has been vetted.

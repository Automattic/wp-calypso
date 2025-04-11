# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build/Test/Lint Commands
- Build: `yarn start` (development), `yarn build` (production)
- Test: `yarn test` (all), `yarn test-client path/to/file.test.js` (single test)
- Lint: `yarn lint` (all), `yarn lint:js` (JS/TS), `yarn lint:css` (styles)
- Typecheck: `yarn typecheck`
- Debug: `DEBUG=calypso:* yarn start` (enables debug output)

## Coding Guidelines
- Use tabs for indentation, single quotes for strings, semicolons required
- Follow WordPress/React coding patterns (prefer functional components with hooks)
- Format CSS with component-based classes: `.component__element.is-modifier`
- Use `useTranslate()` from `i18n-calypso` for internationalization in function components
- Use RTL-friendly CSS (`inset-inline-start` instead of `left`)
- Import order: built-ins, external, internal, parent, sibling, index
- Error handling should show user-friendly messages with corrective options
- Never hardcode strings that should be translated
- Prefer TypeScript types over primitive types to improve self-documentation 
- Use WordPress components from `@wordpress/components` where available
- Avoid using restricted imports (see .eslintrc.js for details)
- Report errors to Sentry for proper monitoring in production

## WordPress Integration
- Use WordPress hooks system correctly
- Prefer components from `@wordpress/components` over custom ones
- Use WordPress data store with `@wordpress/data` for state management
- Follow WordPress accessibility guidelines for all user interfaces
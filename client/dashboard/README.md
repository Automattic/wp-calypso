# Hosting Dashboard

Build a new hosting dashboard for WordPress.com based on the new design. The same dashboard with different entry points is used for different products (WordPress.com, Jetpack Clound and a4a).

# Some principles:

- @wordpress/components and design system based, avoid CSS as much as possible.
- Prefer VStack, HStack over Flex components.
- Build as a separate section/url in Calypso /v2 but avoid importing Calypso's components, CSS and state.
- Be very explicit about what dependencies we include.
- Don't use Redux and calypso/state.
- Use lib/wp for REST API calls.
- Use TanStack based stack (Query and Router). Prefer using loaders over adhoc queries.
- If hacks are used, document them in the README and propose a long term solution.
- Use TypeScript, but prefer simple, concrete types.
- Use @wordpress/i18n package for translation.
- Performance testing and e2e testing are key.
- Document all the architecture decisions (design docs)

# Shortcuts taken

- Importing SASS files seems to bring other unexpected CSS variables to our bundles (masterbar, sidebar), it also brings fonts (Recoleta, Noto) and some global classes. Why? Imports should ideally be explicit.
- The WordPress.com logo should be built as a reusable component/package.

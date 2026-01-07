---
description: Developer onboarding helper - answers questions about testing, building, linting, and working in this monorepo
argument-hint: [your question]
---

# wp-calypso Developer Guide

Answer the developer's question about working in this monorepo.

**Question:** $ARGUMENTS

## Instructions

1. First, check the Quick Reference below - most common questions are answered there.

2. If not in Quick Reference, check these files:
   - @CLAUDE.md - Project guidelines and rules
   - @docs/install.md - Installation and setup
   - @docs/development-workflow.md - Development workflow
   - @docs/CONTRIBUTING.md - Contribution guidelines
   - @test/README.md - Testing overview

3. Only if the question is about a specific package, app, or component not covered above, search for it:
   - Use Glob to find the relevant directory
   - Read its README.md and package.json
   - Check for specific build/test scripts

4. Provide a structured answer with:
   - **Quick answer** (1-2 sentences)
   - **Command(s) to run** (exact yarn commands)
   - **File locations** (if relevant)
   - **Common gotchas** (if any)

## Quick Reference

### Testing
| What | Command |
|------|---------|
| Unit test a file | `yarn test-client path/to/file` |
| Unit test a package | `yarn test-packages -- --testPathPattern=package-name` |
| Watch mode | `yarn test-client:watch` |
| Package tests | `yarn test-packages` |
| E2E tests | `yarn workspace wp-e2e-tests test:pw -- specs/path.spec.ts --reporter=list` |
| All tests | `yarn test` |
| Server tests | `yarn test-server` |
| Integration tests | `yarn test-integration` |

### Building
| What | Command |
|------|---------|
| Dev server | `yarn start` |
| Fast dev (limited sections) | `SECTION_LIMIT=reader,login yarn start` |
| Fast dev (limited entries) | `ENTRY_LIMIT=entry-login,entry-main yarn start` |
| Production build | `yarn build` |
| Single package | `yarn workspace @automattic/[name] build` |
| Single app | `cd apps/[name] && yarn build` |
| Build all packages | `yarn build-packages` |
| Clean build artifacts | `yarn clean` |

### Code Quality
| What | Command |
|------|---------|
| Lint all | `yarn lint` |
| Lint JS only | `yarn lint:js` |
| Lint CSS only | `yarn lint:css` |
| Fix JS issues | `yarn eslint --fix [file]` |
| TypeScript check | `yarn typecheck` |
| Storybook | `yarn storybook:start` (port 6006) |

### Git & PRs
| What | Info |
|------|------|
| Branch prefixes | `add/`, `update/`, `fix/`, `try/` |
| Main branch | `trunk` |
| Before PR | Run `yarn test`, check merge checklist in `docs/merge-checklist.md` |

### Debugging
| What | Command/Info |
|------|--------------|
| Debug server | `yarn start:debug` (uses Node inspector) |
| Debug in browser | `localStorage.setItem('debug', 'calypso:*')` |
| Bundle analysis | `yarn analyze-bundles` |
| Why bundled | `yarn whybundled` |

### Project Structure
- `client/` - Main React application (components, sections, state)
- `packages/` - NPM-publishable libraries (@automattic/*)
- `apps/` - Standalone deployable apps (help-center, notifications, etc.)
- `test/` - Test configurations and E2E specs
- `docs/` - Developer documentation
- `config/` - Feature flags and environment config
- `bin/` - Build and utility scripts

### Key Patterns
- Use `@wordpress/components` for UI (see @.rules/wordpress-imports.mdc)
- Use `@wordpress/element` instead of React directly
- Use `useTranslate` from `i18n-calypso` for translations
- Use `clsx` instead of `classnames` for className composition
- Run `yarn eslint --fix` after editing any JS/TS file (mandatory)
- Tests go in `test/` subfolder next to the code
- Use `useSelect`/`useDispatch` from `@wordpress/data` for state

### Apps in this Monorepo
- `help-center` - Help Center widget
- `notifications` - Notifications system
- `happy-blocks` - Block editor blocks
- `odyssey-stats` - Statistics app
- `blaze-dashboard` - Blaze dashboard
- `wpcom-block-editor` - WP.com block editor

### Common Packages
- `@automattic/components` - Shared UI components
- `@automattic/data-stores` - Shared data stores
- `@automattic/calypso-config` - Config management
- `@automattic/i18n-calypso` - Internationalization
- `@automattic/calypso-build` - Build configuration
- `@automattic/calypso-e2e` - E2E testing framework

## Response Format

Be concise. Provide the exact commands. If you need to search for something specific, do it.

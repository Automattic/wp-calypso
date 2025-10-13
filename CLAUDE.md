# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Calypso is the WordPress.com front-end – a single-page web application built with React, Redux, Node.js/Express, and the WordPress.com REST API. It serves as the WordPress dashboard replacement for WordPress.com.

## Essential Commands

### Development
```bash
# Start development server (requires 127.0.0.1 calypso.localhost in /etc/hosts)
yarn start

# Start with limited sections for faster builds
SECTION_LIMIT=reader,login yarn start

# Start with limited entry points
ENTRY_LIMIT=entry-login,entry-main yarn start

# Start with debug mode
yarn start:debug

# Start specific environments
yarn start-jetpack-cloud
yarn start-a8c-for-agencies
```

### Building
```bash
# Full build
yarn build

# Build client only
yarn build-client

# Build server only
yarn build-server

# Build packages
yarn build-packages

# Build specific workspace
yarn workspace @automattic/package-name run prepare
```

### Testing
```bash
# Run all tests
yarn test

# Run client tests
yarn test-client
yarn test-client:watch

# Run single test file
yarn test-client path/to/test-file

# Run package tests
yarn test-packages
yarn test-packages:watch

# Run server tests
yarn test-server
yarn test-server:watch

# Run integration tests
yarn test-integration
```

### Testing Notes
- Use query functions from `render()` return value, not from `screen` import
- Prefer `userEvent` over `fireEvent` for better user interaction simulation
- Use `toBeVisible` instead of `toBeInTheDocument` to check actual visibility

### Linting & Type Checking
```bash
# Run all linters
yarn lint

# Lint JavaScript/TypeScript
yarn lint:js

# Lint CSS/SCSS
yarn lint:css

# Type checking
yarn typecheck
yarn typecheck-client
yarn typecheck-packages

# Reformat code
yarn reformat-files
```

## Architecture

### Monorepo Structure

- **`/client`** - Main Calypso application
  - `boot/` - Application initialization
  - `components/` - Shared React components
  - `state/` - Redux state management (modularized)
  - `lib/` - Internal utilities and modules
  - `layout/` - Main React layout and masterbar
  - `sections.js` - Defines section groups and paths for webpack chunking
  - `my-sites/` - Site management functionality (wp-admin equivalent)
  - `reader/` - Reader sections
  - `me/` - User profile sections
  - `signup/` - Signup flows
  - `landing/` - Landing pages and stepper flows

- **`/packages`** - NPM packages (publishable to NPM)
  - Each package has a clear single purpose
  - Use `calypso:src`, `main`, `module`, `exports` in package.json
  - Build with `transpile` from `@automattic/calypso-build`

- **`/apps`** - WordPress.com plugins (not published to NPM)

- **`/config`** - Environment-specific JSON configuration files
  - Controlled by `NODE_ENV` environment variable
  - Feature flags defined in `features` object
  - Use `config()` to access values, `config.isEnabled()` for feature flags

- **`/desktop`** - WP Desktop app (separate dependency tree)

- **`/test`** - Test configuration and e2e tests

### State Management

Calypso uses **modularized Redux state**:

1. Reducers are registered on-demand via `registerReducer()`
2. Each state module has an `init.js` file that registers its reducer
3. Selectors and action creators import `init.js` to ensure registration
4. State subtrees live in `client/state/<name>/`
5. Cross-cutting selectors live in `client/state/selectors/`

Example state module structure:
```
client/state/reader/
  ├── init.js          # Registers reducer with store
  ├── reducer.js       # Redux reducer
  ├── actions.js       # Action creators (imports init.js)
  ├── selectors.js     # Selectors (imports init.js)
  └── test/            # Tests
```

State utilities in `state/utils.ts`:
- `keyedReducer()` - Creates reducer for keyed collections
- `withSchemaValidation()` - Validates persisted state on load

### Configuration & Feature Flags

Environment progression:
- **WordPress.com**: development → wpcalypso → horizon → stage → production
- **Jetpack**: jetpack-cloud-development → jetpack-cloud-horizon → jetpack-cloud-stage → jetpack-cloud-production
- **A4A**: a8c-for-agencies-development → a8c-for-agencies-horizon → a8c-for-agencies-stage → a8c-for-agencies-production

Testing feature flags:
```bash
# Via environment variables
ENABLE_FEATURES=some/flag-name yarn start
DISABLE_FEATURES=reader yarn start

# Via URL (development/staging only)
http://calypso.localhost:3000/?flags=some/flag-name
http://calypso.localhost:3000/?flags=-some/flag-name  # disable

# Via .env file
echo "ACTIVE_FEATURE_FLAGS=feature1,feature2" > .env
```

Search for feature flags: `yarn feature-search [search]`

### Build System

- **Webpack** with multiple entry points for code splitting
- **Babel** for transpilation (config in `@automattic/calypso-babel-config`)
- **Sass** for stylesheets (use RTL-specific properties like `margin-inline-start`)
- Hot module replacement for development
- Limited builds via `SECTION_LIMIT` and `ENTRY_LIMIT` environment variables

### Code Standards

#### React & TypeScript
- Use `@wordpress/element` instead of direct React import
- Functional components only (no classes)
- Use `@wordpress/components` where possible (see `.cursor/rules/wordpress-imports.mdc`)
- Import from `@wordpress/data` for store management
- Use `clsx` instead of `classnames`
- Named exports preferred
- Directories use lowercase-with-dashes

#### Styling
- Use RTL-specific properties: `margin-inline-start` not `margin-left`
- Don't use `&--` or `&__` selectors; write full class names
- For A4A: Use `--color-*` variables instead of `--studio-*`
- Import styles: `import './style.scss';` (with empty line before other imports)

#### Internationalization
```javascript
import { useTranslate } from 'i18n-calypso';

function MyComponent() {
  const translate = useTranslate();
  return <div>{ translate( 'Hello World' ) }</div>;
}
```

#### Testing
- Keep 1 empty line between style import and other imports
- Follow WordPress code conventions (generous whitespace)
- Use JSDoc for documentation
- Comments explain "why", not "what"
- Wrap comments at 100 columns

## Common Workflows

### Creating a Package
```bash
# Use the generator
yarn generate

# Or manually create with structure:
packages/your-package/
  ├── package.json
  ├── README.md
  ├── CHANGELOG.md
  ├── src/
  │   └── index.js
  └── test/
      └── index.js
```

### Working with Branches
- Main branch: `trunk` (not `main` or `master`)
- Branch naming: `add/feature-name`, `fix/issue-description`, `update/component-name`, `try/experiment`
- Avoid `renovate/` prefix (reserved for bot)

### Git Workflow
- Never commit unless explicitly requested
- Never use git commands with `-i` flag (interactive not supported)
- Create draft PRs initially to welcome early feedback
- Squash minor commits before final review
- Push frequently to avoid long-running branches

### Debugging
```bash
# Start Node debugger
NODE_OPTIONS="--inspect=5858" yarn start
NODE_OPTIONS="--inspect-brk" yarn start  # Break on first line
```

## Important Notes

### Local Development Setup
1. Add `127.0.0.1 calypso.localhost` to `/etc/hosts`
2. Access at `http://calypso.localhost:3000` (not `localhost`)
3. Allow 3rd-party cookies from `https://public-api.wordpress.com`

### Cursor Rules
The `.cursor/rules/` directory contains scoped rules:
- `calypso-client-rules.mdc` - Applies to all client code
- `a4a-custom-rules.mdc` - Automattic for Agencies specific rules
- `wordpress-imports.mdc` - WordPress component reference

### Short Codes (from Cursor rules)
- `ddc` - "discuss don't code" - don't make changes, only discuss options
- `jdi` - "just do it" - approval to proceed with discussed changes
- `cpd` - "create PR description" - generate PR description from branch changes

### WordPress Imports
- Use `@wordpress/components` for UI components (Button, Card, Modal, etc.)
- Use `@wordpress/block-editor` for block editor components
- Use `@wordpress/data` for state management (similar to Redux)
- Use `@wordpress/core-data` for WordPress entity store access

### Package Management
- Uses Yarn 4 workspaces
- Run `yarn` after pulling to install dependencies
- Packages are built automatically on `yarn` (via `prepare` scripts)
- To build specific package: `yarn workspace @automattic/package-name run prepare`

### Key Directories Reference
- Action types: `client/state/action-types.ts`
- Shared components: `client/components/`
- Site management: `client/my-sites/`
- Authentication: `client/auth/`, `client/login/`
- Build tools: `bin/`, `build-tools/`
- Configuration: `config/`

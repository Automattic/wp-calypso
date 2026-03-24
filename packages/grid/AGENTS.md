# Grid

`@automattic/grid` — data-driven CSS Grid layout component for React. See `README.md` for API and usage.

## Commands

```bash
# Build (ESM + CJS)
yarn workspace @automattic/grid prepack

# Type check
yarn workspace @automattic/grid tsc --build --dry

# Run tests
yarn workspace @automattic/grid test

# Storybook
yarn workspace @automattic/grid storybook:start

# Lint
yarn eslint packages/grid/src/<file>
```

## Conventions

- **Types**: All shared types live in `src/types.ts`.
- **Peer deps**: React 18+.

## Release Process

Published to npm as `@automattic/grid`. Steps:

1. **Prepare PR**
   - Update version in `package.json`
   - Update `CHANGELOG.md` (Keep a Changelog format)
   - Merge PR to trunk

2. **Publish to npm**
   - Checkout `trunk` at the merged commit
   - Log in with your personal npm account (must be a member of the `@automattic` org): `yarn npm login --scope automattic`
   - Verify: `yarn npm whoami --scope automattic`
   - Publish: `cd packages/grid && yarn npm publish`
   - Enter 2FA code when prompted
   - Verify on [npmjs.com](https://www.npmjs.com/package/@automattic/grid)

3. **Create git tag**
   - `git tag "@automattic/grid@<version>"`
   - `git push origin "@automattic/grid@<version>"`
   - Verify tag on GitHub

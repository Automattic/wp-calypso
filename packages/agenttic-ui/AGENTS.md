# Agenttic UI

`@automattic/agenttic-ui` — React components for the Agenttic agent framework. See `README.md` for API and usage.

## Commands

```bash
# Build (downloads translations, then vite + declarations)
yarn workspace @automattic/agenttic-ui run build

# Type check
yarn workspace @automattic/agenttic-ui run type-check

# Run tests (vitest, not Calypso's jest)
yarn workspace @automattic/agenttic-ui run test

# Storybook
yarn workspace @automattic/agenttic-ui run storybook

# Lint
yarn eslint packages/agenttic-ui/src/<file>
```

## Conventions

- **No dependency on `agenttic-client`.** This package has zero runtime imports of
  `@automattic/agenttic-client`. Types it needs are hand-mirrored in `src/types/index.ts`.
  Keep it that way — UI-only consumers depend on this package alone. Nothing checks the
  mirrored types against the client's originals, so changes to shared shapes must be
  applied on both sides by hand.
- **Version lockstep with `agenttic-client` is convention only.** No script, hook, or CI
  enforces it.
- **Translations.** `src/assets/translations.ts` globs
  `../../languages/wpcom-agenttic-*.jed.json`. The path must stay relative to this
  package. A wrong path does not error — the glob silently resolves to nothing and the
  package ships with no translations. Verify `dist` actually contains translation data
  after building, not just that the build exited 0.
- **CSS.** CSS Modules with `generateScopedName: '[name]_[local]'`. Three CSS entry
  chunks are emitted — `index.css`, `embedded-agent-ui.css`, `global.css`. There is prior
  history of styles bleeding between entry points; check all three after changing the
  build.
- **License.** MIT, not Calypso's usual GPL-2.0-or-later. The root `.eslintrc.js` carries
  an explicit exception for this.

## Follow-up

`scripts/extract-i18n.js` has no clean home. It scans **both** agenttic packages but lives
under this one, and its globs are relative to the repo root, so `i18n:extract` has to `cd`
there first. Either move it to a shared location or replace it with Calypso's
`wp-babel-makepot`.


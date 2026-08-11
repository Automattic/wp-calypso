# AGENTS.md — @automattic/agenttic-ui

Pure presentation for the Automattic agent framework. **No agent communication.**

Moved here from `github.a8c.com/Automattic/agenttic` (now archived); the full history lives in
that repo. Its sibling is `packages/agenttic-client`, and the two are **released in lockstep at the
same version** — both `package.json` versions must match.

## Commands

```bash
yarn workspace @automattic/agenttic-ui run build       # downloads translations, then vite + tsc
yarn workspace @automattic/agenttic-ui run test        # vitest
yarn workspace @automattic/agenttic-ui run storybook   # :6006
yarn workspace @automattic/agenttic-demo run dev       # playground on :3001
```

Tests are **vitest**, not Calypso's jest, so `yarn test-packages` does not cover them. Run them
with the command above.

## Composition

`AgentUI` is a thin convenience wrapper: `AgentUIContainer` (all state, provides `AgentUIContext`)
plus composable children (`AgentUI.Header`, `.Messages`, `.Input`, `.Suggestions`, `.Notice`,
`.Footer`, `.ConversationView`). Consumers wanting a custom layout compose those directly;
`useAgentUIContext()` throws outside a container.

`variant` is only `'floating' | 'embedded'`. The floating variant adds drag/resize
(`hooks/useFloatingPanel*`, `useResizablePanel`, `useBoundaryInsets`). Views under
`components/views/` (`CollapsedView`, `CompactView`, `ConversationView`, `MinimizedView`) are
floating-state renderings.

Three build entry points, each with its own CSS chunk: `index`, `embedded-agent-ui` (a leaner
surface for embedded hosts, including `LightweightMarkdownRenderer`), and the raw `global.css`.
Keep the embedded entry from pulling in the full tree — past commits fixed CSS chunk bleed between
the two, so verify all three chunks still emit after changing entry points.

## The prop contract

This package has **zero runtime imports from `agenttic-client`** — grep before adding one. The
client types it needs (`Message`, `AgentSource`, `Suggestion`, `QuestionPrompt`) are deliberately
re-declared in `src/types/index.ts`; keep them structurally compatible by hand. Nothing checks this:
each package typechecks blind to the other, so drift in `UseAgentChatReturn` surfaces only when
someone runs `packages/agenttic-demo`.

## Styling

CSS Modules (`*.module.css`) with `generateScopedName: '[name]_[local]'`, all under a `.agenttic`
scope. Design tokens are CSS custom properties in `src/styles/tokens.css`; consumers theme by
overriding them, never by targeting generated class names.

Public styling hooks are `data-slot="..."` attributes — these are **API**. Renaming or removing one
breaks downstream CSS. `NON_DRAGGABLE_SELECTORS` in `utils/constants.ts` must stay in sync with the
`data-slot` list in `styles/global.css`.

## Conventions

- **This package is not formatted to Calypso's style.** It came from a repo using stock prettier;
  Calypso runs wp-prettier, which adds paren spacing (`fn( arg )`). `prettier/prettier` and
  `import/order` are therefore off in `.eslintrc.cjs`. Reformatting is a pending follow-up — until
  then, match the surrounding file, not Calypso.
- `@typescript-eslint/consistent-type-imports` is enforced: use `import type`.
- i18n text domain is `a8c-agenttic` (see `.eslintrc.cjs`).
- **Tests use raw `react-dom/client` — there is no `@testing-library` here.** Pattern: `createRoot` +
  `act` from `react`, `IS_REACT_ACT_ENVIRONMENT = true`, query with `querySelector` over
  `data-slot`/`viewBox` selectors. Match it; don't add a testing library.
- `vitest.config.ts` has **no `test` block**, so UI tests that touch the DOM need a
  `// @vitest-environment jsdom` docblock on line 1.
- Tests sit next to sources (`Foo.test.tsx`) or in a sibling `__tests__/`; both are used.

## Gotchas

- **`build` deletes `languages/*.jed.json` and re-downloads them from `translate.wordpress.com`.**
  Translations are bundled into the build via `import.meta.glob` in `src/assets/translations.ts`, so
  building offline silently ships a translation-less package — the glob just resolves to nothing and
  the build still exits 0. After building, check that `dist` actually contains translation data. Per-
  locale 404s during the download are normal and non-fatal (about half the configured locales 404).
- That glob and `scripts/download-translation-files.js` both resolve `languages/` **relative to this
  package**. They pointed at the old repo root before the move; keep any new reference package-local.
- Everything meaningful is externalized in the vite lib config (react, `@wordpress/*`,
  `@automattic/charts`, `react-markdown`, `framer-motion`, radix, …). A new runtime dependency must
  be added to **both** `package.json` and the `rollupOptions.external` list, or it gets silently
  inlined into the bundle.
- `marked` is an optional dependency, lazily `import()`ed in `utils/streaming/parseBlocks.ts` — code
  must work when it is absent.
- `scripts/extract-i18n.js` scans **both** agenttic packages but lives here. That is a known wart;
  it may move or be replaced by Calypso's `wp-babel-makepot`.

# @automattic/agenttic-ui

Moved here from `ghe-Automattic/agenttic`. Pure presentation components for the Agenttic
framework — no agent communication. Published to npm and consumed in-repo via `workspace:^`.

Released in lockstep with `@automattic/agenttic-client` at the same version. The lockstep is a
convention, not a mechanism — keep both `package.json` versions matching when bumping.

**Zero runtime imports from `agenttic-client`** — verify with grep before adding one. UI-side
types that mirror client types (`Message`, `AgentSource`, `Suggestion`, `QuestionPrompt`) are
deliberately re-declared in `src/types/index.ts`; keep them structurally compatible by hand.

## Commands

```bash
yarn workspace @automattic/agenttic-ui run build     # downloads translations, then vite + tsc
yarn workspace @automattic/agenttic-ui run test      # vitest
yarn workspace @automattic/agenttic-ui run storybook # :6006
```

The interactive playground lives in `packages/agenttic-demo`
(`yarn workspace @automattic/agenttic-demo run dev` → :3001); it aliases both packages to
source, so edits reflect without a build.

## Architecture

`AgentUI` is a thin convenience wrapper: `AgentUIContainer` (all state, provides
`AgentUIContext`) + composable children (`AgentUI.Header`, `.Messages`, `.Input`,
`.Suggestions`, `.Notice`, `.Footer`, `.ConversationView`). Consumers wanting custom layout
compose those directly; `useAgentUIContext()` throws outside a container.

`variant` is only `'floating' | 'embedded'`. The floating variant adds drag/resize
(`hooks/useFloatingPanel*`, `useResizablePanel`, `useBoundaryInsets`). Views under
`components/views/` (`CollapsedView`, `CompactView`, `ConversationView`, `MinimizedView`) are
floating-state renderings.

Three build entry points, each with its own CSS chunk: `index`, `embedded-agent-ui` (leaner
surface for embedded hosts, incl. `LightweightMarkdownRenderer`), and the raw `global.css`.
Keep the embedded entry from pulling in the full tree — past commits fixed CSS chunk bleed
between the two.

## Styling

CSS Modules (`*.module.css`) with `generateScopedName: '[name]_[local]'`, all under a
`.agenttic` scope. Design tokens are CSS custom properties in `src/styles/tokens.css`;
consumers theme by overriding them, never by targeting generated class names.

Public styling hooks are `data-slot="..."` attributes — these are **API**. Renaming or
removing one breaks downstream CSS. `NON_DRAGGABLE_SELECTORS` in `utils/constants.ts` must
stay in sync with the `data-slot` list in `styles/global.css`.

## i18n

- Text domain is `a8c-agenttic`.
- **The build deletes `languages/*.jed.json` and re-downloads them from
  `translate.wordpress.com`.** Translations are bundled via `import.meta.glob`
  (`src/assets/translations.ts`), so building offline silently ships a translation-less
  package. Per-locale 404s during the download are normal and non-fatal.
- `scripts/extract-i18n.js` regenerates `languages/a8c-agenttic.pot` — note it scans **both**
  agenttic packages even though it lives here.

## Conventions

- Formatting is WordPress prettier style (tabs, spaces inside parens/brackets), configured by
  the package `.prettierrc`.
- **Tests use raw `react-dom/client` — there is no `@testing-library` here.** Match the
  existing pattern; don't add a testing library.
- `vitest.config.ts` has **no `test` block**, so UI tests that touch the DOM need a
  `// @vitest-environment jsdom` docblock on line 1.
- Tests are vitest and do not run under Calypso's jest-based `test-packages`; run them with
  the workspace `test` script.

## Gotchas

- Everything meaningful is externalized in the vite lib config (react, `@wordpress/*`,
  `@automattic/charts`, `react-markdown`, `framer-motion`, radix, …). A new runtime dependency
  must be added to both `package.json` and the `rollupOptions.external` list, or it gets
  silently inlined into the bundle.
- `marked` is an optional dependency, lazily `import()`ed in
  `utils/streaming/parseBlocks.ts` — code must work when it's absent.
- `vite --mode use-ui-build` in the demo package aliases the UI to `dist/` instead of source —
  use it to verify the built artifact.

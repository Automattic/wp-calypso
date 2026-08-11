# AGENTS.md — @automattic/agenttic-client

Transport, state, tools, persistence for the Automattic agent framework. **No UI.**

Moved here from `github.a8c.com/Automattic/agenttic` (now archived); the full history lives in
that repo. Its sibling is `packages/agenttic-ui`, and the two are **released in lockstep at the
same version** — both `package.json` versions must match.

## Commands

```bash
yarn workspace @automattic/agenttic-client run build       # vite lib build + tsc --emitDeclarationOnly
yarn workspace @automattic/agenttic-client run test        # vitest
yarn workspace @automattic/agenttic-client run type-check
```

Tests are **vitest**, not Calypso's jest, so `yarn test-packages` does not cover them. Run them
with the command above.

## The prop contract

`useAgentChat()` returns an object that spreads straight into `<AgentUI {...chat} />`. That is the
entire seam between the two packages:

```tsx
const chat = useAgentChat( { agentId: 'big-sky', contextProvider, toolProvider } );
return <AgentUI { ...chat } variant="floating" />;
```

`agenttic-ui` has **zero runtime imports from this package** — grep before adding one. It
re-declares the types it needs (`Message`, `AgentSource`, `Suggestion`, `QuestionPrompt`) by hand in
`packages/agenttic-ui/src/types/index.ts`. Nothing checks that the two stay compatible: each package
typechecks blind to the other, so drift in `UseAgentChatReturn` surfaces only when someone runs
`packages/agenttic-demo`. Changing its shape is a breaking change for the UI, which is why the
versions move together.

## Two independent transports

1. **`src/client/` + `src/react/`** — the primary stack. Originally A2A (Agent2Agent) but no longer
   conformant. JSON-RPC over HTTP to `${agentUrl}/${agentId}`, always hitting the `message/stream`
   SSE endpoint (token-by-token streaming is a separate opt-in flag). Layers:
   `client/index.ts` (`createClient`, tool-call loop, ability routing) → `react/agentManager.ts`
   (functional singleton registry of named agent instances, conversation history, async tool-promise
   resolution) → `react/useAgentChat.ts` (builds `UIMessage[]`, suggestions, markdown components,
   message actions, regenerate). SSE parsing lives in `client/utils/internal/streaming.ts`.
2. **`src/agents-api/`** — a separate plain-REST adapter for WordPress-native surfaces
   (`useAgentsApiChat`, `rest.ts`, `normalizer.ts`). Different endpoints, different message shape,
   its own normalizer. Exported under the `./agents-api` subpath. It is a **parallel** stack, not a
   layer on top of the first one. Don't cross-wire them.

Tool execution routes through `executeToolOrAbility` in `client/index.ts`, which matches both the
original WordPress Ability name (`demo/get-user-info`) and the backend-sanitized OpenAI-safe form
(`demo__get_user_info`).

Conversation persistence: memory cache + `sessionStorage`, keyed by `sessionId`
(`react/conversationStorage.ts`). Server-side history for Odie bots goes through
`react/odieService.ts`.

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
- `vitest.config.ts` sets `environment: 'jsdom'` globally for this package.
- Tests sit next to sources (`Foo.test.ts`) or in a sibling `__tests__/`; both are used.
- Debug at runtime with `window.DEBUG = 'agenttic-client'` (see `client/utils/logger.ts`).

## Gotchas

- `tsconfig.json` sets `"types": []` deliberately. Without it, tsc implicitly loads every `@types/*`
  hoisted into the Calypso root and fails on ones this package cannot resolve.
- Everything meaningful is externalized in the vite lib config (react, `@wordpress/*`, …). A new
  runtime dependency must be added to **both** `package.json` and the `rollupOptions.external` list,
  or it gets silently inlined into the bundle.
- `marked` is an optional dependency, lazily `import()`ed — code must work when it is absent.

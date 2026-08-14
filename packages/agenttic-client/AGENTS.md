# @automattic/agenttic-client

Moved here from `ghe-Automattic/agenttic`. Transport, state, tools, and persistence for the
Agenttic framework — no UI. Published to npm and consumed in-repo via `workspace:^`.

Released in lockstep with `@automattic/agenttic-ui` at the same version. The lockstep is a
convention, not a mechanism — keep both `package.json` versions matching when bumping.

## Commands

```bash
yarn workspace @automattic/agenttic-client run build
yarn workspace @automattic/agenttic-client run test          # vitest
yarn workspace @automattic/agenttic-client run type-check
```

## Architecture

### The prop contract

`useAgentChat()` returns an object that spreads straight into `<AgentUI {...chat} />`. That is
the entire seam between the two packages:

```tsx
const chat = useAgentChat( {
	agentId: 'big-sky',
	contextProvider,
	toolProvider,
} );
return <AgentUI { ...chat } variant="floating" />;
```

`agenttic-ui` has **zero runtime imports from `agenttic-client`** — UI-side types are
deliberately re-declared by hand in `packages/agenttic-ui/src/types/index.ts`. Changing the
shape of `UseAgentChatReturn` is a breaking change for the UI; that is why versions move in
lockstep.

### Two independent transports

1. **`src/client/` + `src/react/`** — the primary stack. JSON-RPC over HTTP to
   `${agentUrl}/${agentId}`, always hitting the `message/stream` SSE endpoint (token-by-token
   streaming is a separate opt-in flag). Layers: `client/index.ts` (`createClient`, tool-call
   loop, ability routing) → `react/agentManager.ts` (functional singleton registry of named
   agent instances, conversation history, async tool-promise resolution) →
   `react/useAgentChat.ts` (builds `UIMessage[]`, suggestions, markdown components, message
   actions, regenerate). SSE parsing lives in `client/utils/internal/streaming.ts`.
2. **`src/agents-api/`** — a separate plain-REST adapter for WordPress-native surfaces
   (`useAgentsApiChat`, `rest.ts`, `normalizer.ts`), exported under the `./agents-api` subpath.
   Not a layer on top of the stack above — a parallel one. Don't cross-wire them.

Tool execution routes through `executeToolOrAbility` in `client/index.ts`, which matches both
the original WordPress Ability name (`demo/get-user-info`) and the backend-sanitized
OpenAI-safe form (`demo__get_user_info`).

Conversation persistence: memory cache + `sessionStorage`, keyed by `sessionId`
(`react/conversationStorage.ts`). Server-side history for Odie bots goes through
`react/odieService.ts`.

## Conventions

-   Formatting is WordPress prettier style (tabs, spaces inside parens/brackets), configured by
    the package `.prettierrc`.
-   `@typescript-eslint/consistent-type-imports` is enforced — use `import type`.
-   i18n text domain is `a8c-agenttic`.
-   **Tests use raw `react-dom/client` — there is no `@testing-library` here.** Pattern:
    `createRoot` + `act` from `react`, `IS_REACT_ACT_ENVIRONMENT = true`, query with
    `querySelector` over `data-slot`/`viewBox` selectors. Match it; don't add a testing library.
-   `vitest.config.ts` sets `environment: 'jsdom'` globally.
-   Tests sit next to sources (`Foo.test.ts`) or in a sibling `__tests__/`; both are used.
-   Debug at runtime with `window.DEBUG = 'agenttic-client'` (see `client/utils/logger.ts`).

## Gotchas

-   Everything meaningful is externalized in the vite lib config (react, `@wordpress/*`, …).
    A new runtime dependency must be added to both `package.json` and the
    `rollupOptions.external` list, or it gets silently inlined into the bundle.
-   `marked` is an optional dependency, lazily `import()`ed — code must work when it's absent.
-   Tests are vitest and do not run under Calypso's jest-based `test-packages`; run them with
    the workspace `test` script.

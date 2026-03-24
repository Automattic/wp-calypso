# Agents Manager Package

## Package Overview

`@automattic/agents-manager` is the shared component library for WordPress.com's unified AI agent experience. It runs in multiple environments:

1. **Calypso** — embedded directly as a React component in the WordPress.com dashboard.
2. **Simple sites** — loaded via `widgets.wp.com` as a Gutenberg editor plugin and wp-admin bar menu item.
3. **Atomic sites** — same as Simple when connected to Jetpack. Falls back to a disconnected variant when not connected.
4. **CIAB (Commerce in a Box)** — loaded via `widgets.wp.com` through Next Admin, not through Calypso.

Most code lives here in `packages/agents-manager/`. The `apps/agents-manager/` app handles building and deploying the webpack bundles that serve Simple, Atomic, and CIAB sites.

## Backend

The Agents Manager backend lives in `jetpack-mu-wpcom` (in the Jetpack monorepo). It is responsible for:

1. **Loading the Agents Manager** in wp-admin, the block editor, and CIAB — it enqueues the webpack bundles built by `apps/agents-manager/` from `widgets.wp.com`.
2. **Registering the `/agents-manager/open-state` REST API endpoint** for persisting UI state (open/docked/position) via user preferences.

Any change that requires new API endpoints, different API behavior, or loading the Agents Manager in a new context requires work in `jetpack-mu-wpcom`, not in this repo.

## Architecture

### State Management

Uses WordPress `@wordpress/data` stores and TanStack Query for server state.

- **`AGENTS_MANAGER_STORE`** (`src/stores.ts`) — UI state (isOpen, isDocked, floatingPosition, routerHistory).
- **`AgentsManagerContext`** (`src/contexts/AgentsManagerContext.tsx`) — React context for currentUser, site, sectionName, agentConfig, sessionId.

### Key Directories

```
src/
├── index.ts              # Entry point & exports
├── constants.ts          # API URLs and agent IDs
├── types.ts              # TypeScript type definitions
├── stores.ts             # WordPress data store registration
├── extension-types.ts    # Plugin extension interfaces (ToolProvider, ContextProvider, Ability)
├── auth/                 # Authentication providers (Calypso auth)
├── components/           # React UI components
│   ├── agents-manager.tsx          # Main component wrapper
│   ├── agent-chat/                 # Chat UI (messages, input, suggestions)
│   ├── agent-dock/                 # Dock/sidebar with routing
│   ├── agent-history/              # Conversation history view
│   ├── headless-agent-initializer.tsx  # Headless agent setup (no UI)
│   ├── chat-header/                # Header with menu
│   ├── feedback-input/             # Feedback form after thumbs down
│   ├── escalation-button/          # Support escalation
│   ├── support-guides/             # Support articles list
│   └── ...                         # 23 component directories total
├── contexts/             # React context providers
├── hooks/                # Custom React hooks
│   ├── use-agent-config.ts         # Agent ID/version resolution
│   ├── use-agent-layout-manager/   # Layout management with store
│   ├── use-conversation.ts         # Individual conversation state
│   ├── use-conversation-list.ts    # Conversation history
│   ├── use-feedback-action.ts      # Rating/feedback submission
│   ├── use-persisted-history.ts    # Conversation persistence
│   ├── use-setup-custom-actions/   # Window API for cross-app integration
│   ├── use-should-use-unified-agent.ts  # Unified experience flag
│   └── ...
├── utils/                # Utilities
│   ├── load-external-providers.ts  # Dynamic extension loading
│   └── ...
└── styles/               # Global SCSS (variables, mixins, animations)
```

### Extension System

The Agents Manager supports plugin extensions via a dynamic provider system. Providers are registered by PHP filters and loaded at runtime.

**Loading flow:**
1. PHP filter `agents_manager_agent_providers` registers provider module URLs, injected as `agentsManagerData.agentProviders`.
2. `loadExternalProviders()` (`src/utils/load-external-providers.ts`) dynamically imports each module.
3. Each module can export: `toolProvider`, `contextProvider`, `useAbilitiesSetup`, `getEmptyViewSuggestions`, `markdownComponents`, `markdownExtensions`, and more.

**Key interfaces** (defined in `src/extension-types.ts`):
- **`ToolProvider`**: `getAbilities()` and `executeAbility(name, args)`
- **`Ability`**: name, label, description, category, input_schema, output_schema, callback, permissionCallback, meta.annotations
- **`ContextProvider`**: `getClientContext()` returning URL, pathname, environment, contextEntries

### Agenttic Integration

The package uses `@automattic/agenttic-client` and `@automattic/agenttic-ui` for the core chat runtime:

- **agenttic-client**: `getAgentManager()`, `useAgentChat()`, message types, auth providers
- **agenttic-ui**: `AgentUI`, `createMessageRenderer()`, `EmptyView`, `ImageUploader`, suggestion/markdown types

### How Changes Flow to Simple/Atomic

Changes in `packages/agents-manager/src/` are consumed by `apps/agents-manager/` via its webpack entry points. The app bundles the package into 8 separate JS files deployed to `widgets.wp.com/agents-manager/`. Jetpack enqueues these bundles on WordPress.com Simple and Atomic sites.

## Testing

### Unit Tests

```bash
# Run from repo root
yarn jest packages/agents-manager
```

Test files live in `src/components/__tests__/`, `src/hooks/__tests__/`, `src/contexts/__tests__/`, and `src/utils/__tests__/`.

### Sandbox Testing (Simple/Atomic/CIAB)

To verify changes on Simple, Atomic, and CIAB sites you only need to sandbox `widgets.wp.com` — the sites themselves do not need sandboxing:

1. Sandbox `widgets.wp.com`.
2. Run `cd apps/agents-manager && yarn dev --sync` — this builds the webpack bundles and syncs them to your sandbox.
3. Visit any Simple, Atomic, or CIAB site and verify the Agents Manager works correctly.

See `apps/agents-manager/AGENTS.md` for more details on the build/sync layer.

## PR Guidelines

**Every PR touching `packages/agents-manager/`** must include testing instructions for both Calypso and Simple/Atomic/CIAB environments:

### Testing Instructions Template

```markdown
## Testing Instructions

### Calypso

1. Run `yarn start`.
2. Open the Agents Manager and verify [describe expected behavior].

### Simple/Atomic/CIAB

1. Sandbox `widgets.wp.com`.
2. Run `cd apps/agents-manager && yarn dev --sync`.
3. Visit any Simple, Atomic, or CIAB site (the site itself does not need sandboxing).
4. Open the Agents Manager and verify [describe expected behavior].
```

This "always include both" rule exists because nearly everything in `packages/agents-manager/src/` flows through to the Simple/Atomic/CIAB bundles. Missing sandbox testing steps is costly; including them when not strictly needed is cheap.

## Conventions

- **i18n**: Use `@wordpress/i18n` with text domain `'__i18n_text_domain__'` for all user-facing strings. New strings won't be translated on Atomic until the next `jetpack-mu-plugin` release (twice daily).
- **Components**: Use `@wordpress/components` and `@automattic/components` where appropriate.
- **Data fetching**: Use TanStack Query for server state. Follow existing patterns in `src/hooks/`.
- **Styling**: Component-scoped SCSS files (`style.scss`). Global styles and variables in `src/styles/`.
- **Store**: Use `AGENTS_MANAGER_STORE` via `@wordpress/data` for UI state. Use `AgentsManagerContext` for session/user/site data.

## Common Pitfalls

- **Two deployment targets**: Changes must work in both Calypso (SPA) and Simple/Atomic/CIAB (via `widgets.wp.com`). Always test both.
- **Multiple entry points**: `apps/agents-manager/` has 8 webpack entry points for different contexts. A change may behave differently across entry points.
- **asset.json sync limitation**: If you add or remove `@wordpress/*` dependencies, the `.asset.json` files won't sync to the sandbox because Jetpack fetches them from production. You must deploy for dependency changes to take effect on Atomic.
- **Disconnected variants**: Some entry points have "disconnected" versions that show minimal UI (help icon link only). Make sure changes don't break these variants.
- **Help Center replacement**: On Gutenberg pages, the Agents Manager dequeues Help Center scripts. Be aware of this interaction when debugging.
- **Extension provider changes**: If modifying the extension system interfaces in `extension-types.ts`, coordinate with Big Sky and any other provider plugins.

# Block Notes

## Package Overview

`@automattic/block-notes` is an AI-powered block commenting system for WordPress. Users mention `@ai` in block notes to get contextual AI assistance. A headless wp-orchestrator agent receives block, post, and thread context, then responds by creating new notes via the WordPress Abilities API.

## Architecture

### State Management

Minimal state lives in the WordPress data store `block-notes/store` (`src/store/index.ts`). This store tracks:

- Which notes are currently being processed by the AI (`inProcessNotesByPost`: Record of postId to noteId[])
- A stable session ID for the current page load

**Important patterns:**

- **Duplicate prevention**: Two-layer deduplication. An in-memory `Set<number>` provides fast lookup, backed by `bigsky_ai_processed_date` comment meta persisted to the database.
- **Stale note rejection**: Notes older than 60 seconds are auto-rejected with an error reply, preventing backlog processing on page reload.
- **Minimal store**: The store is intentionally small. Cross-component coordination happens via the Redux store as the bridge between the separate block-notes bundle and the block editor.

### Component Hierarchy

```
BlockNoteSubscriptions (src/components/subscriptions/)
  -> useAgentConfig (loads async agent config)
  -> BlockNoteSubscriptionsChat (main orchestration)
     -> useAgentChat (from @automattic/agenttic-client)
     -> useSelect (monitors WordPress data store for new notes with @ai)
     -> useDispatch (manages in-process note state)
     -> BlockNoteMentionAutocomplete (placeholder text & @ai pill styling)
     -> BlockNoteThinkingIndicator (shimmer animation while AI processes)
```

### Abilities API

The package registers `big-sky/block-notes` via the WordPress Abilities API (`src/abilities/`). This ability supports two operations:

- `get`: Fetches all notes in a thread for context
- `reply`: Creates a new note as a reply to a thread

The AI agent invokes these operations through the wp-orchestrator agentic flow -- the client-side code submits context, and the agent autonomously calls the ability to reply.

### Data Flow

1. User writes a note containing `@ai` in the block editor
2. `BlockNoteSubscriptionsChat` detects the new note via `useSelect` on `@wordpress/core-data`
3. Component builds a context message (block content, post metadata, thread history) and submits to the agent via `agentSubmit()`
4. The wp-orchestrator agent calls `big-sky/block-notes` ability with `operation: 'get'` to read thread context
5. Agent formulates a response and calls `big-sky/block-notes` ability with `operation: 'reply'`
6. The ability callback creates the reply note via `@wordpress/core-data`
7. The note is marked as processed (`bigsky_ai_processed_date` meta) to prevent reprocessing

## Key Files

| File                                            | Purpose                                                               |
| ----------------------------------------------- | --------------------------------------------------------------------- |
| `src/index.tsx`                                 | Entry point (`initBlockNotes` function)                               |
| `src/store/index.ts`                            | Redux store (in-process notes, session ID)                            |
| `src/abilities/index.ts`                        | Ability registration & callback (get/reply)                           |
| `src/abilities/utils.ts`                        | CRUD operations (getBlockNotes, replyToNote, convertEntityNoteFormat) |
| `src/components/subscriptions/index.tsx`        | Main orchestration: monitors notes, triggers agent                    |
| `src/components/mention-autocomplete/index.tsx` | Placeholder text & @ai pill styling                                   |
| `src/components/thinking-indicator/index.tsx`   | Shimmer loading indicator                                             |
| `src/agent-config.ts`                           | Agent configuration factory                                           |
| `src/hooks/use-agent-config.ts`                 | Hook for async agent config loading                                   |
| `src/utils/tool-provider.ts`                    | Tool provider (filters abilities for agent)                           |
| `src/utils/content.ts`                          | @ai mention detection (hasAiMention, splitByAiMention)                |
| `src/utils/session.ts`                          | SHA-256 deterministic thread session IDs                              |
| `src/utils/tracking.ts`                         | Analytics (block*note*\* events)                                      |
| `src/utils/feature-flag.ts`                     | Feature flag check (window.blockNotesData.enabled)                    |

## File Organization

```
src/
├── index.tsx              # Entry point & initialization
├── agent-config.ts        # Agent configuration factory
├── store/                 # WordPress data store (single file)
│   └── index.ts
├── abilities/             # WordPress Abilities API handlers
│   ├── index.ts           # Ability registration & callback
│   └── utils.ts           # CRUD operations for notes
├── components/            # React components
│   ├── subscriptions/     # Main orchestration component
│   ├── mention-autocomplete/ # @ai mention UI (placeholder + pill styling)
│   └── thinking-indicator/   # Loading shimmer animation
├── hooks/                 # Custom React hooks
│   └── use-agent-config.ts
├── utils/                 # Utility functions
│   ├── content.ts         # @ai mention detection & splitting
│   ├── feature-flag.ts    # Feature flag check
│   ├── session.ts         # SHA-256 thread session IDs
│   ├── tool-provider.ts   # Agent tool provider
│   └── tracking.ts        # Analytics events
types/
└── wordpress.d.ts         # TypeScript declarations for WordPress globals
```

## Conventions

- **Styling**: Dynamic inline CSS injected via `<style>` elements at runtime. No SCSS files. Each component injects its own scoped styles with unique element IDs (e.g., `bigsky-mention-autocomplete-styles`).
- **CSS class prefix**: `bigsky-` (e.g., `bigsky-mention-pill`, `bigsky-thinking-indicator`).
- **Tracking**: All analytics events prefixed with `block_note_`. Use the dedicated tracking functions in `src/utils/tracking.ts`, which call `recordTracksEvent()` from `@automattic/calypso-analytics`.
- **Feature flag**: `window.blockNotesData.enabled`, set by PHP enqueue. Checked via `areBlockNotesEnabled()` in `src/utils/feature-flag.ts`.
- **Abilities API**: `@wordpress/abilities` for agent-to-UI communication. The ability `big-sky/block-notes` is the contract between the AI agent and the client.
- **Data access**: `@wordpress/core-data` for note CRUD operations (entity records of type `comment` with `type: 'note'`).
- **i18n**: Use `@wordpress/i18n` for all user-facing strings.
- **Components**: UI components use `@wordpress/element` (React). Prefer `@wordpress/components` for primitives.

## Before Making Changes

1. Understand the store structure in `src/store/index.ts` before modifying state
2. Check the duplicate prevention logic in `src/components/subscriptions/index.tsx` (in-memory Set + meta field)
3. Check existing hooks in `src/hooks/` -- the feature you need may already exist
4. Run `yarn workspace @automattic/block-notes tsc --build --dry` to verify types compile

## Code Patterns to Follow

**State changes**: Add new state, actions, and selectors to `src/store/index.ts`. Do not create separate store files. The store is intentionally minimal.

**New features**: Extract logic into a custom hook in `src/hooks/`. The subscriptions component is already large -- keep it thin by delegating to hooks.

**New components**: Place in `src/components/<component-name>/` with `index.tsx`. Components in this package typically render no visible DOM -- they inject styles and manipulate the DOM via refs and MutationObservers.

**Styling**: Inject CSS dynamically via `document.createElement('style')` with a unique ID to prevent duplicates. Use the `bigsky-` class prefix. Follow the existing shimmer animation pattern for loading states.

**Types**: Shared types live in `src/abilities/utils.ts` (NoteEntity, ConvertedNote). Global type declarations go in `types/wordpress.d.ts`.

**Analytics**: Use the dedicated functions in `src/utils/tracking.ts`. All events follow the `block_note_` prefix pattern. Include `postId`, `noteId`, `parentNoteId`, and `sessionId` properties where applicable.

**i18n**: All user-facing strings must use `__()` or `_n()` from `@wordpress/i18n`.

**Abilities API**: Changes to the `big-sky/block-notes` ability input schema or callback affect the AI agent contract. The `description` field in the ability registration is part of the agent's prompt -- changes affect AI behavior.

## Testing

### What agents can run autonomously

| Test       | Command                                                                       | Needs sandbox? |
| ---------- | ----------------------------------------------------------------------------- | -------------- |
| Unit tests | `yarn jest packages/block-notes --config packages/block-notes/jest.config.js` | No             |
| Type check | `yarn workspace @automattic/block-notes tsc --build --dry`                    | No             |

Always run both before creating a PR.

### Unit tests

- Write unit tests for new hooks and utility functions
- Test files go alongside source: `content.ts` -> `content.test.ts`
- Use `@testing-library/react` for component and hook tests
- Mock `@automattic/agenttic-client` via `__mocks__/@automattic/agenttic-client.js`
- Mock `@wordpress/data`, `@wordpress/core-data`, and `@wordpress/editor` store interactions
- Mock `@automattic/calypso-analytics` for tracking tests
- Test environment is `jsdom` (configured in `jest.config.js`)

### UI testing (requires dev assistance)

Block Notes is bundled in `agents-manager` and served from `widgets.wp.com`. There is no local dev server -- **visual testing requires a sandbox**.

**Prerequisites (dev must set up):**

1. Sandbox `widgets.wp.com` -- dev confirms sandbox is active
2. Run `cd apps/agents-manager && yarn dev --sync` -- syncs build to sandbox
3. Log in to test site manually -- agent cannot authenticate

**Once prerequisites are met**, agents can use MCP Playwright tools for smoke testing:

- Navigate to the test site post editor
- Open a block's notes panel
- Type `@ai` followed by a question
- Verify the thinking indicator appears
- Verify the AI reply note is created

**Without a sandbox**, agents cannot do UI testing. Focus on unit tests, type checks, and build verification instead.

## Build & Verify

```bash
# Initial setup (run once from repo root)
yarn install

# Type check
yarn workspace @automattic/block-notes tsc --build --dry

# Run tests (from repo root)
yarn jest packages/block-notes --config packages/block-notes/jest.config.js

# Deploy to sandbox (builds block-notes as part of agents-manager bundle)
cd apps/agents-manager
yarn dev --sync
```

## Deployment

Deployed as part of the `agents-manager` bundle to `widgets.wp.com`. The entry point is `apps/agents-manager/block-notes.js`, which is configured as a separate webpack entry in `apps/agents-manager/webpack.config.js`. PHP in Jetpack plugins enqueues the script on relevant admin screens.

`@wordpress/abilities` is bundled in for self-hosted compatibility.

## Common Pitfalls

- **Stale notes**: Notes older than 60 seconds (`NOTE_STALE_THRESHOLD_MS`) are automatically rejected with an error reply. This prevents processing a backlog of old mentions on page reload. Do not increase this threshold without considering the UX impact.
- **Duplicate prevention**: Two layers: in-memory `Set<number>` for fast synchronous checks within the current page session, plus `bigsky_ai_processed_date` comment meta for persistence across page reloads. Both must be maintained together.
- **Abilities API contract**: The ability `description` field is part of the AI agent's prompt. Changes to `input_schema`, operation names, or the description directly affect how the AI agent behaves. Coordinate with the backend agent team.
- **Cross-bundle communication**: Block Notes runs in a separate webpack bundle from the block editor. The `block-notes/store` WordPress data store is the bridge. Do not assume direct component access to block editor internals.
- **Note format conversion**: Notes come from `@wordpress/core-data` in entity format and must be converted via `convertEntityNoteFormat()` before use. Always use the converter.
- **MutationObserver cleanup**: Both `MentionAutocomplete` and `ThinkingIndicator` use `MutationObserver` on `document.body`. Ensure proper cleanup in effect return functions to prevent memory leaks.
- **Async session IDs**: Thread session IDs use SHA-256 via `crypto.subtle.digest`, which is async. The `getBlockNoteThreadSessionId` function requires `await`.

## PR Guidelines

- Reference the Linear issue ID in the PR title
- Include before/after screenshots for any UI changes (mention pills, thinking indicator)
- Test with the block editor's collaboration sidebar open
- Verify duplicate prevention works (reload the page, ensure notes are not reprocessed)
- Check stale note handling if modifying timing logic

## Manual Browser Testing

Verify the block notes AI flow on the user's sandboxed site using Playwright MCP and DON'T use playwright-test. If the user has not provided a test site URL, ask them for one before proceeding.

### Rules

- Do NOT use screenshots or snapshots to decide what to click. Follow the exact steps below linearly.
- Use `browser_evaluate` for verification checks (pill styling, console messages).
- Use `browser_wait_for` over polling or sleeping when waiting for content.

### Testing Steps

1. Navigate to `/wp-admin/post.php?action=edit&post=<post_id>` on the test site. Wait for the post title to appear, confirming the Block Editor loaded.
2. Select a block (e.g., click the paragraph block in the `editor-canvas` iframe), then click the "Options" button (three dots) in the **Block tools** toolbar that appears above the selected block. Then click "Add note" from the dropdown menu.
3. Type `@ai help me improve this block` into the "New note" textbox, then click the "Add note" button.
4. Verify the "Thinking…" indicator appears in the thread using `browser_wait_for` with `text: "Thinking…"`.
5. Wait for the AI reply for a minute. The reply appears from "AI [experimental]".
6. Verify the `@ai` text is styled as a blue pill: `document.querySelectorAll('.bigsky-mention-pill')` should return at least one element with text `@ai` and a blue `backgroundColor`.

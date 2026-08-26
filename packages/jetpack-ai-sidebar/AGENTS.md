# Jetpack AI Sidebar

Agents Manager (AM) provider for the Jetpack AI sidebar in Gutenberg. Bridges the WordPress block editor with the AM chat interface via tools, context, and suggestions.

## File Guide (Read the Right File)

| File                         | Purpose                                  | When to read                          |
| ---------------------------- | ---------------------------------------- | ------------------------------------- |
| **AGENTS.md** (this)         | Critical patterns, pitfalls, conventions | Always read first for any code change |
| [package.json](package.json) | Dependencies, build scripts              | When modifying deps or build config   |

## Architecture

This package exports the **AM provider contract** — a set of functions the Agents Manager calls to wire up a sidebar provider:

| Export                    | Role                                                      |
| ------------------------- | --------------------------------------------------------- |
| `useAbilitiesSetup`       | Captures AM state and gates contextual block shimmer      |
| `toolProvider`            | Surfaces Jetpack AI's client-side abilities to AM         |
| `contextProvider`         | Sends Gutenberg editor state to the orchestrator          |
| `getChatComponent`        | Maps `type` strings → React components for show-component |
| `useCheckpoint`           | Post title/excerpt snapshots for AM's native Undo action  |
| `getEmptyViewSuggestions` | Static suggestions shown before conversation starts       |
| `useSuggestions`          | Block-aware dynamic suggestions during conversation       |

All exports live in `src/index.ts`. This is intentionally a single-file provider — keep it that way unless the file exceeds ~800 lines.

## Critical Patterns (Don't Break These)

- **Module-level state**: `addMessageFn`, `clearSuggestionsFn`, and `moduleCheckpointApi` are captured once via their respective hooks. These are module singletons — do NOT move them into React state or a store.
- **`returnToAgent: false`**: The `handleUpdateBlockContent` and `handleShowComponent` handlers return `{ returnToAgent: false }`. This prevents the AM orchestrator from continuing automatically after the tool executes. Removing this breaks the UX flow.
- **Tool ID normalization**: AM normalizes tool IDs (`wpcom/update-block-content` → `wpcom__update_block_content`). The `isUpdateBlockContentTool` / `isShowComponentTool` helpers handle both forms. Any new tool must follow this pattern.
- **Show-component via `agentMessage` escape hatch**: `handleShowComponent` returns `{ agentMessage: JSON }` — it does NOT call `addMessageFn` directly. agenttic-client wraps the JSON in an `{ role: 'agent', parts: [text] }` message, AM's `convert-tool-messages-to-components` resolves the component via `getChatComponent`, and AgentChat's action bar (thumbs/Undo) attaches because the original message had a text content part. See "Show-component pattern" below.
- **Role transformation**: AM's `useAbilitiesSetup` handler maps `role: 'assistant'` → `'agent'` and everything else → `'user'`. When injecting messages directly via `addMessageFn`, always use `'assistant'` — passing `'agent'` would make the message render as user content and get filtered out of the agent message list.
- **Processing shimmer**: Start request-time shimmer only for a contextual block-transformation suggestion with a known target block. Free-form requests fall back to the concrete `handleUpdateBlockContent` action after its target is resolved. Never use generic AM processing state by itself. The effect uses `Flow Block` font + CSS animations injected into the block's owning document (which may be an iframe).

## Tools

| Tool ID                           | Handler                     | UI Component           | Description                                                                                             |
| --------------------------------- | --------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------- |
| `jetpack_ai__show_component`      | `handleShowComponent`       | via `getChatComponent` | Renders Jetpack AI chat components                                                                      |
| `big_sky__show_component`         | `handleLegacyShowComponent` | Jetpack or Big Sky     | Temporary migration support; delegates non-Jetpack types                                                |
| `wpcom/update-block-content`      | `handleUpdateBlockContent`  | _(chat text)_          | Updates block content with shimmer effect                                                               |
| `jetpack_ai__apply_draft_content` | `handleApplyDraftContent`   | _(chat text)_          | Writes a first draft into an empty post or page (`draftAssist` flag only); never over an existing title |

### Show-component pattern

Used for Jetpack AI interactive components. The wpcom ability returns an `Input_Required_Result` with `tool_id: 'jetpack_ai__show_component'` and a data envelope shaped like:

```
{
  type: '<component-type>',
  props: { ... },
  calypsoCheckpointId: '<id>',
  isCurrent: true,
  hideZoomAction: true
}
```

On the client, `handleShowComponent`:

1. Looks up the component via `getChatComponent(type)` to verify the type is supported.
2. Snapshots state via the module-level `moduleCheckpointApi.setCheckpoint()` so AM's native Undo action can restore it later.
3. Returns `{ agentMessage: JSON.stringify({ tool_id, data }) }`. agenttic-client re-emits this as an `{ role: 'agent', parts: [text] }` message.
4. AM's `convert-tool-messages-to-components` matches the tool_id, calls `getChatComponent(data.type)`, and replaces the text content with a component render. Because the original message had text content, AgentChat renders its action bar (thumbs, Undo) on the resulting bubble.

Jetpack show-component messages still send `hideZoomAction: true`, but AM's zoom action was removed — the flag is write-only legacy, kept only until the provider payload cleanup lands.

The provider temporarily accepts legacy `big_sky__show_component` executions for Jetpack-owned component types during the migration, but new Jetpack AI component responses should use `jetpack_ai__show_component`. Unknown legacy component types should remain owned by the provider that registered them.

### Adding a new component type

1. Add a case in `getChatComponent()` mapping your `type` string to a React component.
2. Create the component under `src/components/` with a `scss` sibling.
3. Update the wpcom ability (or add a new one) to return `tool_id: 'jetpack_ai__show_component'` with `data: { type: '<your-type>', props: { ... } }`.
4. No changes to `toolProvider`, `useCheckpoint`, or the action bar wiring.

### Adding a non-rendering client tool

For tools that perform an editor action (like `update-block-content`):

1. Define the tool ID and ability schema in `src/utils/tool-provider.ts`
2. Add an `is<ToolName>Tool` helper that matches both raw and normalized IDs
3. Add the handler function in `src/index.ts`
4. Register the ability in `toolProvider.getAbilities()` with a callback
5. Add a fallback case in `toolProvider.executeAbility()`

## Editor entry points (`src/extensions/`)

`registerBlockEditorFilters()` (called once by `apps/agents-manager/jetpack-ai-sidebar.js`) registers the block toolbar button and the draft assist entry point. Each is independently flag-gated — do not nest one gate inside the other.

**Draft assist** (`draft-entry.ts`, `draftAssist` flag, post/page only):

- **Placeholder**: `bodyPlaceholder` is swapped while `core/editor`'s `isEditedPostEmpty()` is true, via a `wp.data.subscribe` loop. The editor re-pushes its own settings whenever they change, so the sync re-applies on every tick, re-captures the editor's current value each time, and restores only if the placeholder is still ours. The loop runs on every store tick, so it must stay cheap and must not throw: every selector/dispatch goes through `callStoreMethod()` (guarding the store _lookup_ alone is not enough — a throwing selector would take down `wp.data`'s whole listener loop). It unsubscribes itself (`stopBodyPlaceholderSync()`, also the test teardown) as soon as the entry point cannot apply — flag off, or a resolved post type that isn't post/page. An _unresolved_ post type is not a stop condition; the editor just hasn't booted yet.
- **`/draft` trigger prefix, not `/`**: Gutenberg's autocomplete resolves to exactly one completer per keystroke — longest/latest-ending trigger prefix wins, ties broken by array order (`getAutocompleteMatch` in `@wordpress/components`). A second `/` completer would either never fire (appended) or shadow the core block inserter (prepended). Keep the distinct prefix.
- **Chat handoff**: `submitChatMessage` is optional on `window.__agentsManagerActions` and only exists once the chat panel mounts — poll for it after `isReady`/`agents-manager-ready`, and fall back to `setChatInput`.
- **Handler guards** (`utils/apply-draft-content.ts`): the ability is registered for the whole editor surface, so `handleApplyDraftContent` re-checks everything the entry point checks. It refuses (returning `returnToAgent: true` so the agent can explain) unless the post type is in `DRAFT_ASSIST_POST_TYPES` (`utils/draft-assist.ts`, shared with the entry point — in the site editor `core/editor` serves templates, where an "empty" entity is normal and a draft would become site-wide content) and `isEditedPostEmpty()` is true. It must never blank a post.
- **Title is never overwritten**: `isEditedPostEmpty()` is content-only — it ignores the title (Gutenberg `packages/editor/src/store/selectors.js`), so an "empty" post can still carry a title the user typed. The handler reads `getEditedPostAttribute( 'title' )` and writes the model's (trimmed) title only when the editor positively reports an empty one; otherwise it applies the body, skips the title, and reports `titleSkipped: true`. Do not weaken this to "the model will omit `title`".
- **Parsing is not a validation step**: `@wordpress/blocks` is externalized to the host's `wp.blocks`, whose `parse()` turns non-block text into freeform / `core/missing` blocks — it does not return `[]` and does not throw. Prose that isn't block markup is therefore applied as-is, which is fine because the post is empty by the guard above. The `length === 0` branch is defensive only; don't write tests that mock `parse` into rejecting, they assert a path production never takes.

## Context Provider

`contextProvider.getClientContext()` builds the context object sent to the orchestrator with each message. It includes:

- Current page URL/pathname
- Serialized block tree (`currentPageContent`)
- Selected block's `clientId` and resolved text content
- Environment identifier (`'gutenberg'`)
- Host feature verdicts the orchestrator gates server abilities on: `jetpackSEOSuggestionsEnabled`, `jetpackAiDraftAssistEnabled`

Changes here affect AI response quality. The orchestrator uses `selectedBlockClientId` to target block operations and `currentPageContent` for whole-page understanding.

**The feature-verdict keys are pinned cross-repo contracts — don't rename them, and always send `false` rather than omitting the key.** wpcom grants those abilities by ability category on every editor surface and has no view of this client's preview flags; its exclusions read these keys to decide whether the ability is usable here. Drop `jetpackAiDraftAssistEnabled` and production clients that never registered `handleApplyDraftContent` get the tool routed to them and answer "No handler found for tool".

## Checkpoint / Undo

`useCheckpoint` exposes a minimal subset of AM's `UseCheckpointReturn` interface — only `setCheckpoint` / `hasCheckpoint` / `restoreCheckpoint` are implemented; the Big Sky page/navigation stubs are no-ops. Snapshots capture only the fields the triggering picker writes (title by default, excerpt for the excerpt picker) and are stored in a module-level `postSnapshots` map keyed by checkpoint id (the tool call id), so the sync `handleShowComponent` callback and the async React restore path share state — and restoring one picker's checkpoint never clobbers another field's later edits.

## Suggestions

- **Empty view**: `getEmptyViewSuggestions()` returns static suggestions (currently just "Optimize Title")
- **Dynamic**: `useSuggestions()` returns block-type-aware suggestions:
  - Text blocks → translate, change tone, check grammar, simplify
  - Image blocks → generate alt text
  - No selection → optimize title
- Suggestions hide permanently once clicked (via `big-sky-inline-suggestion-click` event), then re-show on block selection change

## Cross-Bundle / iframe

The block editor may run inside an iframe (`editor-canvas`). `findBlockElement` checks both the main document and the iframe's `contentDocument`. The `clientId` is validated against `/^[0-9a-f-]+$/i` to prevent selector injection.

## Conventions

- **`any` types**: Used at WordPress API boundaries (`wp.data`, `wp.abilities`) where no upstream types exist. This is intentional — don't add `@ts-ignore` or overly specific types for untyped APIs.
- **`@wordpress/i18n`**: All user-facing strings use `__()` with the `__i18n_text_domain__` text domain placeholder, which the Agents Manager webpack `DefinePlugin` replaces with `'default'` at build time. Do not hardcode a literal domain like `'jetpack'`.
- **`@wordpress/components`**: Use for standard UI (Button, etc.).
- **Styling**: Component styles in `.scss` files alongside the component.
- **Tests must be TypeScript**: `.test.ts` / `.test.tsx`.

## Build & Test

```bash
yarn workspace @automattic/jetpack-ai-sidebar build      # Build ESM + CJS
yarn workspace @automattic/jetpack-ai-sidebar clean       # Clean dist/
yarn workspace @automattic/jetpack-ai-sidebar typecheck   # Type check
yarn workspace @automattic/jetpack-ai-sidebar lint        # Lint
```

The IIFE bundle actually served to widgets.wp.com is built from `apps/agents-manager` — rebuilding this package alone does NOT update the deployed asset. Use `yarn workspace @automattic/agents-manager-app dev` to rebuild + sync to a widgets sandbox.

Test files go alongside source: `foo.ts` → `foo.test.ts`.

**Coverage**: Unit tests exist in `src/index.test.ts` covering tool provider abilities, show-component handling, and checkpoint logic. Coverage is still partial — changes outside tested paths need manual testing in the Gutenberg editor with the AM sidebar enabled.

## PR Guidelines

- Reference Linear issue ID in title
- Before/after screenshots for UI changes (especially TitlePicker or shimmer effects)
- Test with both block selected and no block selected states

**Last updated**: 2026-07-28

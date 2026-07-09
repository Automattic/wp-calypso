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
| `useAbilitiesSetup`       | Captures AM's `addMessage`/`clearSuggestions` callbacks   |
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
- **Processing shimmer**: The block editing shimmer uses `Flow Block` font + CSS animations injected into the block's owning document (which may be an iframe). The `ensureProcessingStyles` function is idempotent — don't duplicate style injection.

## Tools

| Tool ID                      | Handler                     | UI Component           | Description                                              |
| ---------------------------- | --------------------------- | ---------------------- | -------------------------------------------------------- |
| `jetpack_ai__show_component` | `handleShowComponent`       | via `getChatComponent` | Renders Jetpack AI chat components                       |
| `big_sky__show_component`    | `handleLegacyShowComponent` | Jetpack or Big Sky     | Temporary migration support; delegates non-Jetpack types |
| `wpcom/update-block-content` | `handleUpdateBlockContent`  | _(chat text)_          | Updates block content with shimmer effect                |

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

Jetpack show-component messages currently set `hideZoomAction: true` so AM's zoom action button stays hidden for these chat components.

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

## Context Provider

`contextProvider.getClientContext()` builds the context object sent to the orchestrator with each message. It includes:

- Current page URL/pathname
- Serialized block tree (`currentPageContent`)
- Selected block's `clientId` and resolved text content
- Environment identifier (`'gutenberg'`)

Changes here affect AI response quality. The orchestrator uses `selectedBlockClientId` to target block operations and `currentPageContent` for whole-page understanding.

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
- **`@wordpress/i18n`**: All user-facing strings use `__()` with `'jetpack'` text domain.
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

**Last updated**: 2026-04-10

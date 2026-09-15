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
| `useCheckpoint`           | Block-edit snapshots for AM's native Undo action          |
| `getEmptyViewSuggestions` | Static suggestions shown before conversation starts       |
| `useSuggestions`          | Block-aware dynamic suggestions during conversation       |

All exports live in `src/index.ts`. This is intentionally a single-file provider — keep it that way unless the file exceeds ~800 lines.

## Critical Patterns (Don't Break These)

- **Module-level state**: `addMessageFn` and `clearSuggestionsFn` are captured once via their respective hooks. These are module singletons — do NOT move them into React state or a store.
- **Return-to-agent policy**: `handleUpdateBlockContent` returns `{ returnToAgent: false }` because the editor action completes locally. Picker calls return to the agent from AM's show-component callback, so the backend can record the originating ability as complete or recover from a component error.
- **Tool ID normalization**: AM normalizes tool IDs (`wpcom/update-block-content` → `wpcom__update_block_content`). The `isUpdateBlockContentTool` helper handles both forms. Any new tool must follow this pattern.
- **Components come from `getChatComponent`**: AM's converter resolves a picker's component by `data.type` through this export and renders it in place of the message text; the action bar (thumbs/Undo) attaches because the message keeps a text part. The sidebar never builds the picker message itself. See "Show-component pattern" below.
- **Role transformation**: AM's `useAbilitiesSetup` handler maps `role: 'assistant'` → `'agent'` and everything else → `'user'`. When injecting messages directly via `addMessageFn`, always use `'assistant'` — passing `'agent'` would make the message render as user content and get filtered out of the agent message list.
- **Processing shimmer**: Start request-time shimmer only for a contextual block-transformation suggestion with a known target block. Free-form requests fall back to the concrete `handleUpdateBlockContent` action after its target is resolved. Never use generic AM processing state by itself. The effect uses `Flow Block` font + CSS animations injected into the block's owning document (which may be an iframe).

## Tools

| Tool ID                      | Handler                    | UI Component  | Description                               |
| ---------------------------- | -------------------------- | ------------- | ----------------------------------------- |
| `wpcom/update-block-content` | `handleUpdateBlockContent` | _(chat text)_ | Updates block content with shimmer effect |

Show-component is not a sidebar tool. Agents Manager's `big-sky/show-component` ability executes every picker call, Jetpack's types included; the sidebar only maps each type to a component through `getChatComponent`.

### Show-component pattern

The wpcom ability returns an `Input_Required_Result` whose arguments are `{ type, props, followUpTasks, summary? }`. Today its `tool_id` is `jetpack_ai__show_component`, which AM owns through a transitional alias of `big-sky/show-component` (marked `TODO (ability-migration)` in AM). Once wpcom emits `big_sky__show_component` the alias goes.

AM's callback (`packages/agents-manager/src/abilities/show-component/callback.ts`):

1. Rejects empty props with a structured error the agent can recover from.
2. Snapshots the pre-pick state into AM's checkpoint engine under the tool call id — the post title for `title-picker`, the post excerpt for `excerpt-picker`. The other Jetpack types write nothing a checkpoint restores.
3. Returns `{ agentMessage: JSON.stringify( { tool_id: 'big_sky__show_component', tool_call_id, data: { type, props, summary, isCurrent, postId, responseTrackingProperties? } } ), result, returnToAgent: true }`. The message names the Big Sky id whichever ability name the server called.
4. AM's `convert-tool-messages-to-components` matches the tool id, calls `getChatComponent( data.type )`, and renders the component with `props`, `contentType`, `toolCallId`, `onResponseAction`, the `postId` the picker was shown on (a server-sent `props.postId` wins) and, for a stale row, `isMessageStale`.

The Undo button on picker messages arrives with AM-57, which keys the button off `tool_call_id` and AM's engine for every checkpointing ability at once. Undo through the agent ("undo that title change") works where the route grants `big-sky/restore-checkpoint`: the `wpcom-editor` route does (active when Big Sky's provider reports the `wp-admin` environment), the `jetpack-ai` route does not yet. AM advertises its checkpoints in the client context either way.

Props validation lives in the components: each picker filters unusable entries and renders nothing when none survive. The review cards resolve the post they belong to from the `postId` prop above.

`?am_abilities=0` hands migrated abilities back to provider copies. The sidebar ships none, so under the switch a Jetpack picker call reaches Big Sky's copy, which does not know these types. Test pickers without the switch.

### Adding a new component type

1. Add a case in `CHAT_COMPONENTS` mapping your `type` string to a React component.
2. Create the component under `src/components/` with a `scss` sibling. Validate its own props: they arrive from a tool payload.
3. Update the wpcom ability (or add a new one) to return the show-component result with `type: '<your-type>'` and `props: { ... }`.
4. If the component writes a post field, map the type to a checkpoint key in AM's show-component callback so the pick can be undone.

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

`useCheckpoint` exposes a minimal subset of AM's `UseCheckpointReturn` interface, for block edits only: `hasCheckpoint` / `restoreCheckpoint` / `canSwapCheckpoint` / `swapCheckpoint` / `clearCheckpoint` read the module-level `blockEditSnapshots` map that `handleUpdateBlockContentForChat` fills, keyed by tool call id. `setCheckpoint` and the Big Sky page/navigation methods are no-op stubs. Picker checkpoints live in AM's engine.

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

**Coverage**: Unit tests exist in `src/index.test.ts` covering tool provider abilities, the block-edit checkpoint logic, suggestions and the review components. Coverage is still partial — changes outside tested paths need manual testing in the Gutenberg editor with the AM sidebar enabled.

## PR Guidelines

- Reference Linear issue ID in title
- Before/after screenshots for UI changes (especially TitlePicker or shimmer effects)
- Test with both block selected and no block selected states

**Last updated**: 2026-09-14

# Jetpack AI Sidebar

Agents Manager (AM) provider for the Jetpack AI sidebar in Gutenberg. Bridges the WordPress block editor with the AM chat interface via tools, context, and suggestions.

## File Guide (Read the Right File)

| File                         | Purpose                                  | When to read                          |
| ---------------------------- | ---------------------------------------- | ------------------------------------- |
| **AGENTS.md** (this)         | Critical patterns, pitfalls, conventions | Always read first for any code change |
| [package.json](package.json) | Dependencies, build scripts              | When modifying deps or build config   |

## Architecture

This package exports the **AM provider contract** — a set of functions the Agents Manager calls to wire up a sidebar provider:

| Export                    | Role                                                        |
| ------------------------- | ----------------------------------------------------------- |
| `useAbilitiesSetup`       | Captures AM's `addMessage` callback; registers WP abilities |
| `toolProvider`            | Wraps `@wordpress/abilities` + Jetpack AI tool definitions  |
| `contextProvider`         | Sends Gutenberg editor state to the orchestrator            |
| `getChatComponent`        | Maps tool IDs → React components for in-chat rendering      |
| `getEmptyViewSuggestions` | Static suggestions shown before conversation starts         |
| `useSuggestions`          | Block-aware dynamic suggestions during conversation         |

All exports live in `src/index.ts`. This is intentionally a single-file provider — keep it that way unless the file exceeds ~800 lines.

## Critical Patterns (Don't Break These)

- **Module-level state**: `addMessageFn` and `clearSuggestionsFn` are captured once via `useAbilitiesSetup`. These are module singletons — do NOT move them into React state or a store.
- **`returnToAgent: false`**: Both tool handlers (`handleSelectTitle`, `handleUpdateBlockContent`) return `{ returnToAgent: false }`. This prevents the AM orchestrator from continuing automatically after the tool executes. Removing this breaks the UX flow.
- **Ability registration guard**: `isAbilityRegistered` prevents duplicate `@wordpress/abilities` registration. The guard is set _before_ the async `registerAbility` call to handle concurrent invocations. Don't move it after the await.
- **Tool ID normalization**: AM normalizes tool IDs (`wpcom/select-title` → `wpcom__select_title`). The `isSelectTitleTool` and `isUpdateBlockContentTool` helpers handle both forms. Any new tool must follow this pattern.
- **Processing shimmer**: The shimmer effect uses `Flow Block` font + CSS animations injected into the block's owning document (which may be an iframe). The `ensureProcessingStyles` function is idempotent — don't duplicate style injection.

## Tools

| Tool ID                      | Handler                    | UI Component  | Description                               |
| ---------------------------- | -------------------------- | ------------- | ----------------------------------------- |
| `wpcom/select-title`         | `handleSelectTitle`        | `TitlePicker` | Renders title suggestions in chat         |
| `wpcom/update-block-content` | `handleUpdateBlockContent` | _(chat text)_ | Updates block content with shimmer effect |

### Adding a New Tool

1. Define the tool ID and ability schema in `src/utils/tool-provider.ts`
2. Add an `is<ToolName>Tool` helper that matches both raw and normalized IDs
3. Add the handler function in `src/index.ts`
4. Register the ability in `toolProvider.getAbilities()` with a callback
5. Add a fallback case in `toolProvider.executeAbility()`
6. If the tool needs a chat component, add mapping in `getChatComponent()`

## Context Provider

`contextProvider.getClientContext()` builds the context object sent to the orchestrator with each message. It includes:

- Current page URL/pathname
- Serialized block tree (`currentPageContent`)
- Selected block's `clientId` and resolved text content
- Environment identifier (`'gutenberg'`)

Changes here affect AI response quality. The orchestrator uses `selectedBlockClientId` to target block operations and `currentPageContent` for whole-page understanding.

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

Test files go alongside source: `foo.ts` → `foo.test.ts`.

**Coverage**: This package currently has **0% test coverage**. All changes need manual testing in the Gutenberg editor with the AM sidebar enabled.

## PR Guidelines

- Reference Linear issue ID in title
- Before/after screenshots for UI changes (especially TitlePicker or shimmer effects)
- Test with both block selected and no block selected states

**Last updated**: 2026-03-22

# Interactive UI

The agent can show UI in the chat when it helps, such as buttons, forms and pickers, so people can
finish their request there. It uses A2UI v1.0.

Agents Manager owns this architecture, and its providers (such as the Jetpack AI sidebar and
WooCommerce AI) and other hosts (such as MCP apps) follow it. Ticket numbers mark parts still to
come.

## How it works

1. **wpcom builds a surface**, in one of two ways:
   - **An ability builds it in code**, for a known flow such as a picker or a hand-off button
     (AM-116). The agent only calls the ability, so the surface is reliable, cheap in tokens and
     testable.
   - **The agent composes it** with `wpcom/render-interactive-ui`, for one-off forms and choices
     from the basic components. The `a2ui-render-interactive-ui` blog sticker enables it.
2. Both return a `wpcom__render_interactive_ui` envelope of A2UI messages, stored with the
   conversation. An ability's envelope also names the page it built the surface for (`post_id`).
   Agents Manager also accepts a raw array of A2UI messages.
3. Once the reply has streamed, the host feeds those messages to the conversation's runtime, which
   shows each surface under its message. Reloading rebuilds the surfaces from history.
4. A button's event goes to the agent as a context message, `{ "version": "v1.0", "action": … }`,
   and its `functionCall` runs a catalog function in the browser. The surfaces are disabled while
   the agent replies, and the reply starts a new turn (`startsTurn`).

## Where the code lives

- **`@automattic/ai-ui-renderer`** renders surfaces for any host: the basic or shared components,
  `createInteractiveUiCatalog()`, `createInteractiveUiRuntime()`, `InteractiveUiSurface` and the
  styles. It has no chat, session or transport code. See its
  [README](../ai-ui-renderer/README.md).
- **Agents Manager** hosts them in the chat:
  - `src/hooks/use-interactive-ui.ts` keeps a runtime per conversation, loads the renderer on demand
    and sends actions to the agent.
  - `src/components/interactive-ui-surfaces/` renders a message's surfaces in the chat's colors
    and mode, greys out a stale one, and stacks the modal above the chat. Surfaces sit in a
    `data-agenttic-isolated` wrapper, so their controls keep their own typography while replies
    keep the chat's typography reset.
  - `src/utils/interactive-ui-messages.ts` and
    `src/utils/convert-interactive-ui-messages-to-components.ts` find surfaces in the transcript
    and which of them are stale.
  - `src/utils/interactive-ui-session.ts` keeps each conversation's session, through a new chat's
    bootstrap, and tells surfaces restored from history from new ones.
  - `src/utils/interactive-ui-catalogs.ts` builds the catalogs.
- **Custom components and functions** live in the project that owns them: Agents Manager's here
  (AM-117), and its providers' (WooCommerce AI, the Jetpack AI sidebar) in their own repos.
  Providers declare theirs in the provider contract's `interactiveUi` field (`LoadedProviders` in
  `src/utils/load-external-providers.ts`).

## Rules

- **Each surface names one catalog.** Surfaces the agent composes use A2UI's Basic catalog.
  Agents Manager's catalog, `AGENTS_MANAGER_CATALOG_ID`, adds its own and its providers'
  components and functions; abilities build their surfaces with it (AM-116).
- **wpcom owns the schemas.** It knows each catalog by ID and lets the agent use only the catalogs
  the client lists as `supportedCatalogIds` in its client context (AM-118). Other clients get text.
  In the browser, a surface can still use another catalog's components and functions, so
  functions treat their arguments as untrusted.
- **Owner-prefixed names.** Prefix non-basic components and functions with their owner
  (`AgentsManagerColorPicker`, `JetpackAiTitlePicker`, `agentsManagerOpenHelpCenter`). As with
  abilities, the first registration of a name wins: basic names, then providers in registration
  order. Agents Manager skips and logs a later duplicate.
- **Providers declare plain definitions** (`InteractiveUiComponentDefinition`,
  `InteractiveUiFunctionDefinition`) and import only types. Each `schema` builds with the
  renderer's `zod`, so it works from another bundle. Agents Manager passes chat state as props,
  such as `isMessageStale`, which a surface can't override.
- **Components own their side effects:** the change itself, its checkpoint and its Tracks events.
- **Agents Manager decides when a surface is stale**, with the rule `show-component` uses
  (`src/utils/stale-chat-ui.ts`): the user has replied past the last message that changed it, or
  the editor has another page open than the one its envelope names. Like a restored picker, a
  surface restored from history, in a past chat or after a reload, is stale too. A stale surface
  stays visible but greyed out and disabled, and its components skip their side effects and
  Tracks.
- **Style with A2UI's theme tokens.** Custom components color themselves with the `--a2ui-*`
  tokens, or use WordPress components, which the renderer themes with them, so they follow each
  host's theme ([theming](../ai-ui-renderer/README.md#theming)).
- **Load only what the surface renders.** Editor-only components load on demand, in the editor.

## Try it

Add the `a2ui-render-interactive-ui` blog sticker to a test site, then ask the agent for a small
form, such as "Use wpcom/render-interactive-ui for a feedback form with a TextField and a Submit
Button."

## Migrating a chat UI

This section is temporary: remove it once every chat UI has moved (AM-119).

- **A server ability returning `show-component`** (Agents Manager's color, font and button
  pickers, the Jetpack AI sidebar's components): the ability returns a surface with a catalog
  component wrapping the same React component.
- **A client button** (Agents Manager's Help Center button): a server ability returns a basic
  `Button` that calls a catalog function.
- **Markdown cards** (WooCommerce AI's `markdownComponents`): abilities return surfaces with
  display-only catalog components.

For each one, declare the component in your `interactiveUi`, switch its ability to return a
surface behind the migration sticker (AM-116), and keep old conversations readable. Rollout
(AM-118) waits for Agents Manager, the Jetpack AI sidebar and WooCommerce AI.

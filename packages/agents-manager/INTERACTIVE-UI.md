# Interactive UI

The agent can show UI in the chat when it helps, such as buttons, forms and pickers, so people can
finish their request there. It uses A2UI v0.9.

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
   conversation.
3. Once the reply has streamed, the host feeds those messages to the conversation's runtime, which
   shows each surface under its message. Reloading rebuilds the surfaces from history.
4. A button's action goes to the agent as a context message, `{ "version": "v0.9", "action": … }`.
   The surfaces are disabled while the agent replies.

## Where the code lives

- **`@automattic/ai-ui-renderer`** renders surfaces for any host: the basic components,
  `createInteractiveUiCatalog()`, `createInteractiveUiRuntime()`, `InteractiveUiSurface` and the
  styles. It has no chat, session or transport code. See its
  [README](../ai-ui-renderer/README.md).
- **Agents Manager** hosts them in the chat:
  - `src/hooks/use-interactive-ui.ts` keeps a runtime per conversation, loads the renderer on demand
    and sends actions to the agent.
  - `src/components/interactive-ui-surfaces/` renders a message's surfaces.
  - `src/utils/interactive-ui-messages.ts` and
    `src/utils/convert-interactive-ui-messages-to-components.ts` find surfaces in the transcript.
- **Providers** bring their own components and functions from their own packages (AM-116).

## Rules

- **Each surface names one catalog.** A host builds its catalog with `createInteractiveUiCatalog()`
  from the basic components plus its own and its providers'. Once it has its own components, the
  catalog gets its own versioned ID, next to A2UI's Basic catalog (AM-116).
- **wpcom owns the schemas.** It knows each catalog by ID and lets the agent use only the catalogs
  the client lists as `supportedCatalogIds` in its client context (AM-118). Other clients get text.
- **Owner-prefixed names.** Prefix non-basic components and functions with their owner
  (`AgentsManagerColorPicker`, `JetpackAiTitlePicker`, `agentsManagerOpenHelpCenter`). Duplicate
  names throw.
- **Providers export plain React components and their schemas** (AM-116). They ship in their own
  bundles, so the host wraps each one with the renderer it loaded and passes chat state as props.
- **Components own their side effects:** the change itself, its checkpoint and its Tracks events.
- **The host decides when a surface is stale** (AM-116), with the same rules as `show-component`,
  such as the user having replied past it, or the editor being on a different page from the one
  its envelope names. A stale surface stays visible but greyed out and disabled, and its
  components skip their side effects and Tracks.
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
  `Button` that calls a catalog function (AM-116).
- **Markdown cards** (WooCommerce AI's `markdownComponents`): abilities return surfaces with
  display-only catalog components.

For each one, export the component with its schema, switch its ability to return a surface behind
the migration sticker (AM-116), and keep old conversations readable. Rollout (AM-118) waits for
Agents Manager, the Jetpack AI sidebar and WooCommerce AI.

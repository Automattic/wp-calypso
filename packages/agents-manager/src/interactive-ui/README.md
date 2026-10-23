# Interactive UI

The agent can show UI in the chat when it helps, such as buttons, forms and pickers, so people can
finish their request there. It uses A2UI v1.0.

Agents Manager owns this architecture, and its providers (such as the Jetpack AI sidebar and
WooCommerce AI) and other hosts (such as MCP apps) follow it. Ticket numbers mark parts still to
come.

## How it works

1. **wpcom builds a surface** on sites with the `a2ui-render-interactive-ui` blog sticker, for a
   client that renders its catalog, in one of two ways:
   - **An ability builds it in code**, for a known flow such as a picker or a hand-off button
     (AM-117). The agent only calls the ability, so the surface is reliable, cheap in tokens and
     testable.
   - **The agent composes it** with `wpcom/render-interactive-ui`, for one-off forms and choices
     from the basic components, or the components of the catalogs the client lists.
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
  styles, plus a light `capabilities` entry hosts use before loading it. It has no chat, session or
  transport code. See its [README](../../../ai-ui-renderer/README.md).
- **Agents Manager** hosts them in the chat, from this folder:
  - `use-interactive-ui.ts` keeps a runtime per conversation, loads the renderer on demand and
    sends actions to the agent.
  - `surfaces/` renders a message's surfaces in the chat's colors and mode (its `style.scss` sets
    A2UI's tokens from Agenttic's), disables a stale one, and stacks the modal above the chat.
    Surfaces sit in a `data-agenttic-isolated` wrapper, so their controls keep their own typography
    while replies keep the chat's typography reset.
  - `messages.ts` and `convert-messages-to-components.ts` find surfaces in the transcript and which
    of them are stale.
  - `session.ts` keeps each conversation's session, through a new chat's bootstrap, and tells
    surfaces restored from history from new ones.
  - `catalogs.ts` builds the catalogs, and the renderer capabilities each message sends.
  - `with-chat-response-tracking.tsx` records the shared response events for each catalog
    component.
- **Custom components and functions** live in the project that owns them: Agents Manager's here
  (AM-117), and its providers' (WooCommerce AI, the Jetpack AI sidebar) in their own repos.
  Providers declare their catalog in the provider contract's `interactiveUi` field
  (`LoadedProviders` in `src/utils/load-external-providers.ts`).

## Rules

- **One catalog per owner.** Agents Manager, WooCommerce AI and the Jetpack AI sidebar each
  declare one catalog: an A2UI catalog document and the code that implements it
  ([how](../../../ai-ui-renderer/README.md#catalogs)). Each catalog includes the basic components.
  A surface's default catalog is Agents Manager's (`AGENTS_MANAGER_CATALOG_ID`) when an ability
  builds it with wpcom's helpers, and A2UI's Basic catalog when the agent composes it. A component
  from another catalog, such as a provider's, names its own as its `catalogId`. Conversations store
  surfaces, so change a catalog only in ways that keep old surfaces rendering.
- **Portable schemas.** wpcom sends your components' props to whichever model provider runs the
  chat, so use only JSON Schema they all accept:
  - `type`, `properties`, `required`, `items`, `enum`, `additionalProperties`, `anyOf`, `oneOf`,
    `title`, `description`, `pattern`, `minimum`, `maximum`, `minLength`, `maxLength`, `minItems`
    and `maxItems`;
  - `$ref`s to A2UI's shared types, such as `DynamicString` and `Action`.

  wpcom leaves out a component that uses anything else, such as another `$ref` or an empty object,
  one named like a basic component or an earlier catalog's, and one past the 64 KB the client's
  components share.

- **Instructions guide the agent.** Your catalog's `instructions` tell the agent how to use your
  components, and which only your abilities build, as Agents Manager's say of its pickers.
- **Basic components first.** Build a surface from the basic components when they can express it,
  and add a custom component only for what they can't, such as a picker's style previews. Basic
  components need no catalog change, render in every host, and the agent can compose them.
- **Surfaces come from wpcom**, which stores them with the conversation. A browser ability's
  `agentMessage` only shows live: it isn't stored, and the stream can drop it. So a browser ability
  that needs UI moves it to a server ability, or the agent composes it.
- **The client lists what it renders.** Agents Manager sends A2UI's `a2uiRendererCapabilities` in
  each message's metadata, as A2UI's A2A binding does: the IDs of the catalogs it renders, and
  their documents. It checks each provider's catalog first, and skips and logs an invalid one or a
  later one with a taken ID, so the others keep working. wpcom offers a surface only for a catalog
  the client lists, and lists their components in the agent's tool, each with its catalog's
  instructions. The documents come from the browser, so wpcom only describes and validates with
  them.
- **Surfaces follow A2UI v1.0.** Component IDs are identifiers (letters, digits and underscores),
  each component has one parent (a Modal renders its trigger, so it isn't also placed in a layout),
  bindings are `{"@path": "/field"}` and function calls `{"@call": "name"}`. A2UI rejects a surface
  with any other ID or with a cycle, and Agents Manager then shows nothing and logs
  `[AgentsManager] Failed to apply an interactive UI message`. A component with two parents renders
  twice, and `{"path": …}` is read as plain data. `wpcom/render-interactive-ui` checks all of these
  so the agent can retry, and abilities that build surfaces with `Interactive_UI::surface_result()`
  follow them too.
- **Owner-prefixed names.** Names are scoped by catalog, but prefix yours with your owner, such as
  `ExampleCard` and `exampleOpenItem` for an owner named Example, so the agent can tell catalogs
  apart.
- **Functions run from a click.** A2UI runs a catalog's functions only from a click, never from a
  value, unless its document sets `requiresUserActivation: false` for one without side effects.
  Every function treats its arguments as untrusted.
- **Custom components own their side effects**: the change itself, its checkpoint, keyed by
  `surfaceId`, and its own Tracks events. They turn off their controls with `disabled`, and skip
  their side effects and Tracks with `isMessageStale`, chat state a surface can't override. As for
  `show-component` messages, Agents Manager records `jetpack_big_sky_chat_response_rendered` for
  each one on a current surface, and the actions it reports through `onResponseAction`
  (`jetpack_big_sky_chat_response_action`), with its name as `component_type` and its surface ID
  as `tool_call_id`.
- **Agents Manager decides when a surface is stale**, with the rule `show-component` uses
  (`src/utils/stale-chat-ui.ts`): the user has replied past the last message that changed it, or
  the editor has another page open than the one its envelope names. Like a restored picker, a
  surface restored from history, in a past chat or after a reload, is stale too. A stale surface
  stays visible and disabled: its controls look disabled, while display-only content such as text
  or a chart looks as before. Once all of a message's surfaces are stale, its actions, such as
  feedback, are disabled too.
- **Style with A2UI's theme tokens.** Custom components color themselves with the `--a2ui-*`
  tokens, or use WordPress components, which the renderer themes with them, so they follow each
  host's theme ([theming](../../../ai-ui-renderer/README.md#theming)).
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
- **Markdown cards** (WooCommerce AI's `markdownComponents`): its abilities run in the browser, so
  the agent composes surfaces with its catalog's components instead. A card keeps its side effects,
  such as the batch plan's confirm and undo, and shows under the reply rather than within its text.

Rollout (AM-118) waits for Agents Manager, the Jetpack AI sidebar and WooCommerce AI.

### Moving an ability's component

1. **Declare the component in your catalog.** Add its props to your catalog document as portable
   JSON Schema, and map its name to the existing React component in your `interactiveUi`. It keeps
   its side effects, and skips them when `isMessageStale` is set. One with editor code still loads
   on demand.
2. **Return a surface from the ability** (wpcom). When `Agent_Ability::can_show_interactive_ui()`
   passes, return `Interactive_UI::component_result()` for one component, or
   `Interactive_UI::surface_result()` for a whole surface, with its data model and, when it acts on
   a post, `post_id`. Otherwise, keep returning the `show-component` result. Both helpers build on
   Agents Manager's catalog, which the gate checks, so a component from your own catalog names it
   as its `catalogId`, and the ability also checks that catalog with
   `Interactive_UI::is_enabled( $context, $catalog_id )`.
3. **Test both paths.** With the sticker, the surface renders, goes stale after a reply, a reload
   or a page switch, and keeps its undo and Tracks events. Without it, the old UI shows as before.

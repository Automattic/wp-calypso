# Interactive UI

Interactive UI lets the agent show UI in the chat, such as buttons, forms and pickers, so people can
finish their request there. It's built on [A2UI v1.0](https://a2ui.org).

- **Who follows it:** Agents Manager owns this architecture. Its providers, such as the Jetpack AI
  sidebar and WooCommerce AI, and other hosts, such as MCP apps, follow it.
- **Where it runs:** on sites with the `a2ui-render-interactive-ui` blog sticker, in clients that
  render the surface's catalog. Elsewhere, the chat keeps its older UI.
- **What's shared:** the [renderer](../../../ai-ui-renderer/README.md) is a shared library with the
  basic components. Custom components live in the project that owns them.

Ticket numbers mark parts still to come.

## How it works

1. **wpcom builds a surface** for a client that renders its catalog, in one of three ways:
   - **An ability builds it in code**, for a known flow such as a picker or a hand-off button
     (AM-117). The agent only calls the ability, so the surface is reliable, cheap in tokens and
     testable.
   - **A browser ability asks for a card** with an `__interactive_ui` hint in its result, for a
     known flow that runs in the page. wpcom builds the card and shows it under the reply that ends
     the turn.
   - **The agent composes it** with `wpcom/render-interactive-ui`, for one-off forms and choices
     from the basic components, or the components of the catalogs the client sends it.
2. All three send A2UI's A2A data part, with the `application/a2ui+json` MIME type, beside the
   reply's text, which may be empty. An ability's part names the post its surface acts on, if any
   (`metadata.postId`). wpcom stores the part with the reply, and Agenttic keeps it under `a2ui`
   and sends it back in the history, so the agent can update the surface.
3. Once the reply has streamed, the host feeds those messages to the conversation's runtime, which
   shows each surface under its message. Reloading rebuilds the surfaces from history.
4. A button's event goes to the agent as a context message, `{ "version": "v1.0", "action": … }`,
   and its `functionCall` runs a catalog function in the browser. Only surfaces that abilities
   build can call one: the agent composes `event` actions only, so don't tell it to call your
   functions in your catalog's `instructions`. While the agent replies or images upload, the
   surfaces' inputs and actions are disabled, without the surfaces going stale. The context message
   is hidden, so the chat shows the event's `userMessage`, if any, as a note instead
   ([An action shows what the user chose](#what-agents-manager-does)).

## Where the code lives

- **`@automattic/ai-ui-renderer`** renders surfaces for any host: the basic or shared components,
  `createInteractiveUiCatalog()`, `createInteractiveUiRuntime()`, `InteractiveUiSurface` and the
  styles, plus a light `capabilities` entry hosts use before loading it. It has no chat, session or
  transport code. See its [README](../../../ai-ui-renderer/README.md).
- **Agents Manager** hosts them in the chat, from this folder:
  - `use-interactive-ui.ts` keeps a runtime per conversation, loads the renderer and its styles on
    demand and sends actions to the agent.
  - `surfaces/` renders a message's surfaces in the chat's colors and mode (its `style.scss` sets
    A2UI's tokens from Agenttic's), disables one while it's stale or the chat is busy, shows a
    notice for one that can't be shown, and stacks the modal above the chat.
    Surfaces sit in a `data-agenttic-isolated` wrapper, so their controls keep their own typography
    while replies keep the chat's typography reset.
  - `action-note/` shows an action's `userMessage` in the transcript.
  - `messages.ts` and `convert-messages-to-components.ts` find surfaces in the transcript, from
    each message's `a2ui` part, work out which are stale or rejected, and show the actions, whose
    messages are hidden.
  - `session.ts` keeps each conversation's session, through a new chat's bootstrap, tells
    surfaces restored from history from new ones, holds the session the chat shows, and reads its
    surfaces' data each message sends.
  - `catalogs.ts` builds the catalogs, and the renderer capabilities each message sends.
  - `tracks.ts` records surfaces and their actions in Tracks, and reports the renderer's errors.
  - `with-chat-response-tracking.tsx` records the shared response events for each catalog
    component.
- **Custom components and functions** live in the project that owns them: Agents Manager's in this
  package, such as its color, font and button pickers (declared in `AGENTS_MANAGER_CATALOG` in
  `catalogs.ts`), and its providers' in theirs: WooCommerce AI's repo, or
  `packages/jetpack-ai-sidebar` for the Jetpack AI sidebar, whose server abilities are in wpcom.
  Providers declare their catalog in the provider contract's `interactiveUi` field
  (`LoadedProviders` in `src/utils/load-external-providers.ts`), an
  `InteractiveUiCatalogDefinition`. A Calypso package imports that type from
  `@automattic/ai-ui-renderer` (a `workspace:^` devDependency plus a tsconfig reference) with
  `import type` only, so it doesn't bundle the renderer. The Jetpack AI sidebar's bundle lists its
  exports by hand, so add `interactiveUi` there too
  ([how](../../../../apps/agents-manager/AGENTS.md#pitfalls)).

## Rules

- **One catalog per owner.** Agents Manager, WooCommerce AI and the Jetpack AI sidebar each
  declare one catalog: an A2UI catalog document and the code that implements it
  ([how](../../../ai-ui-renderer/README.md#catalogs)). Each catalog includes the basic components.
  A surface's default catalog is the ability's when an ability builds it with wpcom's helpers
  (Agents Manager's, `AGENTS_MANAGER_CATALOG_ID`, unless it passes its own), the hinted component's
  for a browser ability's card, and A2UI's Basic catalog when the agent composes it, where a
  provider's component names its own catalog as its `catalogId`. Conversations store surfaces, so
  change a catalog only in ways that keep old surfaces rendering.
- **Owner-prefixed names.** Prefix your component and function names with your owner, such as
  `ExampleCard` and `exampleOpenItem` for an owner named Example. The agent's tool lists every
  composable catalog's components together, so wpcom leaves out one named like a basic component or
  an earlier catalog's.
- **Ability-only catalogs aren't sent to the agent.** Set `agentComposable: false` on a catalog
  definition whose components only your abilities build, such as Agents Manager's pickers, whose
  style variations the agent can't make up. The client still lists its ID, so abilities can show
  it, but not its document, so the agent can't compose with it. The flag covers the whole catalog,
  so if only some of your components are ability-only, leave it composable and say which in its
  `instructions`, which tell the agent how to use your components.
- **Portable schemas.** wpcom sends your components' props to whichever model provider runs the
  chat, so use only JSON Schema they all accept:
  - `type`, `properties`, `required`, `items`, `enum`, `additionalProperties`, `anyOf`, `oneOf`,
    `title`, `description`, `pattern`, `minimum`, `maximum`, `minLength`, `maxLength`, `minItems`
    and `maxItems`;
  - `$ref`s to A2UI's shared types, such as `DynamicString`, `Action` and `CheckRule`.

  wpcom leaves out a component that uses anything else, such as another `$ref` or an empty object,
  and one past the 64 KB the client's components share.

- **Basic components first.** Build a surface from the basic components when they can express it,
  and add a custom component only for what they can't, such as a picker's style previews. Basic
  components need no catalog change, render in every host, and the agent can compose them.
- **Surfaces come from wpcom**, which stores them with the conversation. A browser ability's
  `agentMessage` only shows live: it isn't stored, and the stream can drop it. So a browser ability
  that needs UI returns a card hint ([Browser ability cards](#browser-ability-cards)).
- **Surfaces follow A2UI v1.0.** Component IDs are identifiers (letters, digits and underscores),
  each component has one parent (a Modal renders its trigger, so it isn't also placed in a layout),
  bindings are `{"@path": "/field"}` and function calls `{"@call": "name"}`. A2UI rejects a surface
  with any other ID or with a cycle, and Agents Manager then shows a notice instead. A component
  with two parents renders twice, and `{"path": …}` is read as plain data.
  `wpcom/render-interactive-ui` checks these so the agent can retry. `component_result()` builds
  valid IDs, but `surface_result()` takes your components as they are, so follow these rules in
  them. wpcom also gives every new surface its own ID (`<name>-<uuid>`), and a rejected message
  can't change an earlier surface: the runtime skips the rest of its batch for that surface.
- **Functions run from a click.** A2UI runs a catalog's functions only from a click, never from a
  value or a check, unless its document sets `requiresUserActivation: false` for one without side
  effects.
  Every function treats its arguments as untrusted.
- **Custom components own their side effects**: the change itself, its checkpoint, keyed by
  `surfaceId`, and its own Tracks events. A checkpoint in Agents Manager's store, as its pickers
  take, is undone by the agent through `restore-checkpoint`: a surface message has no message
  Undo, which a `show-component` result gets from its `calypsoCheckpointId`. The components turn
  off their inputs and actions with `disabled`, keeping their display parts usable, and skip their
  side effects and Tracks with `isMessageStale`, chat state a surface can't override. As for
  `show-component` messages, Agents Manager records `jetpack_big_sky_chat_response_rendered` for
  each one on a current surface, and the actions it reports through `onResponseAction`
  (`jetpack_big_sky_chat_response_action`), with its name as `component_type` and its surface ID
  as `tool_call_id`.
- **Style with A2UI's theme tokens.** Custom components color themselves with the `--a2ui-*`
  tokens and the renderer's disabled colors, or use WordPress components, which the renderer themes
  with them, so they follow each host's theme
  ([theming](../../../ai-ui-renderer/README.md#theming)). Check them in light and dark mode,
  enabled and disabled ([how](../../../ai-ui-renderer/README.md#theming-a-new-component)).
- **Load only what the surface renders.** Editor-only components load on demand, in the editor.
  Retry a failed import inside the `lazy()` loader, after a short pause, since `lazy()` caches a
  rejected one, and add no error boundary of your own, so a failure still shows the notice and is
  reported. Agents Manager's own components use `lazyWithRetry()` (`src/utils/lazy-component.ts`).

## What Agents Manager does

- **The client lists what it renders.** Agents Manager sends A2UI's `a2uiRendererCapabilities` in
  each message's metadata, as A2UI's A2A binding does: the IDs of the catalogs it renders, and the
  documents of those the agent can compose with. It checks each provider's catalog first, and
  skips and logs an invalid one or a later one with a taken ID, so the others keep working. wpcom
  offers a surface only for a catalog the client lists, and lists the documents' components in the
  agent's tool, each with its catalog's instructions. The documents come from the browser, so
  wpcom only describes and validates with them.
- **Agents Manager decides when a surface is stale**, with the rule `show-component` uses
  (`src/utils/stale-chat-ui.ts`): the user has replied past the last message that changed it, or
  the editor has another post open than the one its part names. Like a restored picker, a
  surface restored from history, in a past chat or after a reload, is stale too. A stale surface
  stays visible, its inputs and actions disabled as while the agent replies, and its display, tabs
  and modal triggers usable. Only staleness sets `isMessageStale` and leaves the surface's data
  out of the next message. Once all of a message's surfaces are stale, its actions that change
  something, such as feedback, are disabled too, while copy stays usable.
- **An action shows what the user chose.** Agents Manager shows an event's `userMessage`, such as
  “Save the title”, as a note on the user's side before the agent's reply: the user's bubble,
  outlined instead of filled, after its own prefix, “You chose:”, so it never reads as text the user
  typed. Only the note is shown: the action's message stays hidden context, so it doesn't count as
  the user's reply for staleness, checkpoints or the latest user message, and the note has no
  actions, such as copy. Without a `userMessage`, the reply starts the turn and nothing shows, as
  Agents Manager doesn't make one from the button's label, so `wpcom/render-interactive-ui` asks the
  agent to always include one, and an ability gives each of its `event` Buttons one, both in the
  user's language to match the translated prefix.
- **Surfaces can send their data.** A surface whose `createSurface` sets `sendDataModel` sends its
  data model with the user's next message, as A2UI's `a2uiRendererDataModel` in the message's
  metadata, so the agent sees what the user entered even when they type "save that" instead of
  clicking. wpcom sets it on composed surfaces created with inputs, and an ability sets it through
  `surface_result()`'s `$send_data_model`. Agents Manager sends only the surfaces the user could
  use just before sending, those that weren't stale then; a regenerated prompt sends the same ones,
  except those the regenerated reply created or changed. It leaves out the values obscured
  `TextField`s bind to. wpcom shows the data to the agent as the user's, for that request only, and
  never stores it. Bind inputs to the data model: a value a component keeps in its own state isn't
  sent.
- **Failures show a notice.** In a live reply, Agents Manager shows “Couldn’t show this. Try asking
  again.” in muted text in place of the first surface that can't render (one with a component its
  catalog lacks, or one that throws), or under the message when the runtime rejected some of its
  A2UI messages, even if no surface is left. A message shows only one notice. A surface restored
  from history that can't be shown, for example on a host without its catalog, or when its
  `createSurface` is outside the loaded history, stays hidden. If the renderer itself fails to load,
  every message with surfaces, restored ones included, shows “Couldn’t load this. Check your
  connection.” and a Try again button instead. Agents Manager logs each error the renderer reports,
  as `[AgentsManager] Interactive UI error:`. The agent isn't told, so it assumes the user saw the
  surface.
- **Surfaces are recorded.** Agents Manager records `calypso_agents_manager_interactive_ui_rendered`
  for each surface a live reply shows, once its root component arrives, even if it then fails to
  render; `calypso_agents_manager_interactive_ui_action` for each action a surface sends the agent,
  after the credits and upload checks; and `calypso_agents_manager_interactive_ui_error` for each
  error, with its code as `error_code`. Each carries the turn's `turn_id`, so a click pairs with its
  reply, and the surface's `surface_id` and its default catalog as `catalog_id`, which tells an
  ability's surfaces from the agent's (for an error, when the runtime has its surface). `_rendered`
  and `_action` also carry the `component_type` of the root component or of the one that sent the
  action. An error's message and an action's name and context can carry the agent's content or the
  user's input, so they aren't recorded. Each surface is recorded once per conversation and each
  error once per message, neither for a message restored from history. A surface built only from
  basic components records only these, and a catalog component also records the shared response
  events ([Custom components own their side effects](#rules)).

## Browser ability cards

A browser ability's result can carry a card hint, which wpcom turns into a surface under the reply
that ends the turn. A card is one component with literal props, so a layout needs a custom
component: declare it in your catalog first, following the [custom component rules](#rules) and
the renderer's [catalogs](../../../ai-ui-renderer/README.md#catalogs). A single basic component,
such as `Image`, needs no declaration: name it under your own catalog's ID, which includes the
basic components.

```ts
// A client ability's callback:
return {
	result: {
		success: true,
		message,
		__interactive_ui: {
			catalogId: 'urn:automattic:example:interactive-ui:v1',
			component: 'ExampleCard',
			props: { title: item.title },
		},
	},
	returnToAgent: true,
};
```

- **The hint:** one `__interactive_ui` inside `result` of a `{ result, returnToAgent }` output, or
  at the top level of a raw output, with `props` as literal values the component's schema accepts:
  IDs and a few display fields, so the component loads what has to stay live. wpcom sets the
  component's `id` and `component` and drops `catalogId`, so give an item's ID another name, such
  as `product_id`. Leave it out when the outcome has no card.
- **Where to add it:** in a client ability's callback, or, for an ability the Abilities API
  validates (`executeAbility()` from `@wordpress/abilities`, or one registered on the server, as
  WooCommerce AI's are), in the provider's `toolProvider.executeAbility()` after it returns, at the
  top level of its raw output. The agent then sees the same shape, other clients of the ability
  never see the hint, and its schema stays as it is. If you add it before that validation and the
  schema of the output or its `result` sets `additionalProperties: false`, list
  `__interactive_ui: { type: 'object' }` there, or the result fails validation after its side
  effect, and the agent may retry and repeat it.
- **When it shows:** wpcom builds the card and notes `card_shown` in the hint's place. It doesn't
  check `props` against the component's schema, so props the component rejects, such as one it
  doesn't declare, still note `card_shown` but show the failure notice.
- **When it doesn't:** without the sticker, in a client without your catalog, or for a result the
  content filter blocks, wpcom strips the hint without the note, and an older wpcom, or an agent
  other than wp-orchestrator, passes it on unread. It also strips a hint that isn't that shape or is
  over 8 KB as JSON, and tags the trace `invalid_interactive_ui_hint`. A result with
  `returnToAgent: false` never reaches wpcom, so it gets no card. A hinted result whose turn then
  ends on a later ability's `returnToAgent: false` loses its card but still notes `card_shown`, so
  don't hint a result whose turn usually ends that way.
- **Your instructions** keep the text or fenced card unless the result carries `card_shown`.
- **One card a result:** don't hint a batch plan, a `PROPOSAL_TOOL_IDS` result with an
  `operation_uuid`, since wpcom places its card and it would show twice. Their other results, such
  as drafts, can carry a hint.

## Try it

Add the `a2ui-render-interactive-ui` blog sticker to a test site, then ask the agent for a small
form, such as "Use wpcom/render-interactive-ui for a feedback form with a TextField and a Submit
Button."

If the old UI shows, the gate fell back: check that the site has the sticker and that the chat
request's `metadata.a2uiRendererCapabilities['v1.0'].supportedCatalogIds` lists exactly the
catalog ID your ability checks or your card hint names. If it's missing, look in the console for
`[AgentsManager] Skipped an interactive UI catalog:`, or your provider doesn't export
`interactiveUi` ([Jetpack AI sidebar](../../../../apps/agents-manager/AGENTS.md#pitfalls)).

## Migrating a chat UI

This section is temporary: remove it once every chat UI has moved (AM-119). Rollout (AM-118)
waits for Agents Manager, the Jetpack AI sidebar and WooCommerce AI.

- **A server ability returning `show-component`** (the Jetpack AI sidebar's components): the
  ability returns a surface with a catalog component wrapping the same React component, as
  Agents Manager's color, font and button pickers already do.
- **A client button** (Agents Manager's Help Center button): a server ability returns a basic
  `Button` that calls a catalog function.
- **Markdown cards** (WooCommerce AI's `markdownComponents`): its abilities run in the browser, so
  they return a card hint for its catalog's component instead
  ([Moving a browser ability's card](#moving-a-browser-abilitys-card)). A card keeps its side
  effects, such as an undo, and shows under the reply rather than within its text. The batch plan
  keeps wpcom's own card (`PROPOSAL_TOOL_IDS`) until that code is retired.

### Moving an ability's component

These steps work for any owner, such as Agents Manager, the Jetpack AI sidebar or WooCommerce AI.
Agents Manager's pickers are a worked example: `AGENTS_MANAGER_CATALOG` in `catalogs.ts`, and
wpcom's `ability.color-palette.php`. If the basic components can express the UI, skip step 1 and
return them with `surface_result()`.

1. **Declare the component in your catalog** (your provider's `interactiveUi`, or Agents Manager's
   own): its props as portable JSON Schema in the document, and its name mapped to the existing
   React component. It then gets a surface component's props
   ([props](../../../ai-ui-renderer/README.md#catalogs)), not `show-component`'s: its ID is
   `surfaceId` in place of `toolCallId`, and it gets no `summary` or `contentType`, since
   `component_result()` shows the summary above it. It keeps its side effects, skips them when
   `isMessageStale` is set, and loads on demand if it carries editor code. It follows the [custom
   component rules](#rules). If only your abilities build your catalog's components, set
   `agentComposable: false` on its definition. If your component's undo is the message Undo (a
   provider `useCheckpoint` checkpoint, as the Jetpack AI sidebar's pickers use), or its result
   sets `responseTrackingProperties` (such as the Jetpack AI sidebar's review counts), keep
   returning `show-component` for it: surfaces don't support either yet.
2. **Return a surface from the ability** (wpcom) when `Agent_Ability::can_show_interactive_ui()`
   passes: in an agent's chat whose client renders the component's catalog, on a site with the
   sticker. Otherwise, keep returning the `show-component` result.
   - **Helpers:** `Interactive_UI::component_result()` shows one component under the agent's
     summary, or a generic prompt to choose when there's none. `surface_result()` takes a layout of
     your own, with its data model, which `$send_data_model` sends back with the user's next message
     when they can edit it.
   - **Post:** pass either helper the post the UI acts on (`$post_id`), as `show-component` results
     carry `postId`, so it goes stale while the editor has another post open. Site-wide UI, such as
     the style pickers, passes none.
   - **Steps:** a surface ends the turn, even when steps remain (`followUpTasks`). For such a
     request, pass `component_result()`'s `$has_next_step`: the surface then asks the user to say
     when they're ready for the next step, and the agent continues once they do.
   - **Your own catalog:** the gate and both helpers take Agents Manager's catalog by default, so
     pass yours to each, such as `can_show_interactive_ui( catalog_id: self::CATALOG_ID )` and
     `component_result( …, catalog_id: self::CATALOG_ID )`. The surface is then built on it.
   - **History:** the model's history keeps a surface's components and props, but a custom
     component drops its list props, such as a picker's style variations
     (`Interactive_UI::text_for_model()`). Put what the agent needs to remember in the summary or a
     prop that isn't a list.
   - **Order:** deploy it once step 1 has reached every client, through Agents Manager's release
     for its own components and the Jetpack AI sidebar's (it builds that sidebar's bundle). A client
     without the component still lists the catalog's ID, so it would get the surface and show only
     the failed-surface notice.
3. **Test both paths.** With the sticker, the surface renders (also for a request with a step after
   it), goes stale after a reply, a reload or, if it acts on a post, a post switch, can still be
   undone (through `restore-checkpoint` for a checkpoint in Agents Manager's store), and records
   the shared response events under its component's name and surface ID. Without it, the old UI
   shows as before.

### Moving a browser ability's card

For a card a browser ability's result renders today, such as a fenced Markdown card:

1. **Declare the card in your catalog** (your provider's `interactiveUi`), as step 1 above: its
   props as portable JSON Schema, and its name mapped to a component that wraps the existing card.
   Skip its render tracking when `isMessageStale` is set, so a past chat doesn't record it again.
2. **Export the catalog** from your provider module as `interactiveUi`
   ([Try it](#try-it) covers a catalog that doesn't show up).
3. **Add the hint** in `toolProvider.executeAbility()`, after the ability returns, to the results
   that have a card: `__interactive_ui` with your catalog's ID, the component and the card's fields
   as `props` ([Browser ability cards](#browser-ability-cards)).
4. **Keep the fallback:** change the ability's instructions to write the fenced card unless the
   result carries `card_shown`, and keep your fence renderer, so sites without the sticker, older
   clients and past chats still show the card.
5. **Test both paths.** With the sticker, the card shows under the reply and the reply has no fenced
   block. Without it, the fenced card shows as before.

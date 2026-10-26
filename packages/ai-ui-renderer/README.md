# AI UI Renderer

`@automattic/ai-ui-renderer` is a shared component library that renders
[A2UI v1.0](https://a2ui.org) surfaces with WordPress components.

- **What's here:** the Basic catalog's components, the runtime, `InteractiveUiSurface` and the
  styles, which every host shares.
- **What isn't:** custom components. Put one in your own project, in your own catalog
  ([Catalogs](#catalogs)), not here. Chat, session, transport and error handling stay in the host.
- **How hosts use it:** see the
  [interactive UI architecture](../agents-manager/src/interactive-ui/README.md).

## Basic components

`Text`, `TextField`, `Button`, `Column`, `Image`, `Icon`, `Row`, `List`, `Card`, `Divider`,
`CheckBox`, `ChoicePicker`, `DateTimeInput`, `Video`, `AudioPlayer`, `Tabs`, `Modal` and
`Slider`.

- Buttons send an `event` to the agent, or call a catalog function with `functionCall`. To submit
  edits, bind the inputs and the action's context to the same data paths. The agent gets the
  event's `name` and `context`, so name it for what it does, such as `save_title`, and put in its
  context what acting on it needs, such as the item's ID.
- Values, such as a `Text`'s `text`, take a literal or a `{"@path": …}` binding, never a
  `{"@call": …}` as A2UI's Basic catalog allows: only actions and checks call functions. So send
  display text ready to show: formatted, such as a date or a price, and in the person's language.
- A modal's `Button` trigger opens it instead of sending its action, and stays usable on a
  disabled surface. Its title, which also names the dialog, is its `accessibility.label`, or
  "Details". Its inputs share the surface's data model and are disabled with it. Its own
  buttons send their actions and leave it open; only the person closes it.
- Text fields keep their values as strings, choice pickers as string arrays, and date/time inputs
  as local ISO strings.
- `Button`, `TextField`, `CheckBox`, `ChoicePicker`, `Slider` and `DateTimeInput` take A2UI's
  `checks`. A button is disabled while any of its own checks fails, with their messages as its
  accessible description, and a field shows its first failed check once it's touched (when the
  person leaves a text or date field, or changes a check box, a choice or a slider) or once the
  person clicks a disabled button whose checks fail, which also moves focus to the surface's first
  invalid field outside a hidden tab. A check of a path with no value runs on it as empty:
  `required`, `email` and `numeric` fail, and `length` and `regex` check an empty string. One that
  can't run, such as `numeric` given a text field's string, also fails and is reported through
  `onError`. A failed check shows its own `message`, never the English one A2UI's validation
  functions return, so give every check a `message` in the person's language that names the field
  and says what to enter, as a button reads all of its failing messages together: one without shows
  A2UI's generic English "Validation failed".
- An `Image`'s `description` is its alt text, so one without it is decorative. An `AudioPlayer`'s
  shows above the player and names it.
- Components ignore A2UI v1.0 properties they don't support, such as `weight` and the
  `accessibility` of components other than `Modal`, instead of rejecting the surface.

## Catalogs

A host or provider with its own components and functions declares one catalog: an
[A2UI v1.0 catalog document](https://a2ui.org/specification/v1_0/catalog_definition.json) and the
code that implements it.

```ts
const exampleCatalog: InteractiveUiCatalogDefinition = {
	catalog: {
		catalogId: 'urn:automattic:example:interactive-ui:v1',
		instructions: 'Show only items from earlier tool results.',
		components: {
			ExampleCard: {
				type: 'object',
				description: 'One item, with a button to open it.',
				properties: {
					title: { $ref: 'common_types.json#/$defs/DynamicString' },
					onSelect: { $ref: 'common_types.json#/$defs/Action' },
				},
				required: [ 'title' ],
			},
		},
		functions: {
			exampleOpenItem: {
				type: 'object',
				returnType: 'void',
				properties: {
					'@call': { const: 'exampleOpenItem' },
					args: { type: 'object', properties: { itemId: { type: 'number' } } },
				},
				required: [ '@call', 'args' ],
			},
		},
	},
	components: { ExampleCard },
	functions: { exampleOpenItem: ( args ) => openItem( Number( args.itemId ) ) },
};
```

- The document is plain JSON, so the server reads the same one ([capabilities](#capabilities)).
  Props are JSON Schema, with A2UI's shared types from `common_types.json#/$defs/`, such as
  `DynamicString` and `Action`. A component rejects props it doesn't declare, so declare `weight`
  if it can sit in a `Row` or `Column`.
- A component gets resolved props: bound values, a `set<Prop>` setter for each `Dynamic…` or
  `DataBinding` prop, actions as functions to call, its `surfaceId`, `disabled` and
  `isShowingErrors` state, and the host's `hostProps`. These replace the surface's props of the
  same name, so don't declare props with those names. A setter writes only to a bound path and
  does nothing for a literal value, so keep an input's value in local state too, as the basic
  inputs do. It doesn't get A2UI's `buildChild`, so it can't render other components: a
  `ComponentId` or `ChildList` prop arrives as IDs only. Make custom components leaves, laid out
  with the basic ones.
- A component that declares `checks` (an array of `CheckRule`s) also gets `isValid` and
  `validationErrors`, its failed checks' messages. Like the [basic components](#basic-components),
  show the first message once the person touches the field or `isShowingErrors` is true (an
  invalid Button was clicked), and disable inputs and actions with `disabled` while keeping what
  only shows or reveals content usable. A `lazy()` component renders nothing while it loads.
- Keep a custom component accessible like the basic components: label its fields, show a failed
  check's message as the field's `help` with `aria-invalid` on its focusable control, which a click
  on an invalid button focuses, and set `accessibleWhenDisabled` on buttons, since the surface
  disables them right after a click and a plainly `disabled` button drops keyboard focus.
- A function declares its `returnType`, and may be async. Its arguments come from the agent, so
  treat them as untrusted. It runs only from a click, unless the document sets
  `requiresUserActivation: false` so a check or a custom component's `Dynamic…` prop can call it,
  such as one that formats text.
- `agentComposable: false` on a definition marks a catalog that only abilities build surfaces
  with, such as one whose components need data the agent can't supply. Hosts still list its ID,
  but don't send its document, so the agent can't compose with it. It defaults to `true`.

`createInteractiveUiCatalog()` builds A2UI's Basic catalog, and
`createInteractiveUiCatalog( definition )` a catalog with the basic components and functions plus
the definition's own, which replace basic ones of the same name.

## Capabilities

The `@automattic/ai-ui-renderer/capabilities` entry has no A2UI or React code, so a host can use it
before loading the renderer:

- `assertInteractiveUiCatalogDefinition( definition )` throws when a definition has no ID, a
  component or function that isn't an object schema, or code that doesn't match its document.
  Check catalogs with it before advertising them, since
  `createInteractiveUiCatalog()` rejects those that fail.
- `getInteractiveUiRendererCapabilities( definitions )` returns A2UI's `a2uiRendererCapabilities`
  for the Basic catalog and those catalogs: their IDs (`supportedCatalogIds`), and the documents of
  those that aren't `agentComposable: false` (`inlineCatalogs`) in A2UI's form. Send it in each
  message's metadata, as A2UI's A2A binding does, so the agent shows only UI the host can render.
- `getInteractiveUiOperation( message )` returns an A2UI message's operation name and surface ID,
  or `undefined` for a malformed message, as the agent's messages aren't validated.
- `BASIC_CATALOG_ID` is A2UI's Basic catalog ID.

## Rendering

1. Create a runtime with `createInteractiveUiRuntime({ catalogs, onAction, onError })`. Keep it
   for the session to preserve edits, then call `runtime.dispose()`. Like A2UI, it rejects a
   message with an invalid `path`, or one that would make a cycle or too deep a layout, even with
   components from earlier messages.
2. Pass it ordered batches with `runtime.processMessages(messages, ownerId)`. The owner is what the
   host shows the surfaces next to, such as a chat message. It returns the messages it applied. Once
   a message for a surface fails, it skips the batch's later messages for that surface.
3. Render each of an owner's surfaces (`runtime.getSurfaceIds(ownerId)`, then
   `runtime.getSurface(id)`) with `InteractiveUiSurface`, and re-render after each
   `processMessages()` call.
4. Send A2UI's `a2uiRendererDataModel` with each message to the agent, from
   `runtime.getDataModel(surfaceIds)`: the data models of those surfaces that set
   `sendDataModel`, or `undefined` if none do. Unlike A2UI's, it covers only the surfaces you
   pass, such as those the user can still change, and leaves out the values obscured `TextField`s
   bind to, or the whole surface when one binds a relative path, which a `List` template resolves
   per item.

`onError` gets every error in A2UI's shape, with its `code`, `message` and, when it has one, its
`surfaceId`: each message the runtime rejects, a component a surface's catalog lacks
(`UNKNOWN_COMPONENT_TYPE`), a component that throws while rendering (`RENDER_FAILED`), and A2UI's
own, such as a function that failed when a button called it. The message can quote the agent's
content. Its second argument is the owner of the rejected message's batch or of the surface.

`InteractiveUiSurface` renders nothing until the surface's root component arrives. Its props:

- `fallback` shows in place of a surface that uses a component its catalog lacks or fails to
  render, such as a notice. It shows nothing by default.
- `revision` retries a surface that failed to render each time it changes, so bump it after each
  `processMessages()` call.
- `disabled` disables its inputs and actions, including an open modal's, such as while the agent
  replies or once the surface is stale. Its tabs and modal triggers stay usable.
- `hostProps` gives the host's components props of your own, such as chat state. They override
  the surface's props of the same name; pass a stable object to avoid re-renders.
- `className` adds classes to the surface and its modal overlay ([Theming](#theming)).

Import `@automattic/ai-ui-renderer/style.scss` (Sass) with the renderer, in the same lazy
`import()` when you load it on demand, and give the modal overlay (`ai-ui-renderer__modal`) a
stacking rule. WordPress UI components load their own styles.

## Theming

Surfaces follow [A2UI's theming](https://a2ui.org/guides/theming/): a host sets A2UI's color tokens,
and the renderer applies them to the basic components and the WordPress components they use.

| Token                                                                             | Colors                                                   |
| --------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `--a2ui-color-primary`, `--a2ui-color-primary-hover`, `--a2ui-color-primary-dark` | Buttons, checked controls, sliders, tabs and focus rings |
| `--a2ui-color-on-primary`                                                         | Text and marks on the primary color                      |
| `--a2ui-color-surface`, `--a2ui-color-on-surface`                                 | Cards and the modal                                      |
| `--a2ui-color-input`, `--a2ui-color-on-input`                                     | Inputs, and the text and labels of controls              |
| `--a2ui-color-border`                                                             | Card outlines and dividers                               |

Set them on the class you pass as `className`, or on an ancestor. Pick light or dark with the
page's `color-scheme`, or A2UI's `a2ui-dark` or `a2ui-light` class:

```scss
.my-chat__surface {
	--a2ui-color-surface: var( --my-chat-background );
	--a2ui-color-on-surface: var( --my-chat-text );
}

.my-chat.is-dark .my-chat__surface {
	color-scheme: dark;
	--a2ui-color-input: #2f2f2f;
}
```

An unset token keeps the host's WordPress components color (`--wp-components-color-*`), or else a
default from WordPress's palette that follows the light or dark mode. A custom
`--a2ui-color-primary` without its own `-hover` and `-dark` gets them derived from it, as A2UI does.
The modal renders outside the host, so it copies its surface's theme when it opens.

Disabled controls use the renderer's disabled colors (`--ai-ui-renderer-disabled-background`,
`--ai-ui-renderer-disabled-border` and `--ai-ui-renderer-disabled-foreground`), which follow the
light or dark mode.

Accent-colored text and fills on the surface use the renderer's accent colors
(`--ai-ui-renderer-accent-text`, `--ai-ui-renderer-accent-text-hover` and
`--ai-ui-renderer-accent-fill`), which are lighter in dark mode so they stay readable.

### Theming a new component

When you add a basic or custom component:

1. Color it with the tokens, such as `var( --a2ui-color-on-surface )`, the accent colors for
   primary-colored text or fills on the surface, and the disabled colors, or use WordPress
   components, which follow them. Never use a chat's own variables.
2. Check it in light and dark mode, enabled and disabled (a stale surface).
3. If a WordPress component hard-codes light colors, enabled or disabled, or doesn't color its
   disabled state, add a rule for it: in `style.scss` for a basic component, or in the custom
   component's own stylesheet.

## Development

Build with `yarn workspace @automattic/ai-ui-renderer build`, and test with
`yarn test-packages packages/ai-ui-renderer`.

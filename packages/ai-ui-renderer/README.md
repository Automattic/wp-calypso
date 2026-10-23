# AI UI Renderer

`@automattic/ai-ui-renderer` renders A2UI v1.0 surfaces with WordPress components. It holds only
basic or shared components: each chat's own components live in its project. Hosts own session
lifetime, action delivery, and error handling. See the
[interactive UI architecture](../agents-manager/src/interactive-ui/README.md) for how hosts and
providers use it.

## Catalogs

A host or provider with its own components and functions declares one catalog: an
[A2UI v1.0 catalog document](https://a2ui.org/specification/v1_0/catalog_definition.json) and the
code that implements it. Add a custom component only for what the basic ones can't express.

```ts
const exampleCatalog: InteractiveUiCatalogDefinition = {
	catalog: {
		catalogId: 'urn:automattic:example:interactive-ui:v1',
		instructions: 'Use ExampleCard to show one item.',
		components: {
			ExampleCard: {
				type: 'object',
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
- A component gets resolved props: bound values, a `set<Prop>` setter for each, actions as
  functions to call, its `surfaceId` and `disabled` state, and the host's `hostProps`. Disable
  its controls with `disabled`, as the basic components are.
- A function declares its `returnType`, and may be async. Its arguments come from the agent, so
  treat them as untrusted. It runs only from a click, unless the document sets
  `requiresUserActivation: false` so a value can call it, such as one that formats text.

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
- `getInteractiveUiRendererCapabilities( documents )` returns A2UI's `a2uiRendererCapabilities`
  for the Basic catalog and those catalogs: their IDs, and their documents in A2UI's form, with
  `$id`, `protocolVersion`, each component and function named in `component` or `@call`, and each
  function's `requiresUserActivation`. Send it in each message's metadata, as A2UI's A2A binding
  does, so the agent shows only UI the host can render.
- `BASIC_CATALOG_ID` is A2UI's Basic catalog ID.

## Rendering

1. Create a runtime with `createInteractiveUiRuntime({ catalogs, onAction, onError })`. Keep it
   for the session to preserve edits, then call `runtime.dispose()`. Like A2UI, it rejects a
   message with an invalid `path`, or one that would make a cycle or too deep a layout, even with
   components from earlier messages.
2. Pass it ordered batches with `runtime.processMessages(messages, ownerId)`. The owner is what
   the host shows the surfaces next to, such as a chat message.
3. Render each of an owner's surfaces (`runtime.getSurfaceIds(ownerId)`, then
   `runtime.getSurface(id)`) with `InteractiveUiSurface`, and re-render after each
   `processMessages()` call.

`InteractiveUiSurface` waits for the surface's root component. It hides a surface that uses an
unknown component, reporting it through `onError`, and one that fails to render until its
`revision` changes. Its props:

- `disabled` disables its controls, including an open modal's.
- `hostProps` gives the host's components props of your own, such as chat state. They override
  the surface's props of the same name; pass a stable object to avoid re-renders.
- `className` adds classes to the surface and its modal overlay ([Theming](#theming)).

Import `@automattic/ai-ui-renderer/style.scss` (Sass) and the WordPress components stylesheet,
and give the modal overlay (`ai-ui-renderer__modal`) a stacking rule.

## Theming

Surfaces follow [A2UI's theming](https://a2ui.org/guides/theming/): a host sets A2UI's color
tokens, and the renderer applies them to the basic components and the WordPress components they
use, including newer ones that read WordPress's `--wpds-*` design tokens.

| Token                                                                             | Colors                                      |
| --------------------------------------------------------------------------------- | ------------------------------------------- |
| `--a2ui-color-primary`, `--a2ui-color-primary-hover`, `--a2ui-color-primary-dark` | Primary buttons and checked controls        |
| `--a2ui-color-on-primary`                                                         | Text on the primary color                   |
| `--a2ui-color-surface`, `--a2ui-color-on-surface`                                 | Cards and the modal                         |
| `--a2ui-color-input`, `--a2ui-color-on-input`                                     | Inputs, and the text and labels of controls |
| `--a2ui-color-border`                                                             | Card outlines and dividers                  |

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
default from WordPress's palette that follows the light or dark mode. The modal renders outside the
host, so it copies its surface's theme when it opens.

Disabled controls use the renderer's disabled colors (`--ai-ui-renderer-disabled-background`,
`--ai-ui-renderer-disabled-border` and `--ai-ui-renderer-disabled-foreground`): WordPress's grays in
light mode, and the matching shades in dark mode. A stale surface disables its controls through its
fieldset, which WordPress components don't style (they read their own `disabled` prop), so
`style.scss` colors the basic components' disabled controls.

### Theming a new component

When you add a basic or custom component:

1. Color it with the tokens, such as `var( --a2ui-color-on-surface )`, and the disabled colors, or
   use WordPress components, which follow them. Never use a chat's own variables.
2. Check it in light and dark mode, enabled and disabled (a stale surface).
3. If a WordPress component hard-codes light colors, or styles its disabled state only from its
   `disabled` prop, add a rule for it: in `style.scss` for a basic component, or in the custom
   component's own stylesheet.

## Basic components

`Text`, `TextField`, `Button`, `Column`, `Image`, `Icon`, `Row`, `List`, `Card`, `Divider`,
`CheckBox`, `ChoicePicker`, `DateTimeInput`, `Video`, `AudioPlayer`, `Tabs`, `Modal` and
`Slider`.

- Buttons send an `event` to the agent, or call a catalog function with `functionCall`. To submit
  edits, bind the inputs and the action's context to the same data paths.
- A modal's `Button` trigger opens it instead of sending its action. Its inputs share the
  surface's data model and are disabled with it.
- Text fields keep their values as strings, choice pickers as string arrays, and date/time inputs
  as local ISO strings.
- Components ignore A2UI v1.0 properties they don't support, such as `weight`, `accessibility`
  and `checks`, instead of rejecting the surface.

## Development

Build with `yarn workspace @automattic/ai-ui-renderer build`, and test with
`yarn test-packages packages/ai-ui-renderer`.

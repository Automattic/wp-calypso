# AI UI Renderer

`@automattic/ai-ui-renderer` is a shared component library that renders
[A2UI v1.0](https://a2ui.org) surfaces with WordPress components.

- **What's here:** the Basic catalog's components, the [charts catalog](#charts), the runtime,
  `InteractiveUiSurface` and the styles, which every host shares.
- **What isn't:** custom components. Put one in your own project, in your own catalog
  ([Catalogs](#catalogs)), not here. Chat, session, transport and error handling stay in the host.
- **How hosts use it:** see [Capabilities](#capabilities), [Rendering](#rendering) and
  [Theming](#theming). Agents Manager's
  [interactive UI architecture](../agents-manager/src/interactive-ui/README.md) shows a whole host.

## Basic components

`Text`, `TextField`, `Button`, `Column`, `Image`, `Icon`, `Row`, `List`, `Card`, `Divider`,
`CheckBox`, `ChoicePicker`, `DateTimeInput`, `Video`, `AudioPlayer`, `Tabs`, `Modal` and
`Slider`.

- Buttons dispatch an `event` in the runtime's action mode, or call a catalog function with
  `functionCall`. By default, events go to the agent. To submit
  edits, bind the inputs and the action's context to the same data paths. The agent gets the
  event's `name` and `context`, so name it for what it does, such as `save_title`, and put in its
  context what acting on it needs, such as the item's ID.
- Values, such as a `Text`'s `text`, take a literal or a `{"@path": …}` binding. Unlike in A2UI's
  Basic catalog, they never take a `{"@call": …}`: only actions and checks call functions. So send
  display text ready to show: formatted, such as a date or a price, and in the person's language.
- A `Text` renders Markdown, except inside a `Button`, so write a heading as `### Title`.
- A modal's `Button` trigger opens it instead of sending its action, and stays usable on a
  disabled surface. Its title, which also names the dialog, is its `accessibility.label`, or
  "Details" without one. Its inputs share the surface's data model and are disabled with it. Its own
  buttons send their actions and leave it open; only the person closes it.
- Text fields keep their values as strings, choice pickers as string arrays, and date/time inputs
  as local ISO strings. A slider moves in whole numbers from its `min`, or in `steps` equal parts.
- `Button`, `TextField`, `CheckBox`, `ChoicePicker`, `Slider` and `DateTimeInput` take A2UI's
  `checks`. A button is disabled while any of its own checks fails, with their messages as its
  accessible description.
- A field shows its first failed check once it's touched: when the person leaves a text or date
  field, or changes a check box, a choice or a slider. Every field shows it once the person clicks
  a disabled button whose checks fail, or presses Enter or Space on it, which also moves focus to
  the surface's first invalid field outside a hidden tab.
- A check of a path with no value runs on it as empty: `required`, `email` and `numeric` fail, and
  `length` and `regex` check an empty string. One that can't run, such as `numeric` given a text
  field's string, also fails and is reported through `onError`.
- A failed check shows its own `message`, never the English one A2UI's validation functions
  return. A button reads all of its failing messages together, so give every check a `message` in
  the person's language that names the field and says what to enter. One without shows A2UI's
  generic English "Validation failed".
- An `Image`'s `description` is its alt text, so one without it is decorative. An `AudioPlayer`'s
  shows above the player and names it.
- Components ignore A2UI v1.0 properties they don't support, such as `weight`, a `Text`'s
  `variant` and the `accessibility` of components other than `Modal`, instead of rejecting the
  surface.

## Charts

The charts catalog (`CHARTS_CATALOG_ID`) has `LineChart` (values over time), `BarChart` (values by
category, vertical or `horizontal`) and `PieChart` (each part's share of a whole), built on
`@automattic/charts`. Each takes a `title`, which also names it for screen readers, and up to six
series or slices.

- **Adding it:** list `{ catalog: CHARTS_CATALOG_DOCUMENT }` in your
  [capabilities](#capabilities), and build `createInteractiveUiCatalog( CHARTS_CATALOG )` for the
  runtime beside the Basic catalog. A chart names the charts catalog as its `catalogId`, so it sits
  in a surface on any catalog, laid out with the basic components.
- **Loading:** the charts load when a surface first shows one, so other surfaces don't fetch the
  chart library. A load that fails twice shows the surface's `fallback` until the page reloads.
- **Theming:** the axes, grid, legend and tooltips follow the surface's colors in light and dark
  mode. The series colors are fixed, each with at least 3:1 contrast on white and on #1e1e1e.
  Tooltips render in a portal on the page, outside the surface, so they copy its theme, stay within
  its edges, and need a `z-index` above your UI ([Rendering](#rendering)).
- **Language:** dates follow the page's language (`<html lang>`), and numbers
  `@automattic/number-formatters`' locale: the one the host sets, else WordPress's user locale,
  else the browser's.
- **Accessibility:** screen readers get each chart's data as a visually hidden table. The keyboard
  moves its tooltip between points, and Tab and Escape return focus to the chart. On a
  right-to-left page, the axes keep their place.
- **Bad data:** an impossible date, a repeated series or point, or a pie of zeros shows the
  surface's `fallback` and is reported through `onError` as `RENDER_FAILED`.

## Catalogs

A host or provider with its own components and functions declares one catalog: an
[A2UI v1.0 catalog document](https://a2ui.org/specification/v1_0/catalog_definition.json) and the
code that implements it. `createInteractiveUiCatalog( definition )` builds it for the runtime: the
basic components and functions plus the definition's own, which replace basic ones of the same
name. It throws when the definition fails `assertInteractiveUiCatalogDefinition()` or its document
isn't a valid A2UI catalog. `createInteractiveUiCatalog()` builds A2UI's Basic catalog.

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
  with the basic ones. A `lazy()` component renders nothing while it loads.
- A component that declares `checks` (an array of `CheckRule`s) also gets `isValid` and
  `validationErrors`, its failed checks' messages. `isShowingErrors` turns true once the person
  activates a `Button` whose checks fail. Show the messages and handle `disabled` as
  [Adding a component](#adding-a-component) says.
- A function declares its `returnType`, and may be async. Its arguments come from the agent, so
  treat them as untrusted. It runs only from a click. To let a check or a custom component's
  `Dynamic…` prop call it, such as one that formats text, set `requiresUserActivation: false` on it
  in the document.
- `agentComposable: false` on a definition marks a catalog that only abilities build surfaces
  with, such as one whose components need data the agent can't supply. Hosts still list its ID,
  but don't send its document, so the agent can't compose with it. It defaults to `true`.

## Capabilities

The `@automattic/ai-ui-renderer/capabilities` entry has no A2UI or React code, so a host can use it
before loading the renderer:

- `assertInteractiveUiCatalogDefinition( definition )` throws when a definition has no ID, a
  component or function that isn't an object schema, or code that doesn't match its document.
  `createInteractiveUiCatalog()` rejects those, so check each catalog with it before listing it in
  the capabilities below.
- `getInteractiveUiRendererCapabilities( definitions )` returns A2UI's `a2uiRendererCapabilities`
  for the Basic catalog and those catalogs: their IDs (`supportedCatalogIds`), and the documents of
  those without `agentComposable: false` (`inlineCatalogs`) in A2UI's form. Send it in each
  message's metadata, as A2UI's A2A binding does, so the agent shows only UI the host can render.
- `getInteractiveUiOperation( message )` returns an A2UI message's operation name and surface ID,
  or `undefined` for a malformed message, as the agent's messages aren't validated.
- `BASIC_CATALOG_ID` is A2UI's Basic catalog ID, and `CHARTS_CATALOG_ID` and
  `CHARTS_CATALOG_DOCUMENT` are the [charts catalog's](#charts).
- `getInteractiveUiActionInstructions( actionMode )` returns guidance for the agent composing
  actions. Include it in the host's rendering tool description. It defaults to `agent` mode.

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
   pass, such as those the user can still change. It leaves out the values of password fields
   (`TextField`s with the `obscured` variant), and the whole surface when one of its password fields
   binds a relative path, which a `List` template resolves per item.

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
`import()` when you load it on demand, and give the modal overlay (`ai-ui-renderer__modal`), chart
tooltips (`.visx-tooltip:has( .ai-ui-renderer__chart-tooltip )`) and the points they mark
(`.visx-tooltip-glyph`) a `z-index` above your UI, since they render outside the surface.
WordPress UI components load their own styles.

### Action modes

Both modes pass events to `onAction`. In the default `agent` mode, Agents Manager sends hidden
context messages. MCP Apps can use `tool-call` mode to execute tools directly:

```ts
const runtime = createInteractiveUiRuntime( {
	catalogs,
	actionMode: 'tool-call',
	onAction: async ( { name, context } ) => {
		const result = await executeTool( { name, arguments: context } );
		if ( result.isError ) {
			throw new Error( 'Tool call failed' );
		}
	},
	onError,
} );
```

An event's `name` is the tool name and its resolved `context` contains the complete arguments.
The host maps the action's `context` to tool `arguments`, executes the tool, and handles its
result, including any UI updates. `onAction` must reject on failure, including MCP results with
`isError`; the runtime reports `TOOL_CALL_FAILED` through `onError`. Disable the surface while a
call is pending. Catalog `functionCall` actions still run locally.

Include `getInteractiveUiActionInstructions('tool-call')` from the `capabilities` entry in the
rendering tool's description. Callers must name an available tool and bind editable values into
its arguments. No LLM interprets a click or provides an assistant follow-up. The app sends no
chat message, though the client may display tool activity.

## Theming

Surfaces follow [A2UI's theming](https://a2ui.org/guides/theming/): a host sets A2UI's color tokens,
and the renderer applies them to the basic components, the charts and the WordPress components they
use.

| Token                                                                             | Colors                                                   |
| --------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `--a2ui-color-primary`, `--a2ui-color-primary-hover`, `--a2ui-color-primary-dark` | Buttons, checked controls, sliders, tabs and focus rings |
| `--a2ui-color-on-primary`                                                         | Text and marks on the primary color                      |
| `--a2ui-color-surface`, `--a2ui-color-on-surface`                                 | Cards, the modal and chart tooltips                      |
| `--a2ui-color-input`, `--a2ui-color-on-input`                                     | Inputs, and the text and labels of controls              |
| `--a2ui-color-border`                                                             | Card, modal and chart tooltip outlines, and dividers     |

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

An unset primary or input token, or its `on-` pair, keeps the host's WordPress components color
(`--wp-components-color-*`), or else a default from WordPress's palette. An unset surface or border
token gets that palette default directly. The input, surface and border defaults follow the light
or dark mode. A custom `--a2ui-color-primary` without its own `-hover` and `-dark` gets them derived
from it, as A2UI does.
The modal and chart tooltips render outside the host, so they copy their surface's theme when they
open.

The renderer derives its own colors from those, which follow the light or dark mode:

- Disabled controls use its disabled colors: `--ai-ui-renderer-disabled-background`,
  `--ai-ui-renderer-disabled-border` and `--ai-ui-renderer-disabled-foreground`.
- Primary-colored text and lines, such as focus rings, the tab marker, the slider and a checked
  control's edge, use its accent colors: `--ai-ui-renderer-accent-text`,
  `--ai-ui-renderer-accent-text-hover` and `--ai-ui-renderer-accent-line`. They're lighter in dark
  mode, so they stand out on the surface. Fills, such as a primary Button or a checked check box,
  keep the primary in both modes, with `--a2ui-color-on-primary` text and marks on top.

## Adding a component

Add a basic component in `src/components`, or a custom one to its owner's catalog
([Catalogs](#catalogs)). One that Agents Manager renders, from its own or a provider's catalog,
also follows its [rules](../agents-manager/src/interactive-ui/README.md#rules). Build it from
WordPress components (`@wordpress/ui`, or the `@wordpress/components` your project uses), which
handle most of this:

- Label fields and icon-only buttons, give meaningful images alt text, and let a screen reader
  announce the state, such as checked or invalid.
- Make it work with the keyboard alone, with a visible focus ring: Tab reaches each control in
  reading order, Enter or Space acts on it, arrow keys move within a group and Escape closes what it
  opens. Keep buttons focusable when disabled (`focusableWhenDisabled`, or `accessibleWhenDisabled`
  in `@wordpress/components`), since the surface disables them right after a click and a plainly
  `disabled` button drops keyboard focus.
- Give an input `checks`. Once the person touches it or `isShowingErrors` is true, show its first
  failed check as its description, with `aria-invalid` on its focusable control so an invalid
  `Button` can focus it, and clear it once the value passes. Basic inputs get both from
  `useFieldProps()`.
- Make every state look distinct (hover, focus, pressed, checked, invalid and disabled), never by
  color alone. While `disabled`, disable inputs and actions, but keep what only shows or reveals
  content usable.
- Fit a narrow chat: long text wraps, nothing overflows the surface, and the component's own text
  is translated and still fits when longer. Show the agent's text as given, so a custom prop's
  `description` asks for text ready to show, such as a date formatted in the person's language.
- Take colors from A2UI's tokens, the renderer's accent and disabled colors ([Theming](#theming))
  or `@wordpress/ui` components, never a chat's own variables or fixed colors (the charts' series
  colors are the exception, as the chart library reads only plain colors). Keep WCAG AA
  contrast: 4.5:1 for text and 3:1 for other parts. `@wordpress/components` follow only A2UI's
  tokens, so give them the accent and disabled colors yourself. If a WordPress component hard-codes
  a light color or leaves a state uncolored, fix it in `style.scss` for a basic component, or in the
  custom component's own stylesheet.
- Check it in light and dark mode, in every state, with the keyboard and a screen reader. Agents
  Manager can render every basic component, the charts and those in its own and its providers'
  catalogs, so check them in its chat's dark mode too
  ([Try it](../agents-manager/src/interactive-ui/README.md#try-it)).
- Test it: a basic component gets cases for its value, checks and disabled state in
  `src/components/__tests__/interactive-ui-surface.test.tsx`, the charts in
  `src/components/__tests__/charts.test.tsx`, and a custom one gets tests in its own project.

## Development

Build with `yarn workspace @automattic/ai-ui-renderer build`, and test with
`yarn test-packages packages/ai-ui-renderer`.

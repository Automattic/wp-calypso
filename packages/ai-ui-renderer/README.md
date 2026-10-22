# AI UI Renderer

`@automattic/ai-ui-renderer` renders A2UI v1.0 surfaces with WordPress components. It holds only
basic or shared components: each chat's own components live in its project. Hosts own session
lifetime, action delivery, and error handling. See the
[interactive UI architecture](../agents-manager/INTERACTIVE-UI.md) for how hosts and providers
use it.

## Usage

Build an A2UI v1.0 catalog with `createInteractiveUiCatalog({ id, components, functions })`: the
basic components below and A2UI's built-in functions, plus the host's own. The ID defaults to
A2UI's Basic catalog's; give a catalog with your own components its own versioned ID. Duplicate
names throw.

Define a component or function as a plain object, so it can ship in another bundle without its
own A2UI or `zod`:

```ts
const titlePicker: InteractiveUiComponentDefinition< TitlePickerProps > = {
	name: 'JetpackAiTitlePicker',
	schema: ( { z, ActionSchema } ) =>
		z.object( { titles: z.array( z.string() ), onPick: ActionSchema } ),
	component: TitlePicker,
};
```

- `schema` builds with the renderer's `zod`, A2UI's `ActionSchema` and `DataBindingSchema`, and
  `StringValueSchema`, `NumberValueSchema` and `BooleanValueSchema`, which take a literal or a
  data binding.
- The component gets resolved props: bound values, a `set<Prop>` setter for each, actions as
  functions to call, and the host's `hostProps`.
- A function definition has a `name`, `returnType`, `schema` and `execute( args )`, which may be
  async. Its arguments come from the agent, so treat them as untrusted.

## Rendering

1. Create a runtime with `createInteractiveUiRuntime({ catalogs, onAction, onError })`. Keep it
   for the session to preserve edits, then call `runtime.dispose()`.
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
default from WordPress's palette that follows the light or dark mode. In dark mode, text-style
buttons and checked controls use a lighter shade of the primary color, so they stay readable. The
modal renders outside the host, so it copies its surface's theme when it opens.

Custom components should use the tokens, such as `var( --a2ui-color-on-surface )`, or WordPress
components, which follow them, never a chat's own variables.

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

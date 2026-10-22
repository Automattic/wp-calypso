# AI UI Renderer

`@automattic/ai-ui-renderer` renders A2UI v0.9 surfaces with WordPress components. Hosts own
session lifetime, action delivery, and error handling. See the
[interactive UI architecture](../agents-manager/INTERACTIVE-UI.md) for how hosts and
providers use it.

## Usage

Build a catalog with `createInteractiveUiCatalog({ id, components, functions })`: the basic
components below and A2UI's built-in functions, plus the host's own. The ID defaults to A2UI's
Basic catalog; give a catalog with your own components its own versioned ID. Duplicate names
throw.

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

`schema` builds with the renderer's `zod`, A2UI's `ActionSchema` and `DataBindingSchema`, and
value schemas that take a literal or a data binding (`StringValueSchema`, `NumberValueSchema`,
`BooleanValueSchema`). The component gets resolved props: bound values read from the data model,
a `set<Prop>` setter for each, actions as functions to call, and the host's `hostProps`. A
function definition has a `name`, `returnType`, `schema` and `execute( args )`, which may be
async; its arguments come from the agent, so treat them as untrusted.

Create a runtime with `createInteractiveUiRuntime({ catalogs, onAction, onError })` and pass it
ordered batches with `runtime.processMessages(messages, ownerId)`. The owner is what
the host shows the surfaces next to, such as a chat message. Keep the runtime for the
session to preserve edits, then call `runtime.dispose()`.

Render each of an owner's surfaces (`runtime.getSurfaceIds(ownerId)`, then
`runtime.getSurface(id)`) with `InteractiveUiSurface`, and re-render after each
`processMessages()` call. It adds the `ai-ui-renderer` root fieldset and Markdown, waits
for the surface's root component, hides a surface that uses a component its catalog lacks
(reporting it through `onError`), and hides a surface that fails to render until its `revision`
changes. Pass `disabled` to disable its controls, including an open modal's, and `hostProps` to
give the components that definitions add props of your own, such as chat state. The host's props
override the surface's props of the same name; pass a stable object to avoid re-renders.

Import `@automattic/ai-ui-renderer/style.scss` and the WordPress components stylesheet.
Hosts need Sass support and supply their own stacking rule for `.ai-ui-renderer__modal`.

Select a theme with `createSurface.theme: { name: 'commerce' }` or the
`InteractiveUiSurface` `theme` prop, which takes precedence. Theme names in
messages must start with a lowercase letter and contain only lowercase letters,
digits, and hyphens. Other message theme names are ignored without preventing
the surface from rendering. The renderer adds `ai-ui-renderer--theme-<name>` to the
surface fieldsets and the modal overlay. Consumers load their own
CSS scoped to that class; no theme keeps the default styles.

## Basic components

`Text`, `TextField`, `Button`, `Column`, `Image`, `Icon`, `Row`, `List`, `Card`,
`Divider`, `CheckBox`, `ChoicePicker`, `DateTimeInput`, `Video`, `AudioPlayer`, `Tabs`,
`Modal`, and `Slider`.

- Layouts use arrays of child IDs. Cards wrap a single child and use the host's
  `--color-background` and `--color-foreground`.
- Icons map supported Basic catalog names to WordPress icons.
- Choice pickers support single and multiple selection and store selected values as
  string arrays.
- Buttons send an `event` to the agent, or call a catalog function with `functionCall`.
- Bind input values and button action context to the same data paths to submit edits.
- Date/time inputs use local ISO date/time strings, enable date, time, or both with
  `enableDate`/`enableTime`, and show the browser's validation message on blur.
- Text fields support `shortText`, `longText`, `number`, and `obscured` (password)
  variants; their values remain strings.
- Sliders store numbers and use `min` and `max` to set their range.
- Video and audio URLs support data bindings and render native players with controls.
- Tabs contain `{ title, child }` entries.
- Modals reference a `Button` trigger and a content component. The trigger opens the
  dialog locally instead of sending its action; buttons inside the dialog send actions
  normally. Dialog inputs share the surface data model and are disabled with it.
- Input and choice-group labels use WordPress control typography and spacing.

## Development

Build with `yarn workspace @automattic/ai-ui-renderer build`. Run its tests with
`yarn jest --config packages/ai-ui-renderer/jest.config.js --runInBand`.

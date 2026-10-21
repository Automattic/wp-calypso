# AI UI Renderer

`@automattic/ai-ui-renderer` renders A2UI v0.9 surfaces with WordPress components. Hosts own
session lifetime, action delivery, and error handling. See the
[interactive UI architecture](../agents-manager/INTERACTIVE-UI.md) for how hosts and
providers use it.

## Usage

Build a catalog with `createInteractiveUiCatalog()`: the basic components below plus
the host's own `components` and `functions`. Duplicate names throw.

Create a runtime with `createInteractiveUiRuntime({ catalog, onAction })` and pass it
ordered batches with `runtime.processMessages(messages, ownerId)`. The owner is what
the host shows the surfaces next to, such as a chat message. Keep the runtime for the
session to preserve edits, then call `runtime.dispose()`.

Render each of an owner's surfaces (`runtime.getSurfaceIds(ownerId)`, then
`runtime.getSurface(id)`) with `InteractiveUiSurface`, and re-render after each
`processMessages()` call. It adds the `ai-ui-renderer` root fieldset and Markdown, waits
for the surface's root component, and hides a surface that fails to render until its
`revision` changes. Pass `disabled` to disable its controls, including an open modal's.

Import `@automattic/ai-ui-renderer/style.scss` and the WordPress components stylesheet.
Hosts need Sass support and supply their own stacking rule for `.ai-ui-renderer__modal`.

## Basic components

`Text`, `TextField`, `Button`, `Column`, `Image`, `Icon`, `Row`, `List`, `Card`,
`Divider`, `CheckBox`, `ChoicePicker`, `DateTimeInput`, `Video`, `AudioPlayer`, `Tabs`,
`Modal`, and `Slider`.

- Layouts use arrays of child IDs. Cards wrap a single child and use the host's
  `--color-background` and `--color-foreground`.
- Icons map supported Basic catalog names to WordPress icons.
- Choice pickers support single and multiple selection and store selected values as
  string arrays.
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

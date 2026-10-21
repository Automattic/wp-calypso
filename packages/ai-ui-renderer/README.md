# AI UI Renderer

`@automattic/ai-ui-renderer` contains the A2UI v0.9 WordPress catalog and runtime extracted
from Agents Manager. Consumers own session lifetime, action delivery, and error handling.

Create a runtime with `createInteractiveUiRuntime(onAction)`, feed ordered batches
into `runtime.processMessages(messages, ownerMessageId)`, and render surfaces from
`runtime.getSurface(id)` with `InteractiveUiSurface`. Keep the runtime alive to
preserve edits, and call `runtime.dispose()` when its session ends.

The package also exports `MarkdownContext`, `renderMarkdown`, and
`InteractiveUiDisabledContext` for the host's rendering wrapper. Import
`@automattic/ai-ui-renderer/style.scss` and the WordPress components stylesheet. Consumers
need Sass support and supply their own modal stacking rule.

The demo catalog supports `Text`, `TextField`, `Button`, `Column`, `Image`, `Icon`,
`Row`, `List`, `Card`, `Divider`, `CheckBox`, `ChoicePicker`, `DateTimeInput`,
`Video`, `AudioPlayer`, `Tabs`, `Modal`, and `Slider`.
Layouts use arrays of child IDs; cards wrap a single child and follow the chat
theme colors. Icons map supported
Basic catalog names to WordPress icons. Choice pickers support single and multiple
selection and store selected values as string arrays. Bind input values and button
action context to the same data paths to submit edits. Date/time inputs use local
ISO date/time strings and enable date, time, or both with `enableDate`/`enableTime`.
Date/time inputs show the browser's validation message below the field on blur.
Text fields support `shortText`, `longText`, `number`, and `obscured` (password)
variants; their values remain strings. Sliders store numbers and use `min` and
`max` to set their range. Video and audio URLs support data bindings and render
native players with playback controls. Tabs contain `{ title, child }` entries.
Modals reference a `Button` trigger and a content component. The trigger opens
the dialog locally instead of sending its action; buttons inside the dialog send
actions normally. Dialog inputs share the surface data model and are disabled
alongside the surface while the agent is processing.
Input and choice-group labels use WordPress control typography and spacing.

Build with `yarn workspace @automattic/ai-ui-renderer build`. Run the relocated tests with
`yarn jest --config packages/ai-ui-renderer/jest.config.js --runInBand`.

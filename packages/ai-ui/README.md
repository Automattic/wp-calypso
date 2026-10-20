# AI UI

`@automattic/ai-ui` renders agent-generated A2UI v0.9 messages using WordPress components.
It owns the component catalog, data bindings, surface rendering, and styles. It
does not depend on Agents Manager, a chat transcript, or MCP.

## Usage

```tsx
import { createInteractiveUiRuntime, InteractiveUiSurface } from '@automattic/ai-ui';
import type { InteractiveUiAction, InteractiveUiMessage } from '@automattic/ai-ui';
import '@wordpress/components/build-style/style.css';

const runtime = createInteractiveUiRuntime( async ( action: InteractiveUiAction ) => {
	await submitAction( action );
} );

// Use a stable owner ID for a message, tool invocation, or other UI container.
runtime.processMessages( messages as InteractiveUiMessage[], ownerId );

// Render each surface owned by this container inside your React tree.
const surfaces = runtime.getSurfaceIds( ownerId ).map( ( surfaceId ) => {
	const surface = runtime.getSurface( surfaceId );
	return surface ? (
		<InteractiveUiSurface
			key={ surfaceId }
			surface={ surface }
			revision={ revision }
			isDisabled={ isSubmitting }
		/>
	) : null;
} );
```

The host creates one runtime per conversation or app session, processes ordered
message batches once, and re-renders with an incremented `revision` after each
batch. The revision also allows a surface to recover from a previous rendering
error. Keep the runtime alive across updates to preserve edits, and call
`runtime.dispose()` when its session ends. If earlier message history changes,
dispose and replay that history into a new runtime.

The action callback receives the A2UI action with resolved data bindings. The
host decides how to submit it: Agents Manager continues its conversation, while
an MCP app can use its host bridge. Transcript parsing, tool result envelopes,
authentication, and transport adapters belong to consumers.

## Components

The catalog supports `Text`, `TextField`, `Button`, `Column`, `Image`, `Icon`,
`Row`, `List`, `Card`, `Divider`, `CheckBox`, `ChoicePicker`, `DateTimeInput`,
`Video`, `AudioPlayer`, `Tabs`, `Modal`, and `Slider`.

Layouts use arrays of child IDs; cards wrap a single child. Icons map supported
Basic catalog names to WordPress icons. Choice pickers store string arrays for
single and multiple selection. Bind input values and button action context to
the same data paths to submit edits.

Text fields support `shortText`, `longText`, `number`, and `obscured` variants;
their values remain strings. Date/time inputs use local ISO strings, select
date, time, or both with `enableDate`/`enableTime`, and show browser validation
messages on blur. Sliders store numbers and use `min` and `max` for their range.
Video and audio URLs support data bindings and render native playback controls.
Tabs contain `{ title, child }` entries. Modals reference a `Button` trigger and
a content component. The trigger opens the dialog locally; buttons inside the
dialog send actions normally. Dialog inputs share the surface data model and
disabled state.

## Styling and translations

Surface styles load with `InteractiveUiSurface` and are also exported as
`@automattic/ai-ui/style.css`. Consumers must load the WordPress
components stylesheet themselves and bundle the React and WordPress dependencies
appropriate to their environment.

Styles use the `automattic-interactive-ui` prefix. Cards read `--color-background`
and `--color-foreground`, with light defaults. Set
`--automattic-interactive-ui-modal-z-index` on an ancestor of the modal overlay
or on `.automattic-interactive-ui-modal` when the host requires a different
stacking order. Modal overlays are portaled outside the surface.

Surfaces carry `data-agenttic-isolated` to preserve control typography when
embedded in Agenttic chat. The package's fallback labels use the
WordPress `default` translation domain.

## Development

Run `yarn workspace @automattic/ai-ui build` for ESM, CommonJS, types,
and CSS. Calypso consumers resolve `src/` through `calypso:src`. External
consumers use the built package and need a bundler that handles CSS imports.

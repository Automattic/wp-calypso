# Track Element Size

This module is designed to provide utilities for tracking an element's size in the DOM.

## Usage

### `useWindowResizeRect`

`useWindowResizeRect` is a React hook that tracks the size of an element's bounding client rect as
the window is resized. It doesn't track modifications due to other reasons, such as layout changes.

It returns both a ref, to be applied on the element to be measured, and a rect with the element's
dimensions. This rect will be null at first, but will be updated with the initial values on a later
render, as well as kept up to date after any window resizes.

Here's a small sample:

```JSX
import { useWindowResizeRect } from 'lib/track-element-size';

function SampleComponent() {
  // Get ref, rect and subscribe to changes.
  const [ ref, rect ] = useWindowResizeRect();

  // Render component, making sure to use the ref.
  // Initial renders will use 'unknown' and wait for updates.
  return <div ref={ ref }>My width is { rect ? rect.width : 'unknown' }.</div>;
}
```

**Note**: The list of properties in the returned rect may vary between browsers. The safe ones to
use across all of Calypso's supported browsers are:

- `width`
- `height`
- `top`
- `right`
- `bottom`
- `left`

### `useWindowResizeCallback`

`useWindowResizeCallback` is a React hook that tracks the size of an element's bounding client rect
as the window is resized. It doesn't track modifications due to other reasons, such as layout
changes.

It expects a callback function. When the provided element's bounding client rect changes due to
window resizes, the callback function gets called with the updated rect, as a plain JavaScript
object.

It returns a ref, to be applied on the element to be measured.

To help with initialization, the hook always triggers the callback at least once, with the initial
rect.

Here's a small sample:

```JSX
import { useWindowResizeCallback } from 'lib/track-element-size';

function SampleComponent() {
  // Set up state. Starts with an unknown width.
  const [ width, setWidth ] = useState( 'unknown' );

  // Callback function to be used with hook.
  // Needs to be memoized to avoid creating new instances on every render.
  const resizeCallback = useCallback(
    boundingClientRect => setWidth( boundingClientRect.width ),
    []
  );

  // Get ref and subscribe to changes.
  const ref = useWindowResizeCallback( resizeCallback );

  // Render component, making sure to use the ref.
  // First render will use the initial value in state ('unknown'), since there hasn't been
  // a callback yet.
  return <div ref={ ref }>My width is { width }.</div>;
}
```

**Note**: The list of properties in the returned rect may vary between browsers. The safe ones to
use across all of Calypso's supported browsers are:

- `width`
- `height`
- `top`
- `right`
- `bottom`
- `left`

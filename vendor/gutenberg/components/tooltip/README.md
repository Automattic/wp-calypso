Tooltip
=======

Tooltip is a React component to render floating help text relative to a node when it receives focus or when the user places the mouse cursor atop it. If the tooltip exceeds the bounds of the page in the direction it opens, its position will be flipped automatically.

Accessibility note: the tooltip text is hidden from screen readers and assistive technologies that understand ARIA. To make it accessible, use an `aria-label` attribute on the same element the tooltip is applied to, preferably using the same text used for the tooltip.

## Usage

Render a Tooltip, passing as a child the element to which it should anchor:

```jsx
import { Tooltip } from '@wordpress/components';

function HelpfulButton() {
	return (
		<Tooltip text="More information">
			<button>
				Hover for more information
			</button>
		</Tooltip>
	);
}
```

## Props

The component accepts the following props:

### position

The direction in which the tooltip should open relative to its parent node. Specify y- and x-axis as a space-separated string. Supports `"top"`, `"bottom"` y axis, and `"left"`, `"center"`, `"right"` x axis.

- Type: `String`
- Required: No
- Default: `"top center"`

### children

The element to which the tooltip should anchor.

__NOTE:__ You must pass only a single child. Tooltip renders itself as a clone of `children` with a [`Popover`](../popover) added as an additional child.

- Type: `Element`
- Required: Yes

### text

The tooltip text to show on focus or hover.

- Type: `String`
- Required: No

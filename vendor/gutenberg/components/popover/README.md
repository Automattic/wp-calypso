Popover
=======

Popover is a React component to render a floating content modal. It is similar in purpose to a tooltip, but renders content of any sort, not only simple text. It anchors itself to its parent node, optionally by a specified direction. If the popover exceeds the bounds of the page in the direction it opens, its position will be flipped automatically.

## Usage

Render a Popover within the parent to which it should anchor:

```jsx
import { Popover } from '@wordpress/components';

function ToggleButton( { isVisible, toggleVisible } ) {
	return (
		<button onClick={ toggleVisible }>
			Toggle Popover!
			{ isVisible && (
				<Popover
					onClose={ toggleVisible }
					onClick={ ( event ) => event.stopPropagation() }
				>
					Popover is toggled!
				</Popover>
			) }
		</button>
	);
}
```

If a Popover is returned by your component, it will be shown. To hide the popover, simply omit it from your component's render value.

If you want Popover elements to render to a specific location on the page to allow style cascade to take effect, you must render a `Popover.Slot` further up the element tree:

```jsx
import { render } from '@wordpress/element';
import { Popover } from '@wordpress/components';
import Content from './Content';

const app = document.getElementById( 'app' );

render(
	<div>
		<Content />
		<Popover.Slot />
	</div>,
	app
);
```

## Props

The component accepts the following props. Props not included in this set will be applied to the element wrapping Popover content.

### focusOnMount

By default, the *first tabblable element* in the popover will receive focus when it mounts. This is the same as setting `focusOnMount` to `"firstElement"`. If you want to focus the container instead, you can set `focusOnMount` to `"container"`.

Set this prop to `false` to disable focus changing entirely. This should only be set when an appropriately accessible substitute behavior exists.

**Deprecation notice:** Before Gutenberg 3.2 this value was `Boolean` and the value `true` was equivalent to `"firstElement"`. This behaviour is deprecated and will cause a console warning message.

- Type: `String` or `Boolean`
- Required: No
- Default: `"firstElement"`

### position

The direction in which the popover should open relative to its parent node. Specify y- and x-axis as a space-separated string. Supports `"top"`, `"middle"`, `"bottom"` y axis, and `"left"`, `"center"`, `"right"` x axis.

- Type: `String`
- Required: No
- Default: `"top center"`

### children

The content to be displayed within the popover.

- Type: `Element`
- Required: Yes

### className

An optional additional class name to apply to the rendered popover.

- Type: `String`
- Required: No

### onClose

A callback invoked when the popover should be closed.

- Type: `Function`
- Required: No

### onClickOutside

A callback invoked when the user clicks outside the opened popover, passing the click event. The popover should be closed in response to this interaction. Defaults to `onClose`.

- Type: `Function`
- Required: No

### expandOnMobile

Opt-in prop to show popovers fullscreen on mobile, pass `false` in this prop to avoid this behavior.

 - Type: `Boolean`
 - Required: No
 - Default: `false`

 ### headerTitle

 Set this to customize the text that is shown in popover's header when it is fullscreen on mobile.

 - Type: `String`
 - Required: No

 ### noArrow

 Set this to hide the arrow which visually indicates what the popover is anchored to. Note that the arrow will not display if `position` is set to `"middle center"`.

 - Type: `Boolean`
 - Required: No
 - Default: `false`

## Methods

### refresh

Calling `refresh()` will force the Popover to recalculate its size and position. This is useful when a DOM change causes the anchor node to change position.

# InfoPopover

`InfoPopover` is a component based on `Popover` used to show a popover as a tooltip to a `Gridicon`.

## `InfoPopover` Properties

### `autoRtl { bool } - default: true`

Defines if the Popover should automatically be adjusted for right-to-left contexts.
`autoRtl={ true }` will swap `right` and `left` position props in RTL context.

### `position`

The `position` property can be one of the following values:

- `top`
- `top right`
- `right`
- `bottom right`
- `bottom`
- `bottom left`
- `left`
- `top left`

### `className`

The `className` lets you specify the style class that the element should have.

### `gaEventCategory`

The `gaEventCategory` lets you specify the Google Analyics Category that you want the toggle event to have.
Also requires the `popoverName` attribute.

### `popoverName`

The `popoverName` lets you specify the Google Analyics Event name that you want the toggle event to have.
Also requires the `gaEventCategory` attribute.

Turns into this even when opened:

```js
import { gaRecordEvent } from 'calypso/lib/analytics/ga';

gaRecordEvent( gaEventCategory, 'InfoPopover: ' + popoverName + 'Opened' );
```

### `onOpen`

The `onOpen` lets you specify a method to be called when the popover is opened. Does not interfere with `popoverName`.

### `onClose`

The `onClose` lets you specify a method to be called when the popover is closed.

### `ignoreContext`

The `ignoreContext` lets you specify a component that you want to be on the inside clickOutside context.
So a context that you want to ignore. In most cases this is not needed but if you want to also have a label
that can trigger the opening and closing of the InfoPopover then you need to pass in the label component as a reference.

## Basic `InfoPopover` Usage

```js
<InfoPopover position="bottom left">This is some informational text</InfoPopover>;
```

```js
const infoPopRef = React.createRef();
const moreInfoLabelRef = React.createRef();

function handleAction( event ) {
	infoPopRef.current.onClick( event );
}

function render() {
	return (
		<div>
			<button onClick={ handleAction } onKeyPress={ handleAction } ref={ moreInfoLabelRef }>
				More Info
			</button>
			<InfoPopover
				position="bottom left"
				ref={ infoPopRef }
				className="more-info"
				gaEventCategory="Reader"
				popoverName="More info in the reader"
				ignoreContext={ moreInfoLabelRef }
				onOpen={ () => console.log( 'opened!' ) }
				onClose={ () => console.log( 'closed!' ) }
			>
				This is some informational text
			</InfoPopover>
		</div>
	);
}
```

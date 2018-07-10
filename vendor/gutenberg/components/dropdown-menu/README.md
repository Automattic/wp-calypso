Dropdown Menu
=============

Dropdown Menu is a React component to render an expandable menu of buttons. It is similar in purpose to a `<select>` element, with the distinction that it does not maintain a value. Instead, each option behaves as an action button.

## Usage

Render a Dropdown Menu with a set of controls:

```jsx
import { DropdownMenu } from '@wordpress/components';

function DirectionMenu( { onMove } ) {
	return (
		<DropdownMenu
			icon="move"
			label="Select a direction"
			controls={ [
				{
					title: 'Up',
					icon: 'arrow-up-alt',
					onClick: () => onMove( 'up' )
				},
				{
					title: 'Right',
					icon: 'arrow-right-alt',
					onClick: () => onMove( 'right' )
				},
				{
					title: 'Down',
					icon: 'arrow-down-alt',
					onClick: () => onMove( 'down' )
				},
				{
					title: 'Left',
					icon: 'arrow-left-alt',
					onClick: () => onMove( 'left' )
				},
			] }
		/>
	);
}
```

## Props

The component accepts the following props:

### icon

The [Dashicon](https://developer.wordpress.org/resource/dashicons/) icon slug to be shown in the collapsed menu button.

- Type: `String`
- Required: No
- Default: `"menu"`

See also: [https://developer.wordpress.org/resource/dashicons/](https://developer.wordpress.org/resource/dashicons/)

### label

A human-readable label to present as accessibility text on the focused collapsed menu button.

- Type: `String`
- Required: Yes

### controls

An array of objects describing the options to be shown in the expanded menu.

Each object should include an `icon` [Dashicon](https://developer.wordpress.org/resource/dashicons/) slug string, a human-readable `title` string, and an `onClick` function callback to invoke when the option is selected.

- Type: `Array`
- Required: Yes

See also: [https://developer.wordpress.org/resource/dashicons/](https://developer.wordpress.org/resource/dashicons/)

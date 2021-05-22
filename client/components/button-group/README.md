# Button Group

Button group displays multiple related actions in a row to help with the display of those actions. Use to emphasize several buttons as a thematically-related set among other controls.

## Usage

```jsx
import ButtonGroup from 'calypso/components/button-group';
import { Button } from '@automattic/components';

function render() {
	return (
		<ButtonGroup>
			<Button compact>Approve</Button>
			<Button compact>Trash</Button>
			<Button compact>Spam</Button>
		</ButtonGroup>
	);
}
```

### General guidelines

- Follow the same guidelines as the [Button](./buttons) component.
- To manipulate or switch visible content, use the [SegmentedControl](./segmented-control) component instead.
- Group together actions that have a relationship.
- Be thoughtful about how multiple horizontally placed buttons will look and work on small screens.

## Related components

- See the [Button](./buttons) component for more detail.
- Use the [SegmentedControl](./segmented-control) component to switch content.
- To use a button with a secondary popover menu, use the [SplitButton](./split-button) component.
- To display a loading spinner with a button, use the [SpinnerButton](../design/spinner-button) component.

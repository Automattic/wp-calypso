# Disableable

This component is used as a wrapper of form elements that can potentially be disabled.

Whether they'll be disabled or not is specified by simply providing a boolean prop to the component.

## How to use

```js
import { Disableable } from '@automattic/components';
import { ToggleControl } from '@wordpress/components';

function render() {
	return (
		<Disableable disabled={ this.props.isDisabled }>
			<ToggleControl label="An example here" />
		</Disableable>
	);
}
```

## Props

- `disabled`: whether the form fields nested inside the component should be disabled (required).

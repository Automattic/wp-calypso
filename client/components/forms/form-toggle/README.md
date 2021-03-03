# Toggle

This component is used to implement toggle switches.

Currently, it is a temporary wrapper around `ToggleControl` from `@wordpress/components`.
It is very likely it will be completely replaced by it in the future.

## How to use

```js
import FormToggle from 'calypso/components/forms/form-toggle';

export default function MyComponent() {
	return (
		<div className="you-rock">
			<FormToggle
				checked={ this.props.checked }
				disabled={ this.props.disabled }
				onChange={ this.props.onChange }
				id="you-rock-uniquely"
				help="This is your new toggle field"
			>
				My label or label-like children
			</FormToggle>
		</div>
	);
}
```

## Props

- `checked`: (bool) the current status of the toggle.
- `disabled`: (bool) whether the toggle should be in the disabled state.
- `onChange`: (callback) what should be executed once the user clicks the toggle.
- `help`: (node) a string or element that serves as a help text for the toggle field.
- `id`: (string) the id of the checkbox and the for attribute of the label, should be unique.

# Toggle

This component is used to implement toggle switches.

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
				aria-label={ this.props[ 'aria-label' ] }
				id="you-rock-uniquely"
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
- `aria-label`: (string) a label that should be added to the control for accessibility purposes.
- `id`: (string) the id of the checkbox and the for attribute of the label, should be unique.

Toggle
=======

This component is used to implement toggle switches.

#### How to use:

```js
import FormToggle from 'components/forms/form-toggle';

export default function MyComponent() {
	return (
		<div className="you-rock">
			<FormToggle
				checked={ this.props.checked }
				toggling={ this.props.toggling }
				disabled={ this.props.disabled }
				onChange={ this.props.onChange }
				id="you-rock-uniquely"
			/>
		</div>
	);
}
```

#### Props

* `checked`: (bool) the current status of the toggle.
* `toggling`: (bool) whether the toggle is in the middle of being performed.
* `disabled`: (bool) whether the toggle should be in the disabled state.
* `onChange`: (callback) what should be executed once the user clicks the toggle.
* `id`: (string) the id of the checkbox and the for attribute of the label, should be unique.

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
				onKeyDown={ this.props.onKeyDown }
				className={ this.props.className }
				wrapperClassName={ this.props.wrapperClassName }
				aria-label={ this.props['aria-label'] }
				id="you-rock-uniquely"
			>
				My label or label-like children
			</FormToggle>
		</div>
	);
}
```

#### Props

* `checked`: (bool) the current status of the toggle.
* `toggling`: (bool) whether the toggle is in the middle of being performed.
* `disabled`: (bool) whether the toggle should be in the disabled state.
* `onChange`: (callback) what should be executed once the user clicks the toggle.
* `onKeyDown`: (callback) what should be executed once the user presses a key while the toggle is selected.
* `className`: (string) a class name that should be added to the toggle `input` control.
* `wrapperClassName`: (string) a class name that should be added to the `div` wrapping the component.
* `aria-label`: (string) a label that should be added to the control for accessibility purposes.
* `id`: (string) the id of the checkbox and the for attribute of the label, should be unique.

Disabled
========

Disabled is a component which disables descendant tabbable elements and prevents pointer interaction.

## Usage

Assuming you have a form component, you can disable all form inputs by wrapping the form with `<Disabled>`.

```jsx
const DisableToggleForm = withState( {
	isDisabled: true,
} )( ( { isDisabled, setState } ) => {
	let form = <form><input /></form>;

	if ( isDisabled ) {
		form = <Disabled>{ form }</Disabled>;
	}

	const toggleDisabled = setState( ( state ) => ( {
		isDisabled: ! state.isDisabled,
	} ) );

	return (
		<div>
			{ form }
			<button onClick={ toggleDisabled }>
				Toggle Disabled
			</button>
		</div>
	);
} )
```

A component can detect if it has been wrapped in a `<Disabled>` by accessing its [context](https://reactjs.org/docs/context.html) using `Disabled.Consumer`.

```jsx
function CustomButton() {
	return (
		<Disabled.Consumer>
			{ ( isDisabled ) => (
				<button
					{ ...this.props }
					style={ { opacity: isDisabled ? 0.5 : 1 } }
				/>
			) }
		</Disabled.Consumer>
	);
}
```

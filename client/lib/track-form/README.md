# Track Form Higher Order Component

This HoC provides an alternative to `dirtyLinkedState` mixin for ES6 React component and functional components.

## Usage

```javascript
const MyComponent = ( { fields, dirtyFields, updateFields, clearDirtyFields } ) => {
	const submit = () => {
		const updatedFields = omit( fields, dirtyFields );
		// Do what you want with fields and dirtyFields

		clearDirtyFields();
	};

	const reset = () => {
		clearDirtyFields();
		replaceFields( {
			key: 'value',
		} );
	};

	const updateName = ( event ) => {
		updateFields( {
			name: event.target.value,
		} );
	};

	return (
		<Form onSubmit={ submit }>
			<FormInput value={ fields.name } onChange={ updateName } />
			<button onClick={ reset }>Reset</button>
		</Form>
	);
};

export default trackForm( MyComponent );
```

This HoC exposes the following props:

### `fields`

<table>
	<tr><th>Type</th><td>Object</td></tr>
	<tr><th>Default</th><td><code>{}</code></td></tr>
</table>

The current values of the form fields

### `dirtyFields`

<table>
	<tr><th>Type</th><td>Object</td></tr>
	<tr><th>Default</th><td><code>{}</code></td></tr>
</table>

The fields which have been updated since mounting or since the last call to `clearDirtyFields`

### `updateFields`

<table>
	<tr><th>Type</th><td>Function</td></tr>
</table>

A function that takes two parameters `updateFields( updatedFields, callback )` and merges the updateFields into the `fields` prop.
It also marks the updated fields as dirty. The `callback` argument is optional.

### `replaceFields`

<table>
	<tr><th>Type</th><td>Function</td></tr>
</table>

This function replaces the field values passed as an argument without updating the dirty fields.
This is usefull when you want to reset form fields to an already persisted value.

### `clearDirtyFields`

<table>
	<tr><th>Type</th><td>Function</td></tr>
</table>

A function we call to clear the dirty fields

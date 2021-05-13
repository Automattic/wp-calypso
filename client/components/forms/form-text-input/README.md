# Form Text Input

`<FormTextInput />` is a React component suited for rendering an `<input />` field enhanced with Calypso-specific styling and validity indicators.

## Usage

Render as you would an `<input />` element. Any props passed not included in the props documentation below will be applied to the rendered `<input />` element.

```jsx
export default function MyForm() {
	return <FormTextInput isValid initialValue="Hello World!" />;
}
```

## Props

### `isError`

<table>
	<tr><td>Type</td><td>Boolean</td></tr>
	<tr><td>Required</td><td>No</td></tr>
</table>

Whether the input should be rendered with error styling.

### `isValid`

<table>
	<tr><td>Type</td><td>Boolean</td></tr>
	<tr><td>Required</td><td>No</td></tr>
</table>

Whether the input should be rendered with valid (success) styling.

### `selectOnFocus`

<table>
	<tr><td>Type</td><td>Boolean</td></tr>
	<tr><td>Required</td><td>No</td></tr>
</table>

Whether the value should be selected when the input is focused.

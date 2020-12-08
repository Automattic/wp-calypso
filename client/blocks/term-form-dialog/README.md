# TermFormDialog

The `TermFormDialog` component renders a dialog that allows to create/edit Terms.

## Usage

```jsx
import TermFormDialog from 'calypso/blocks/term-form-dialog';

<TermFormDialog showDialog={ true } taxonomy="category" onClose={ callback } postType="post" />;
```

## Props

### `postType`

<table>
	<tr><th>Type</th><td>String</td></tr>
	<tr><th>Required</th><td>Yes</td></tr>
</table>

The type of post that uses this taxonomy.

### `taxonomy`

<table>
	<tr><th>Type</th><td>String</td></tr>
	<tr><th>Required</th><td>Yes</td></tr>
</table>

The type of taxonomy to add.

### `showDialog`

<table>
	<tr><th>Type</th><td>Boolean</td></tr>
	<tr><th>Required</th><td>No</td></tr>
	<tr><th>Default</th><td><code>false</code></td></tr>
</table>

Whether the dialog is shown/hidden

### `onClose`

<table>
	<tr><th>Type</th><td>Function</td></tr>
	<tr><th>Required</th><td>No</td></tr>
	<tr><th>Default</th><td><code>() => {}</code></td></tr>
</table>

A function invoked when the dialog is closed.

### `onSuccess`

<table>
	<tr><th>Type</th><td>Function</td></tr>
	<tr><th>Required</th><td>No</td></tr>
	<tr><th>Default</th><td><code>() => {}</code></td></tr>
</table>

A function invoked when the term is saved. It receives the term as a parameter.

### `showDescriptionInput`

<table>
	<tr><th>Type</th><td>Boolean</td></tr>
	<tr><th>Required</th><td>No</td></tr>
	<tr><th>Default</th><td><code>false</code></td></tr>
</table>

Toggles the display of the term description field.

### `term`

<table>
	<tr><th>Type</th><td>Object</td></tr>
	<tr><th>Required</th><td>No</td></tr>
</table>

The term object to edit. If no term is provided, a new term will be created.

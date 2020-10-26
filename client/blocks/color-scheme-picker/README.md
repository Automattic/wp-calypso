# Color Scheme Picker

This component renders a Color Scheme Picker.

When using the component without any props, any selection will immediately be saved to the `colorSchemes` property in the `calypso_settings`.
When the props `temporarySelection` and `onSelection` are provided, a selection will only be set locally and the provided onSelection handler called (e.g. to save the selection at a later stage via a save button).

## Usage

```jsx
import ColorSchemePicker from 'calypso/blocks/color-scheme-picker';

handleColorSchemeSelection = ( event ) => {
	console.log( event.currentTarget.value );
};

function render() {
	return <ColorSchemePicker temporarySelection onSelection={ this.handleColorSchemeSelection } />;
}
```

## Props

The following props can be passed to the ColorSchemePicker component:

### `temporarySelection`

<table>
	<tr><td>Type</td><td>Boolean</td></tr>
	<tr><td>Required</td><td>No</td></tr>
</table>

### `onSelection`

<table>
	<tr><td>Type</td><td>Function</td></tr>
	<tr><td>Required</td><td>No</td></tr>
</table>

#### Connect Props

### `colorSchemePreference`

<table>
	<tr><td>Type</td><td>String</td></tr>
</table>

The selected color scheme (Default: default).

### `saveColorSchemePreference`

<table>
	<tr><td>Type</td><td>Function</td></tr>
</table>

Set/Save the color scheme selection.

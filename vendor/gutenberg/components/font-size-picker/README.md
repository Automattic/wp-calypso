FontSizePicker
========

FontSizePicker is a React component that renders a UI that allows users to select a font size.
The component renders a series of buttons that allow the user to select predefined (common) font sizes and contains a range slider that enables the user to select custom font sizes (by choosing the value.

## Usage


```jsx
import { Dropdown } from '@wordpress/components';

function MyFontSizePicker() {
	return (
		<FontSizePicker
			fontSizes={ [
				{ shortName: 'S', size: 12 },
				{ shortName: 'M', size: 16 }
			] }
			fallbackFontSize={ fallbackFontSize }
			value={ fontSize }
			onChange={ this.setFontSize }
		/>
	);
}
```

## Props

The component accepts the following props:

### fontSizes

An array of font size objects. The object should contain properties size, name, shortName.
The property "size" contains a number with the font size value. The "shortName" property includes a small label used in the buttons. Property "name" is used as the label when shortName is not provided.

- Type: `Array`
- Required: No

### fallbackFontSize

In no value exists this prop contains the font size picker slider starting position.

- Type: `Number`
- Required: No

### value

The current font size value. If a button value matches the font size value that button is pressed. RangeControl is rendered with this value.

- Type: `Number`
- Required: No

## onChange

A function that receives the new font size value.
If onChange is called without any parameter, it should reset the value, attending to what reset means in that context, e.g., set the font size to undefined or set the font size a starting value.

- Type: `function`
- Required: Yes


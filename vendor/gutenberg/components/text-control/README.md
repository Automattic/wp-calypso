TextControl
=======

TextControl is normally used to generate text input fields. But can be used to generate other input types.


## Usage

Render a user interface to input the name of an additional css class.
```jsx
	<TextControl
		label={ __( 'Additional CSS Class' ) }
		value={ className }
		onChange={ onChange }
	/>
```

## Props

The set of props accepted by the component will be specified below.
Props not included in this set will be applied to the input element.

### label

If this property is added, a label will be generated using label property as the content.

- Type: `String`
- Required: No

### help

If this property is added, a help text will be generated using help property as the content.

- Type: `String`
- Required: No

### type

Type of the input element to render. Defaults to "text".

- Type: `String`
- Required: No
- Default: "text"

### value

The current value of the input.

- Type: `Number`
- Required: Yes

### className

The class that will be added with "components-base-control" to the classes of the wrapper div.
If no className is passed only components-base-control is used.

- Type: `String`
- Required: No

### onChange

A function that receives the value of the input.

- Type: `function`
- Required: Yes

SelectControl
=======

SelectControl component is used to generate select input fields.


## Usage

Render a user interface to select the size of an image.
```jsx
	<SelectControl
		label={ __( 'Size' ) }
		value={ size }
		options={ map( availableSizes, ( size, name ) => ( {
			value: size,
			label: startCase( name ),
		} ) ) }
		onChange={ onChange }
	/>
```

Render a user interface to select multiple users from a list.
```jsx
	<SelectControl
		multiple
		label={ __( 'Select some users:' ) }
		value={ this.state.users } // e.g: value = [ 'a', 'c' ]
		onChange={ ( users ) => { this.setState( { users } ) } }
		options={ [
			{ value: 'a', label: 'User A' },
			{ value: 'b', label: 'User B' },
			{ value: 'c', label: 'User c' },
		] }
	/>
```

## Props

The set of props accepted by the component will be specified below.
Props not included in this set will be applied to the select element.
One important prop to refer is value, if multiple is true,
value should be an array with the values of the selected options.
If multiple is false value should be equal to the value of the selected option.

### label

If this property is added, a label will be generated using label property as the content.

- Type: `String`
- Required: No

### help

If this property is added, a help text will be generated using help property as the content.

- Type: `String`
- Required: No

### multiple

If this property is added, multiple values can be selected. The value passed should be an array.

- Type: `Boolean`
- Required: No

### options

An array of objects containing the following properties:
* `label`: (string) The label to be shown to the user.
* `value`: (Object) The internal value used to choose the selected value. This is also the value passed to onChange when the option is selected.

- Type: `Array`
- Required: No

### onChange

A function that receives the value of the new option that is being selected as input.
If multiple is true the value received is an array of the selected value.
If multiple is false the value received is a single value with the new selected value.

- Type: `function`
- Required: Yes

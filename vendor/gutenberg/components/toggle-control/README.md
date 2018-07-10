ToggleControl
=======

ToggleControl is used to generate a toggle user interface.


## Usage

Render a user interface to change fixed background setting.
```jsx
	<ToggleControl
		label={ __( 'Fixed Background' ) }
		checked={ !! hasParallax }
		help={ ( checked ) => checked ? __( 'Has fixed background.' ) : __( 'No fixed background.' ) } 
		onChange={ toggleParallax }
	/>
```

## Props

The component accepts the following props:

### label

If this property is added, a label will be generated using label property as the content.

- Type: `String`
- Required: No

### help

If this property is added, a help text will be generated using help property as the content.

- Type: `String` | `Function`
- Required: No

### checked

If checked is true the toggle will be checked. If checked is false the toggle will be unchecked.
If no value is passed the toggle will be unchecked.

- Type: `Boolean`
- Required: No

### onChange

A function that receives the checked state (boolean) as input.

- Type: `function`
- Required: Yes


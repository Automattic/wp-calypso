CheckboxControl
=======

CheckboxControl component is used to generate a checkbox input field.


## Usage

Render an is author checkbox:
```jsx
    <CheckboxControl
        heading="User"
        label="Is author"
        help="Is the user a author or not?"
        checked={ checked }
        onChange={ onChange }
    />
```

## Props

The set of props accepted by the component will be specified below.
Props not included in this set will be applied to the input element.

### heading

A heading for the input field, that appears above the checkbox. If the prop is not passed no heading will be rendered. 

- Type: `String`
- Required: No


### label

A label for the input field, that appears at the side of the checkbox.
The prop will be rendered as content a label element.
If no prop is passed an empty label is rendered.

- Type: `String`
- Required: No

### help

If this property is added, a help text will be generated using help property as the content.

- Type: `String`
- Required: No

### checked

If checked is true the checkbox will be checked. If checked is false the checkbox will be unchecked.
If no value is passed the checkbox will be unchecked.

- Type: `Boolean`
- Required: No

### onChange

A function that receives the checked state (boolean) as input.

- Type: `function`
- Required: Yes

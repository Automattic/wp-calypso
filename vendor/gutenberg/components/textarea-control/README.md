TextareaControl
=======

TextareaControl is used to generate textarea input fields.


## Usage

Render a user interface to input the name of an additional CSS class.
```jsx
    <TextareaControl
        label="Text"
        value={ value }
        help="Enter some text"
        onChange={ onChange }
    />
```

## Props

The set of props accepted by the component will be specified below.
Props not included in this set will be applied to the textarea element.

### label

If this property is added, a label will be generated using label property as the content.

- Type: `String`
- Required: No

### help

If this property is added, a help text will be generated using help property as the content.

- Type: `String`
- Required: No

### rows

The number of rows the textarea should contain. Defaults to four.

- Type: `String`
- Required: No
- Default: 4

### value

The current value of the textarea.

- Type: `String`
- Required: Yes

### onChange

A function that receives the new value of the textarea each time it changes.

- Type: `function`
- Required: Yes

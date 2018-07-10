BaseControl
=======

BaseControl component is used to generate labels and help text for components handling user inputs.


## Usage

Render a BaseControl for a textarea input:
```jsx
	<BaseControl
		id="textarea-1" 
		label="Text"
		help="Enter some text"
	>
        <textarea
            id="textarea-1"
            onChange={ onChangeValue }
            value={ value }
        />
    </BaseControl>
```

## Props

The component accepts the following props:

### id

The id of the element to which labels and help text are being generated. That element should be passed as a child.

- Type: `String`
- Required: Yes


### label

If this property is added, a label will be generated using label property as the content.

- Type: `String`
- Required: No

### help

If this property is added, a help text will be generated using help property as the content.

- Type: `String`
- Required: No

### className

The class that will be added with "components-base-control" to the classes of the wrapper div.
If no className is passed only components-base-control is used.

- Type: `String`
- Required: No

### children

The content to be displayed within the BaseControl.

- Type: `Element`
- Required: Yes

RangeControl
=======

RangeControl component is used to create range slider to input numerical values.


## Usage

Render a user interface to select the number of columns between 2 and 10.
```jsx
    <RangeControl
        label="Columns"
        value={ columns }
        onChange={ onChange }
        min={ 2 }
        max={ 10 }
    />
```

## Props

The set of props accepted by the component will be specified below.
Props not included in this set will be applied to the input elements.

### label

If this property is added, a label will be generated using label property as the content.

- Type: `String`
- Required: No

### help

If this property is added, a help text will be generated using help property as the content.

- Type: `String`
- Required: No


### beforeIcon

If this property is added, a DashIcon component will be rendered before the slider with the icon equal to beforeIcon

- Type: `String`
- Required: No

### afterIcon

If this property is added, a DashIcon component will be rendered after the slider with the icon equal to afterIcon

- Type: `String`
- Required: No

### allowReset

If this property is true, a button to reset the the slider is rendered.

- Type: `Boolean`
- Required: No

### initialPosition

In no value exists this prop contains the slider starting position.

- Type: `Number`
- Required: No

### value

The current value of the range slider.

- Type: `Number`
- Required: Yes

### onChange

A function that receives the new value.
If allowReset is true, when onChange is called without any parameter passed it should reset the value.

- Type: `function`
- Required: Yes

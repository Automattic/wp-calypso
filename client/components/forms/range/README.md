# Range

Range is a React component used to render a range input field. It is essentially an enhanced version of `<input type="range" />`, enabling support for a value tooltip and content to be shown at the ends of the range field.

![Demo](https://cldup.com/06j_3TLMET-3000x3000.png)

## Usage

Refer to the following code snippet for a typical usage example:

```jsx
<Range
	minContent={ <Gridicon icon="minus-small" /> }
	maxContent={ <Gridicon icon="plus-small" /> }
	max="100"
	value={ this.state.rangeValue }
	onChange={ this.onChange }
	showValueLabel
/>;
```

The Range component does not track its own value state, much like any other form input in React. Refer to the <a href="http://facebook.github.io/react/docs/forms.html">React Forms documentation</a> for more guidance on tracking form value state.

## Props

Props not listed below will be passed automatically to the rendered range input element.

### `minContent` (`string` or `Element`)

Content to be shown preceding the range input.

### `maxContent` (`string` or `Element`)

Content to be shown following the range input.

### `showValueLabel` (`boolean`)

A boolean indicating whether a tooltip is to be shown with the current range value.

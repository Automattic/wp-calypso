Counted Textarea
===================

Counted Textarea is a React form component which renders a `<textarea />` accompanied by a character count display.

![Demo](https://cldup.com/jF7wmrOxdM-1200x1200.png)

## Usage

`<CountedTextarea />` expects to be rendered as a [controlled component](https://facebook.github.io/react/docs/forms.html#controlled-components), meaning that it will only behave as expected if passed a `value` prop. The textarea will automatically keep the character count in sync as the value prop is changed. With the exception of `className`, all props will be transferred to the child `<textarea />`. If a `className` prop is passed, it will be applied to the wrapper node.

```jsx
var React = require( 'react' ),
	CountedTextarea = require( 'components/forms/counted-textarea' );

module.exports = React.createClass( {
	displayName: 'MyComponent',

	getInitialState: function() {
		return { value: '' };
	},

	onChange: function( event ) {
		this.setState( { value: event.target.value } );
	},

	render: function() {
		return <CountedTextarea value={ this.state.value } onChange={ this.onChange } />
	}
} );
```

## Props

The following props are made available:

### `className`

If a `className` prop is passed, it will be applied to the wrapper node.

### `acceptableLength`

If passed and the value of the input exceeds the acceptable character count length, warning styles will be applied to the rendered output. If a maximum length is desired, use the browser default [`maxLength` attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textareaattr-maxlength).

Token Field
===========

A `TokenField` is a field similar to the tags and categories fields in the interim editor chrome, or the "to" field in Mail on OS X. Tokens can be entered by typing them or selecting them from a list of suggested tokens.

Up to one hundred suggestions that match what the user has typed so far will be shown from which the user can pick from (auto-complete). Tokens are separated by the "," character. Suggetions can be selected with the up or down arrows and added with the tab or enter key.

The `value` property is handled in a manner similar to controlled form components. See [Forms](http://facebook.github.io/react/docs/forms.html) in the React Documentation for more information.

### Keyboard Accessibility

- `left arrow` - if input field is empty, move insertion point before previous token
- `right arrow` - if input field is empty, move insertion point after next token
- `up arrow` - select previous suggestion
- `down arrow` - select next suggestion
- `tab` / `enter` - if suggestion selected, insert suggestion as a new token; otherwise, insert value typed into input as new token
- `comma` - insert value typed into input as new token

### Properties

- `value` - An array of strings to display as tokens in the field
- `valueTransform` - Function to call to transform tokens for display.  This is
  used to decode HTML entities embedded in tags - otherwise entities like `&`
  in tag names are double-encoded like `&amp;` (once by the REST API and once
  by React).
- `onChange` - Function to call when the tokens have changed. An array of new tokens is passed to the callback
- `suggestions` - An array of strings to present to the user as suggested tokens
- `maxSuggestions` - The maximum number of suggestions to display at a time

### Example

```jsx
React.createClass( {
	render: function() {
		return (
			<TokenField
				value={ this.state.tokens }
				onChange={ this.onTokensChange }
				suggestions={ this.state.suggestions } />
		);
	},

	onTokensChange: function( event ) {
		this.setState( { tokens: event.value } );
	}
} );
```

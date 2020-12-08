# Token Field

A `TokenField` is a field similar to the tags and categories fields in the interim editor chrome, or the "to" field in Mail on OS X. Tokens can be entered by typing them or selecting them from a list of suggested tokens.

Up to one hundred suggestions that match what the user has typed so far will be shown from which the user can pick from (auto-complete). Tokens are separated by the "," character. Suggetions can be selected with the up or down arrows and added with the tab or enter key.

The `value` property is handled in a manner similar to controlled form components. See [Forms](https://facebook.github.io/react/docs/forms.html) in the React Documentation for more information.

## Keyboard Accessibility

- `left arrow` - if input field is empty, move insertion point before previous token
- `right arrow` - if input field is empty, move insertion point after next token
- `up arrow` - select previous suggestion
- `down arrow` - select next suggestion
- `tab` / `enter` - if suggestion selected, insert suggestion as a new token; otherwise, insert value typed into input as new token
- `comma` - insert value typed into input as new token

## Properties

- `value` - An array of strings or objects to display as tokens in the field. If objects are present in the array, they **must** have a property of `value`. Here is an example object that could be passed in as a value:

  ```
  {
  	value: '(string) The value of the token.',
  	status: "(string) One of 'error', 'validating', or 'success'. Applies styles to token.",
  	tooltip: '(string) If not falsey, will add a tooltip to the token.',
  	onMouserEnter: '(function) Function to call when onMouseEnter event triggered on token.',
  	onMouseLeave: '(function) Function to call when onMouseLeave is triggered on token.'
  }
  ```

- `displayTransform` - Function to call to transform tokens for display. (In
  the editor, this is needed to decode HTML entities embedded in tags -
  otherwise entities like `&` in tag names are double-encoded like `&amp;`,
  once by the REST API and once by React).

- `saveTransform` - Function to call to transform tokens for saving. The
  default is to trim the token value. This function is also applied when
  matching suggestions against the current value so that matching works
  correctly with leading or trailing spaces. (In the editor, this is needed to
  remove leading and trailing spaces from tag names, like wp-admin does.
  Otherwise the REST API won't save them.)

- `onChange` - Function to call when the tokens have changed. An array of new
  tokens is passed to the callback.

- `onFocus` - Function to call when the TokenField has been focused on. The event is passed to the callback. Useful for analytics.

- `suggestions` - An array of strings to present to the user as suggested
  tokens.

- `maxSuggestions` - The maximum number of suggestions to display at a time.

- `tokenizeOnSpace` - If true, will add a token when `TokenField` is focused and `space` is pressed.

- `isBorderless` - When true, renders tokens as without a background.

- `maxLength` - If passed, `TokenField` will disable ability to add new tokens once number of tokens is greater than or equal to `maxLength`.

- `disabled` - When true, tokens are not able to be added or removed.

- `placeholder` - If passed, the `TokenField` input will show a placeholder string if no value tokens are present.

- `id` - the ID of the token input, should be unique.

- `isExpanded` - If true, the `TokenField` input will always keep the suggestion list expanded.

## Example

```jsx
class MyComponent extends React.Component {
	onTokensChange( event ) {
		this.setState( { tokens: event.value } );
	}

	render() {
		return (
			<TokenField
				value={ this.state.tokens }
				onChange={ this.onTokensChange }
				suggestions={ this.state.suggestions }
			/>
		);
	}
}
```

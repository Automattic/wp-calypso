Emojify
=========

This module includes functionality for converting strings that could possibly contain UTF emoji codes into a graphical web representation.

This is desirable since implementations are inconsistent or non-existant.

## Usage
```js
// require the module
var Emojify = require( 'components/emojify' ),
	textToEmojify = 'This will be converted 🙈🙉🙊';

	// more component stuff
	// ...
	render( <div><p>This text will be unaffected</p><Emojify size="72">{ textToEmojify }</Emojify></div> );

```

## Props

### `children`

<table>
	<tr><th>Type</th><td>Text|Components</td></tr>
	<tr><th>Required</th><td>Yes</td></tr>
	<tr><th>Default</th><td><code>none</code></td></tr>
</table>

Typically a string that you want to search for UTF emoji

### `className`

<table>
	<tr><th>Type</th><td>String</td></tr>
	<tr><th>Required</th><td>No</td></tr>
	<tr><th>Default</th><td><code>emojify__emoji</code></td></tr>
</table>

classname applied to the image

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
	render( <div><p>This text will be unaffected</p><Emojify>{ textToEmojify }</Emojify></div> );

```

## Props

| property       | type             | required | default            | comment |
| -------------- | ---------------- | -------- | ------------------ | ------- |
| `children`     | Text\|Components | yes      | none               | Typically a string that you want to search for UTF emoji |
| `imgClassName` | String           | no       | `"emojify__emoji"` | classname applied to the image |
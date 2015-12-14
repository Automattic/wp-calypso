Emojify
=========

This module includes functionality for converting strings that could possibly contain UTF emoji codes into a graphical web representation.

This is desirable since implementations are inconsistent or non-existant.

# Usage
```js
// require the module
var Emojify = require( 'components/emojify' ),
	textToEmojify = 'This will be converted 🙈🙉🙊';

ReactDom.render( <div><p>This text will be unaffected</p><Emojify size="72">{ textToEmojify }</Emojify></div> );

```

CSS
```css
// Emoji!!
.emojified__emoji {
	height: 18px;
	width: 18px;
	vertical-align: middle;
}

```

* The `<Emojify>` component requires exactly one child and it must be a text node.
* The `size` property is optional:
	* It defaults to `'36x36'`
	* Available options are determined by your CDN

# Requires
### [punycode](https://github.com/bestiejs/punycode.js/) -- built into node since v0.6.2

# Attributions
The parsing code was adapted from [this gist](https://gist.github.com/thomasboyt/b5ef9ed8606ce6d93982)

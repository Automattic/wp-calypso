Shortcode
=========

Utility functions for working with WordPress shortcodes. These functions largely mirror those made available in the core WordPress `wp.shortcode` JavaScript class. More information about shortcodes is available [at the WordPress Codex](https://codex.wordpress.org/Shortcode_API).

## Usage

```js
import Shortcode from 'lib/shortcode';

const value = Shortcode.stringify( {
	tag: 'foo',
	attrs: {
		bar: 'baz'
	}
} );

// -> [foo bar="baz"][/foo]

const parsed = Shortcode.parse( value );
// -> { tag: 'foo', type: 'closed', attrs: { named: { bar: 'baz' }, numeric: [] } }
```

## Shortcode Object

A shortcode object is comprised of the following properties:

### `tag`

The name of the shortcode.

See: https://codex.wordpress.org/Shortcode_API#Names

### `type`

The type of shortcode, `closed`, `self-closing`, or `single`.

See: https://codex.wordpress.org/Shortcode_API#Enclosing_vs_self-closing_shortcodes

### `attrs`

The attributes of the shortcode. This can be a string representation of attributes (`bar="baz"`), an key-value pair of named attributes (`{ bar: 'baz' }`), an array of "numeric" attributes (`[ 'bar' ]`), or an object of both named and numeric attributes.

### `content`

The contents of a shortcode, between the opening and closing tags.

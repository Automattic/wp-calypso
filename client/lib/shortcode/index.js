/**
 * External dependencies
 */
var memoize = require( 'lodash/memoize' ),
	isEqual = require( 'lodash/isEqual' );

/**
 * Module variables
 */
var Shortcode = {},
	REGEXP_ATTR_STRING = /(\w+)\s*=\s*"([^"]*)"(?:\s|$)|(\w+)\s*=\s*\'([^\']*)\'(?:\s|$)|(\w+)\s*=\s*([^\s\'"]+)(?:\s|$)|"([^"]*)"(?:\s|$)|(\S+)(?:\s|$)/g,
	REGEXP_SHORTCODE = /\[(\[?)([^\[\]\/\s\u00a0\u200b]+)(?![\w-])([^\]\/]*(?:\/(?!\])[^\]\/]*)*?)(?:(\/)\]|\](?:([^\[]*(?:\[(?!\/\2\])[^\[]*)*)(\[\/\2\]))?)(\]?)/;

/**
 * Given a string, parses shortcode attributes and returns an object containing
 * named and numeric attributes. Named attributes are assigned on a key/value
 * basis, while numeric attributes are treated as an array. Named attributes
 * can be formatted as either `name="value"`, `name='value'`, or `name=value`.
 * Numeric attributes can be formatted as `"value"` or just `value`.
 *
 * @see https://github.com/WordPress/WordPress/blob/master/wp-includes/js/shortcode.js
 *
 * @param  {string} text A shortcode attribute string
 * @return {Object}      An object of attributes, split as named and numeric
 */
Shortcode.parseAttributes = memoize( function( text ) {
	var named = {},
		numeric = [],
		match;

	// Map zero-width spaces to actual spaces.
	text = text.replace( /[\u00a0\u200b]/g, ' ' );

	// Match and normalize attributes.
	while ( ( match = REGEXP_ATTR_STRING.exec( text ) ) ) {
		if ( match[1] ) {
			named[ match[1].toLowerCase() ] = match[2];
		} else if ( match[3] ) {
			named[ match[3].toLowerCase() ] = match[4];
		} else if ( match[5] ) {
			named[ match[5].toLowerCase() ] = match[6];
		} else if ( match[7] ) {
			numeric.push( match[7] );
		} else if ( match[8] ) {
			numeric.push( match[8] );
		}
	}

	return {
		named: named,
		numeric: numeric
	};
} );

/**
 * Given a value of mixed type, returns a normalized object of named and
 * numeric attributes.
 *
 * @see parseAttributes
 *
 * @param  {*}      attributes An object to normalize
 * @return {Object}            An object of attributes, split as named and numeric
 */
Shortcode.normalizeAttributes = function( attributes ) {
	var named, numeric;

	if ( 'string' === typeof attributes ) {
		return Shortcode.parseAttributes( attributes );
	} else if ( Array.isArray( attributes ) ) {
		numeric = attributes;
	} else if ( 'object' === typeof attributes && isEqual( Object.keys( attributes ), [ 'named', 'numeric' ] ) ) {
		return attributes;
	} else if ( 'object' === typeof attributes ) {
		named = attributes;
	}

	return {
		named: named || {},
		numeric: numeric || []
	};
};

/**
 * Given a shortcode object, returns the string value of that shortcode.
 *
 * @param  {Object} shortcode A shortcode object
 * @return {string}           The string value of the shortcode
 */
Shortcode.stringify = function( shortcode ) {
	var text = '[' + shortcode.tag,
		attributes = Shortcode.normalizeAttributes( shortcode.attrs );

	Object.keys( attributes.named ).forEach( function( name ) {
		var value = attributes.named[ name ];
		text += ' ' + name + '="' + value + '"';
	} );

	attributes.numeric.forEach( function( value ) {
		if ( /\s/.test( value ) ) {
			text += ' "' + value + '"';
		} else {
			text += ' ' + value;
		}
	} );

	// If the tag is marked as `single` or `self-closing`, close the
	// tag and ignore any additional content.
	if ( 'single' === shortcode.type ) {
		return text + ']';
	} else if ( 'self-closing' === shortcode.type ) {
		return text + ' /]';
	}

	// Complete the opening tag.
	text += ']';

	if ( shortcode.content ) {
		text += shortcode.content;
	}

	// Add the closing tag.
	return text + '[/' + shortcode.tag + ']';
};

/**
 * Given a shortcode string, returns the object value of that shortcode.
 *
 * @param  {string} shortcode A shortcode string
 * @return {Object}           The object value of the shortcode
 */
Shortcode.parse = function( shortcode ) {
	var match = shortcode.match( REGEXP_SHORTCODE ),
		type, parsed;

	if ( ! match ) {
		return null;
	}

	if ( match[ 4 ] ) {
		type = 'self-closing';
	} else if ( match[ 6 ] ) {
		type = 'closed';
	} else {
		type = 'single';
	}

	parsed = {
		tag: match[ 2 ],
		type: type
	};

	if ( /\S/.test( match[ 3 ] ) ) {
		parsed.attrs = Shortcode.parseAttributes( match[ 3 ] );
	}

	if ( match[ 5 ] ) {
		parsed.content = match[ 5 ];
	}

	return parsed;
};

/**
 * Generate a RegExp to identify a shortcode
 *
 * The base regex is functionally equivalent to the one found in
 * `get_shortcode_regex()` in `wp-includes/shortcodes.php`.
 *
 * Capture groups:
 *
 * 1. An extra `[` to allow for escaping shortcodes with double `[[]]`
 * 2. The shortcode name
 * 3. The shortcode argument list
 * 4. The self closing `/`
 * 5. The content of a shortcode when it wraps some content.
 * 6. The closing tag.
 * 7. An extra `]` to allow for escaping shortcodes with double `[[]]`
 *
 * @param {String} tag - shortcode name
 * @return {RegExp} regular expression
 */
Shortcode.regexp = memoize( function( tag ) {
	return new RegExp( '\\[(\\[?)(' + tag + ')(?![\\w-])([^\\]\\/]*(?:\\/(?!\\])[^\\]\\/]*)*?)(?:(\\/)\\]|\\](?:([^\\[]*(?:\\[(?!\\/\\2\\])[^\\[]*)*)(\\[\\/\\2\\]))?)(\\]?)', 'g' );
} );

/**
 * Find the next matching shortcode
 *
 * Given a shortcode `tag`, a block of `text`, and an optional starting
 * `index`, returns the next matching shortcode or `undefined`.
 *
 * Shortcodes are formatted as an object that contains the match
 * `content`, the matching `index`, and the parsed `shortcode` object.
 *
 * @param {String} tag - shortcode tagName (e.g. gallery)
 * @param {String} text - text to search for next shortcode
 * @param {Number} index - last index
 *
 * @return {Object|void} next match
 */
Shortcode.next = function( tag, text, index ) {
	var re = Shortcode.regexp( tag ),
		match, result;

	re.lastIndex = index || 0;
	match = re.exec( text );

	if ( ! match ) {
		return;
	}

	// If we matched an escaped shortcode, try again.
	if ( '[' === match[1] && ']' === match[7] ) {
		return Shortcode.next( tag, text, re.lastIndex );
	}

	result = {
		index: match.index,
		content: match[0],
		shortcode: Shortcode.parse( match[0] )
	};

	// If we matched a leading `[`, strip it from the match
	// and increment the index accordingly.
	if ( match[1] ) {
		result.content = result.content.slice( 1 );
		result.index++;
	}

	// If we matched a trailing `]`, strip it from the match.
	if ( match[7] ) {
		result.content = result.content.slice( 0, -1 );
	}

	return result;
};

module.exports = Shortcode;

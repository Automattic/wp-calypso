/**
 * Module variables
 */
const REGEXP_NAMED_CAPTURE_GROUP = /\(\?P?<([\w$]+)>/g;
const REGEXP_PCRE_REGEXP = /^([^\w\s\\])(.*)([^\w\s\\])([gim])?$/;

/**
 * Normalize PCRE patterns into an array of RegExp objects
 * See: http://php.net/manual/en/reference.pcre.pattern.syntax.php
 * 'http://example.com/*'     -> new RegExp( 'http://example.com/*' );
 * '#http://example.com/*#i'  -> new RegExp( 'http://example.com/*', 'i' );
 * '\/http://example.com/*\/' -> new RegExp( 'http://example.com/*' );
 *
 * @param   {Array} embeds Array of embed patterns.
 * @returns {Array}        Normalized array of Regex object patterns for supported embeds.
 */
export const normalizeEmbeds = ( embeds ) =>
	embeds
		.map( ( embed ) => {
			// Named capture groups aren't supported in JavaScript
			// See: https://github.com/slevithan/xregexp/blob/11362f53/src/xregexp.js#L1840
			embed = embed.replace( REGEXP_NAMED_CAPTURE_GROUP, '(' );

			const match = embed.match( REGEXP_PCRE_REGEXP );
			if ( match && match[ 1 ] === match[ 3 ] ) {
				return new RegExp( match[ 2 ], match[ 4 ] );
			}

			try {
				return new RegExp( embed );
			} catch ( e ) {
				return false;
			}
		} )
		.filter( Boolean );

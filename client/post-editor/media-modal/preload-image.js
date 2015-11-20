/**
 * External dependencies
 */
var memoize = require( 'lodash/function/memoize' );

module.exports = memoize( function( src ) {
	// This is a non-standard use of the Lodash memoize helper, used here to
	// prevent multiple preloads for the same image.
	new window.Image().src = src;
} );

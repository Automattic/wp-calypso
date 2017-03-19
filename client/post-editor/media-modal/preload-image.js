/**
 * External dependencies
 */
var memoize = require( 'lodash/memoize' );

export default memoize( function( src ) {
	// This is a non-standard use of the Lodash memoize helper, used here to
	// prevent multiple preloads for the same image.
	new window.Image().src = src;
} );

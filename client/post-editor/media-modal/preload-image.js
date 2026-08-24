import { memoize } from '@automattic/js-utils';

export default memoize( function ( src ) {
	// This is a non-standard use of the memoize helper, used here to
	// prevent multiple preloads for the same image.
	new window.Image().src = src;
} );

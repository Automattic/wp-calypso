/**
 * External dependencies
 */
var ReactDom = require( 'react-dom' ),
	React = require( 'react' ),
	page = require( 'page' );

/**
 * Internal dependencies
 */
var classes = require( 'component-classes' );

// This function can be called directly with no parameters to remove
// the overlay. Or, it can be used as a `page` route handler,
// or it can be used as a click handler on a link
function removeOverlay( context, next ) {
	var link = context.target;

	// Remove `overlay-open` to let close animations occur
	classes( document.documentElement ).remove( 'overlay-open' );

	// After animations finish, unmount the overlay and clean up the classes.
	setTimeout( function() {
		ReactDom.unmountComponentAtNode( document.getElementById( 'tertiary' ) );
		classes( document.documentElement ).remove( 'overlay-is-front' );
	}, 400 );

	if ( next ) {
		next();
	}
	if ( link ) {
		page( link.href );
	}
}

module.exports = removeOverlay;

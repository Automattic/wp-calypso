/**
 * External dependencies
 */
var ReactDom = require( 'react-dom' ),
	React = require( 'react' );

/**
 * Internal dependencies
 */
var AcceptDialog = require( './dialog' );

module.exports = function( message, callback, confirmButtonText, cancelButtonText, options ) {
	var wrapper = document.createElement( 'div' );
	document.body.appendChild( wrapper );

	function onClose( result ) {
		if ( wrapper ) {
			ReactDom.unmountComponentAtNode( wrapper );
			document.body.removeChild( wrapper );
			wrapper = null;
		}

		if ( callback ) {
			callback( result );
		}
	}

	ReactDom.render(
		React.createElement( AcceptDialog, {
			message: message,
			onClose: onClose,
			confirmButtonText: confirmButtonText,
			cancelButtonText: cancelButtonText,
			options
		} ),
		wrapper
	);
};

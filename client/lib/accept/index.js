/**
 * External dependencies
 */

import ReactDom from 'react-dom';
import React from 'react';

/**
 * Internal dependencies
 */
import AcceptDialog from './dialog';

export default function ( message, callback, confirmButtonText, cancelButtonText, options ) {
	let wrapper = document.createElement( 'div' );
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
			options,
		} ),
		wrapper
	);
}

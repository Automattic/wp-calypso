import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import AcceptDialog from './dialog';

export default function ( message, callback, confirmButtonText, cancelButtonText, options ) {
	let wrapper = document.createElement( 'div' );
	document.body.appendChild( wrapper );
	const root = createRoot( wrapper );

	function onClose( result ) {
		if ( wrapper ) {
			root.unmount();
			// `wrapper.remove()` is a no-op if the node was already detached (e.g.
			// the document was cleared), unlike `removeChild`, which throws.
			wrapper.remove();
			wrapper = null;
		}

		if ( callback ) {
			callback( result );
		}
	}

	root.render(
		createElement( AcceptDialog, {
			message: message,
			onClose: onClose,
			confirmButtonText: confirmButtonText,
			cancelButtonText: cancelButtonText,
			options,
		} )
	);
}

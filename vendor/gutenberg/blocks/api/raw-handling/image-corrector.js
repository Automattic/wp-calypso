/**
 * WordPress dependencies
 */
import { createBlobURL } from '@wordpress/blob';

/**
 * Browser dependencies
 */
const { atob, File } = window;

export default function( node ) {
	if ( node.nodeName !== 'IMG' ) {
		return;
	}

	if ( node.src.indexOf( 'file:' ) === 0 ) {
		node.src = '';
	}

	// This piece cannot be tested outside a browser env.
	if ( node.src.indexOf( 'data:' ) === 0 ) {
		const [ properties, data ] = node.src.split( ',' );
		const [ type ] = properties.slice( 5 ).split( ';' );

		if ( ! data || ! type ) {
			node.src = '';
			return;
		}

		let decoded;

		// Can throw DOMException!
		try {
			decoded = atob( data );
		} catch ( e ) {
			node.src = '';
			return;
		}

		const uint8Array = new Uint8Array( decoded.length );

		for ( let i = 0; i < uint8Array.length; i++ ) {
			uint8Array[ i ] = decoded.charCodeAt( i );
		}

		const name = type.replace( '/', '.' );
		const file = new File( [ uint8Array ], name, { type } );

		node.src = createBlobURL( file );
	}

	// Remove trackers and hardly visible images.
	if ( node.height === 1 || node.width === 1 ) {
		node.parentNode.removeChild( node );
	}
}

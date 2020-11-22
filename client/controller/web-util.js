/**
 * External dependencies
 */
import ReactDom from 'react-dom';

export function render( context ) {
	ReactDom.render( context.layout, document.getElementById( 'wpcom' ) );
}

export function hydrate( context ) {
	ReactDom.hydrate( context.layout, document.getElementById( 'wpcom' ) );
}

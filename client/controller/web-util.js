/**
 * External dependencies
 */
import ReactDom from 'react-dom';
import page from 'page';

/**
 * Internal dependencies
 */
import { isUserLoggedIn } from 'state/current-user/selectors';

export function redirectLoggedIn( context, next ) {
	const userLoggedIn = isUserLoggedIn( context.store.getState() );

	if ( userLoggedIn ) {
		page.redirect( '/' );
		return;
	}

	next();
}

export function render( context ) {
	ReactDom.render( context.layout, document.getElementById( 'wpcom' ) );
}

export function hydrate( context ) {
	ReactDom.hydrate( context.layout, document.getElementById( 'wpcom' ) );
}

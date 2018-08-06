/** @format */

/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal Dependencies
 */
import { getCurrentUser } from 'state/current-user/selectors';

export function redirectLoggedIn( context, next ) {
	const currentUser = getCurrentUser( context.store.getState() );

	if ( currentUser ) {
		page.redirect( '/' );
		return;
	}

	next();
}

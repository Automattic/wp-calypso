/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';

export default function redirectLoggedIn( context, next ) {
	const userLoggedIn = isUserLoggedIn( context.store.getState() );

	if ( userLoggedIn ) {
		page( '/' );
		return;
	}

	next();
}

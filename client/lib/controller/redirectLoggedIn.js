/**
 * External dependencies
 */
import { redirect } from 'page';

/**
 * Internal dependencies
 */
import { getCurrentUser } from 'state/current-user/selectors';

export default function( { store }, next ) {
	const currentUser = getCurrentUser( store.getState() );

	if ( currentUser ) {
		redirect( '/' );
		return;
	}

	next();
}

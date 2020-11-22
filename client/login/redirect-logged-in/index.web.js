/**
 * Internal dependencies
 */
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';

export default function redirectLoggedIn( context, next ) {
	const userLoggedIn = isUserLoggedIn( context.store.getState() );

	if ( userLoggedIn ) {
		// force full page reload to avoid SSR hydration issues.
		window.location = '/';
		return;
	}

	next();
}

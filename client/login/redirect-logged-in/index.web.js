import safeProtocolUrl from 'calypso/lib/safe-protocol-url';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';

export default function redirectLoggedIn( context, next ) {
	const userLoggedIn = isUserLoggedIn( context.store.getState() );

	if ( userLoggedIn ) {
		// force full page reload to avoid SSR hydration issues.
		// Redirect parameters should have higher priority.
		let url = safeProtocolUrl( context?.query?.redirect_to );
		if ( ! url || url === 'http:' ) {
			url = '/';
		}
		window.location = url;
		return;
	}

	next();
}

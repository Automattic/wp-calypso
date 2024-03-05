import { isUserLoggedIn } from 'calypso/state/current-user/selectors';

export default function redirectLoggedIn( context, next ) {
	const userLoggedIn = isUserLoggedIn( context.store.getState() );

	if ( userLoggedIn ) {
		// force full page reload to avoid SSR hydration issues.
		// Redirect parameters should have higher priority.
		window.location = context?.query?.redirect_to ?? '/';
		return;
	}

	next();
}

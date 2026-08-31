import { isExternalUrl, isUnsafeInternalUrl } from 'calypso/lib/login-redirect-safety';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';

export default function redirectLoggedIn( context, next ) {
	const userLoggedIn = isUserLoggedIn( context.store.getState() );

	if ( userLoggedIn ) {
		// force full page reload to avoid SSR hydration issues.
		// Redirect parameters should have higher priority.
		let url = context?.query?.redirect_to;
		// Bare root, with or without a query or hash, means "my dashboard".
		const isBareRoot = url === '/' || url?.startsWith( '/?' ) || url?.startsWith( '/#' );
		if ( ! url || isBareRoot || isUnsafeInternalUrl( url ) || isExternalUrl( url ) ) {
			url = '/home';
		}
		window.location = url;
		return;
	}

	next();
}

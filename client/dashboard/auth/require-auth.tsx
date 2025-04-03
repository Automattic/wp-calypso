/**
 * External dependencies
 */
import { useEffect, useState } from 'react';
import { login } from 'calypso/lib/paths/login';
import wpcom from 'calypso/lib/wp';

/**
 * A component that checks if the user is authenticated before rendering its children.
 * If not authenticated, it redirects to the login page with the current path as the redirect target.
 */
export default function RequireAuth( { children } ) {
	const [ isAuthenticated, setIsAuthenticated ] = useState< boolean | null >( null );

	useEffect( () => {
		// Only run in browser environment
		if ( typeof window === 'undefined' ) {
			return;
		}

		wpcom
			.me()
			.get()
			.then( () => setIsAuthenticated( true ) )
			.catch( () => {
				// Redirect to login page with current path as the redirect target
				const currentPath = window.location.pathname;
				const loginUrl = login( { redirectTo: currentPath } );
				window.location.href = loginUrl;
			} );
	}, [] );

	// Show nothing until we know the auth status
	if ( isAuthenticated !== true ) {
		return null;
	}

	return children;
}

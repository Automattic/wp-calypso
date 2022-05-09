import { useEffect, useState } from 'react';

/**
 * Cache the result for the entire session, since changing 3PC settings requires a refresh
 */
let result: boolean | undefined;

/**
 * Calls a widgets.wp.com endpoint from within an iframe to determine whether the user has 3rd party cookies allowed
 *
 * @returns true when cookies are allowed, false when not.
 */
export function useHas3PC() {
	const [ hasCookies, setHasCookies ] = useState( Boolean( result ) );

	useEffect( () => {
		const iframe = document.createElement( 'iframe' );

		function handler( event: MessageEvent ) {
			const { data } = event;
			if ( data.type === 'widgets.wp.com-cookie-check' ) {
				// cache the result
				result = data.result;
				setHasCookies( data.result );
				window.removeEventListener( 'message', handler );
				iframe.remove();
			}
		}

		// only inject the iframe if the result isn't already cached
		if ( result === undefined ) {
			iframe.src = 'https://widgets.wp.com/calypso-happychat/check-cookies.html';
			iframe.style.display = 'none';

			window.addEventListener( 'message', handler );
			document.body.appendChild( iframe );
			return () => window.removeEventListener( 'message', handler );
		}
	}, [] );

	return { hasCookies, isLoading: result === undefined };
}

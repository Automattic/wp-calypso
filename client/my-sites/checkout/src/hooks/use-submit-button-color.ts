import { useEffect, useState } from 'react';
import wpcom from 'calypso/lib/wp';

interface SubmitButtonColorResponse {
	color: string;
}

/**
 * Fetches the submit button background color from the WPCOM API on mount.
 * Returns the color string, or undefined if the request has not completed or failed.
 * Errors are handled gracefully with a no-op fallback.
 */
export function useSubmitButtonColor(): string | undefined {
	const [ color, setColor ] = useState< string | undefined >( undefined );

	useEffect( () => {
		wpcom.req
			.get( {
				path: '/submit-button-color',
				apiNamespace: 'wpcom/v2',
			} )
			.then( ( response: SubmitButtonColorResponse ) => {
				if ( response?.color ) {
					setColor( response.color );
				}
			} )
			.catch( () => {
				// No-op fallback: leave color as undefined on error
			} );
	}, [] );

	return color;
}

import { useEffect, useState } from 'react';
import { getSocialServiceFromClientId } from 'calypso/lib/login';

export function useSocialService() {
	const [ state, setState ] = useState( { socialService: '', socialServiceResponse: {} } );

	useEffect( () => {
		const hashEntries = new globalThis.URLSearchParams( window.location.hash.substring( 1 ) );

		if ( hashEntries.size > 0 ) {
			const socialServiceResponse = Object.fromEntries( hashEntries.entries() );
			const clientId = socialServiceResponse.client_id;
			const socialService = getSocialServiceFromClientId( clientId ) ?? '';

			if ( socialService ) {
				setState( { socialService, socialServiceResponse } );
				// Clear the hash to prevent reprocessing
				window.location.hash = '';
			}
		}
	}, [] );

	return state;
}

import { getSocialServiceFromClientId } from 'calypso/lib/login';

export function useSocialService() {
	const hashEntries = new globalThis.URLSearchParams( window.location.hash.substring( 1 ) );

	if ( hashEntries.size > 0 ) {
		const socialServiceResponse = Object.fromEntries( hashEntries.entries() );
		const clientId = socialServiceResponse.client_id;
		const socialService = getSocialServiceFromClientId( clientId ) ?? '';
		if ( socialService ) {
			return { socialService, socialServiceResponse };
		}
	}

	return { socialService: '', socialServiceResponse: {} };
}

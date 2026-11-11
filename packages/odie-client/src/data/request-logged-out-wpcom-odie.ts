import { getTracksAnonymousUserId } from '@automattic/calypso-analytics';

interface RequestOptions {
	body?: Record< string, unknown >;
	method?: 'GET' | 'POST';
	signal?: AbortSignal;
}

// Requests omit cookies, so pass the anon ID explicitly for ExPlat assignment.
const getAnonId = (): string | undefined => {
	const explatAnonId = document.cookie.match( /(?:^|;\s*)tk_ai_explat=([^;]+)/ )?.[ 1 ];
	return explatAnonId ? decodeURIComponent( explatAnonId ) : getTracksAnonymousUserId();
};

export const requestLoggedOutWpcomOdie = async < T >(
	path: string,
	{ body, method = 'GET', signal }: RequestOptions = {}
): Promise< T > => {
	const anonId = body ? getAnonId() : undefined;
	const response = await fetch( `https://public-api.wordpress.com/wpcom/v2${ path }`, {
		body: body ? JSON.stringify( anonId ? { ...body, anon_id: anonId } : body ) : undefined,
		credentials: 'omit',
		headers: body ? { 'Content-Type': 'application/json' } : undefined,
		method,
		signal,
	} );
	const data = ( await response.json() ) as T & { message?: string };

	if ( ! response.ok ) {
		throw new Error( data.message || response.statusText );
	}

	return data;
};

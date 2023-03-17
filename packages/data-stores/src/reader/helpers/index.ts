import apiFetch, { APIFetchOptions } from '@wordpress/api-fetch';
import wpcomRequest from 'wpcom-proxy-request';

type FetchFromApiParams = {
	path: string;
	method?: 'GET' | 'POST';
	body?: object;
	isLoggedIn?: boolean;
};
// Helper function for fetching from subkey authenticated API. Subkey authentication process is only applied in case of logged-out users.
async function fetchFromApi< ReturnType >( {
	path,
	method = 'GET',
	body = {},
	isLoggedIn = false,
}: FetchFromApiParams ): Promise< ReturnType > {
	if ( isLoggedIn ) {
		const res = await wpcomRequest( {
			path,
			apiVersion: '1.1',
			method,
			body: method === 'POST' ? body : undefined,
		} );
		return res as ReturnType;
	}

	// get cookie named subkey
	const subkey = document.cookie
		?.split( ';' )
		?.map( ( c ) => c.trim() )
		?.find( ( c ) => c.startsWith( 'subkey=' ) )
		?.split( '=' )[ 1 ];

	return apiFetch( {
		global: true,
		path: `https://public-api.wordpress.com/rest/v1.1${ path }`,
		apiVersion: '1.1',
		method,
		body: method === 'POST' ? JSON.stringify( body ) : undefined,
		credentials: 'same-origin',
		headers: {
			Authorization: `Cookie ${ subkey }`,
			'Content-Type': 'application/json',
		},
	} as APIFetchOptions );
}

export { fetchFromApi };

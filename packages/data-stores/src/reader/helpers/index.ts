import apiFetch, { APIFetchOptions } from '@wordpress/api-fetch';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';

async function fetchFromApi< ReturnType >(
	path: string,
	method: 'GET' | 'POST' = 'GET',
	body: object = {}
): Promise< ReturnType > {
	if ( canAccessWpcomApis() ) {
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
		.split( ';' )
		.map( ( c ) => c.trim() )
		.find( ( c ) => c.startsWith( 'subkey=' ) );

	return apiFetch( {
		path: '/rest/v1.1' + path,
		method,
		body: method === 'POST' ? JSON.stringify( body ) : undefined,
		headers: {
			Authorization: `Cookie ${ subkey }`,
			'Content-Type': 'application/json',
		},
	} as APIFetchOptions );
}

export { fetchFromApi };

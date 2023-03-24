import apiFetch, { APIFetchOptions } from '@wordpress/api-fetch';
import cookie from 'cookie';
import wpcomRequest from 'wpcom-proxy-request';

type callApiParams = {
	path: string;
	method?: 'GET' | 'POST';
	body?: object;
	isLoggedIn?: boolean;
};

// Get cookie named subkey
const getSubkey = () => {
	const subkey = cookie.parse( document.cookie )?.subkey;
	return subkey;
};

// Helper function for fetching from subkey authenticated API. Subkey authentication process is only applied in case of logged-out users.
async function callApi< ReturnType >( {
	path,
	method = 'GET',
	body,
	isLoggedIn = false,
}: callApiParams ): Promise< ReturnType > {
	if ( isLoggedIn ) {
		const res = await wpcomRequest( {
			path,
			apiVersion: '1.1',
			method,
			body: method === 'POST' ? body : undefined,
		} );
		return res as ReturnType;
	}

	const subkey = getSubkey();

	if ( ! subkey ) {
		throw new Error( 'Subkey not found' );
	}

	return apiFetch( {
		global: true,
		path: `https://public-api.wordpress.com/rest/v1.1${ path }`,
		apiVersion: '1.1',
		method,
		body: method === 'POST' ? JSON.stringify( body ) : undefined,
		credentials: 'same-origin',
		headers: {
			Authorization: `X-WPSUBKEY ${ subkey }`,
			'Content-Type': 'application/json',
		},
	} as APIFetchOptions );
}

export { callApi, getSubkey };

import apiFetch from '@wordpress/api-fetch';
import request from 'wpcom-proxy-request';

// Overriding the global Window type in packages/data-stores/src/user/resolvers.ts caused the tests to fail.
type SubkeyWindow = {
	currentUser?: {
		subscriptionManagementSubkey: string;
	};
};

function requestWithSubkeyFallback< R, T = object >(
	isLoggedIn: boolean,
	path: string,
	method = 'GET',
	body: T = {} as T
): Promise< R > {
	const subkey = ( window as SubkeyWindow ).currentUser?.subscriptionManagementSubkey;
	const apiVersion = '2';
	const apiNamespace = 'wpcom/v2';

	if ( isLoggedIn ) {
		return request< R >( {
			path,
			apiVersion,
			apiNamespace,
			method,
			body: method === 'POST' ? ( body as object ) : undefined,
		} );
	}

	if ( subkey ) {
		return apiFetch( {
			// global: true,
			path: `https://public-api.wordpress.com/wpcom/v2${ path }`,
			method,
			body: method === 'POST' ? JSON.stringify( body ) : undefined,
			credentials: 'same-origin',
			headers: {
				Authorization: `X-WPSUBKEY ${ encodeURIComponent( subkey ) }`,
				'Content-Type': 'application/json',
			},
		} ) as Promise< R >;
	}

	throw new Error( 'Subkey not found' );
}

export default requestWithSubkeyFallback;

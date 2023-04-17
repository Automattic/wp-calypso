import apiFetch, { APIFetchOptions } from '@wordpress/api-fetch';
import wpcomRequest from 'wpcom-proxy-request';

type callApiParams = {
	path: string;
	method?: 'GET' | 'POST';
	body?: object;
	isLoggedIn?: boolean;
	apiVersion?: string;
};

// Get cookie named subkey
const getSubkey = () => {
	return window.currentUser?.subscriptionManagementSubkey;
};

// Helper function for fetching from subkey authenticated API. Subkey authentication process is only applied in case of logged-out users.
async function callApi< ReturnType >( {
	path,
	method = 'GET',
	body,
	isLoggedIn = false,
	apiVersion = '1.1',
}: callApiParams ): Promise< ReturnType > {
	if ( isLoggedIn ) {
		const res = await wpcomRequest( {
			path,
			apiVersion,
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
		path: `https://public-api.wordpress.com/rest/v${ apiVersion }${ path }`,
		apiVersion,
		method,
		body: method === 'POST' ? JSON.stringify( body ) : undefined,
		credentials: 'same-origin',
		headers: {
			Authorization: `X-WPSUBKEY ${ encodeURIComponent( subkey ) }`,
			'Content-Type': 'application/json',
		},
	} as APIFetchOptions );
}

interface PagedResult< T > {
	pages: T[];
	pageParams: number;
}

type KeyedObject< K extends string, T > = {
	[ key in K ]: T[];
};

const applyCallbackToPages = < K extends string, T >(
	pagedResult: PagedResult< KeyedObject< K, T > > | undefined,
	callback: ( page: KeyedObject< K, T > ) => KeyedObject< K, T >
): PagedResult< KeyedObject< K, T > > | undefined => {
	if ( ! pagedResult ) {
		return undefined;
	}
	return {
		pages: pagedResult.pages.map( ( page ) => callback( page ) ),
		pageParams: pagedResult.pageParams,
	};
};

export { callApi, applyCallbackToPages, getSubkey };

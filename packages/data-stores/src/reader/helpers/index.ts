import apiFetch, { APIFetchOptions } from '@wordpress/api-fetch';
import wpcomRequest from 'wpcom-proxy-request';
import { ErrorResponse } from '../types';

type callApiParams = {
	apiNamespace?: string;
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
	apiNamespace = '',
	path,
	method = 'GET',
	body,
	isLoggedIn = false,
	apiVersion = '1.1',
}: callApiParams ): Promise< ReturnType > {
	if ( isLoggedIn ) {
		const res = await wpcomRequest( {
			apiNamespace,
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

	const apiPath =
		apiVersion === '2'
			? `https://public-api.wordpress.com/wpcom/v2${ path }`
			: `https://public-api.wordpress.com/rest/v${ apiVersion }${ path }`;

	return apiFetch( {
		global: true,
		path: apiPath,
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

// Subscriptions Management helper function to determine which API endpoint to call based on whether the user is logged in or not.
const getSubscriptionMutationParams = (
	action: 'new' | 'delete',
	isLoggedIn: boolean,
	blogId?: number | string,
	url?: string,
	emailId?: string
) => {
	if ( isLoggedIn ) {
		if ( ! url ) {
			throw new Error( 'URL is required for wpcom user to subscribe' );
		}

		return {
			path: `/read/following/mine/${ action }`,
			apiVersion: '1.1',
			body: { source: 'calypso', url: url, ...( emailId ? { email_id: emailId } : {} ) },
		};
	}

	if ( ! blogId ) {
		throw new Error( 'Blog ID is required for non-wpcom user to subscribe' );
	}

	return {
		path: `/read/site/${ blogId }/post_email_subscriptions/${ action }`,
		apiVersion: '1.2',
		body: { ...( emailId ? { email_id: emailId } : {} ) },
	};
};

const isErrorResponse = (
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	response: any
): response is ErrorResponse => {
	// This is good enough for us to know that the response is an error response
	return response && ( response.errors || response.error_data );
};

export { callApi, applyCallbackToPages, getSubkey, getSubscriptionMutationParams, isErrorResponse };
export { default as buildQueryKey } from './query-key';
export { default as isValidId } from './validators';

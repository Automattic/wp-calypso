/**
 * Jetpack Authentication Provider for Agenttic Client
 *
 * Provides authentication for WordPress sites using Jetpack connection.
 */

/**
 * External dependencies
 */

import apiFetch from '@wordpress/api-fetch';

/**
 * Internal dependencies
 */
import type { AuthProvider } from '../client/types/index';

export const JWT_TOKEN_ID = 'jetpack-ai-jwt-token';
export const JWT_TOKEN_EXPIRATION_TIME = 30 * 60 * 1000; // 30 minutes

declare global {
	interface Window {
		JP_CONNECTION_INITIAL_STATE?: {
			apiNonce: string;
			siteSuffix: string;
			connectionStatus: { isActive: boolean };
		};
		Jetpack_Editor_Initial_State?: {
			wpcomBlogId: string;
		};
	}
}

interface TokenData {
	token: string;
	blogId: string;
	expire: number;
}

interface ApiError {
	code?: string;
	status?: number;
	message?: string;
}

/**
 * Check if this is a WordPress.com simple site
 */
function isSimpleSite(): boolean {
	return Boolean( window.Jetpack_Editor_Initial_State?.wpcomBlogId );
}

/**
 * Get user-friendly error message for Jetpack authentication failures
 * TODO: Add i18n support for error messages when internationalization is added to Agenttic
 * @param error
 */
function getJetpackErrorMessage( error: ApiError ): string {
	if ( error?.code === 'rest_invalid_nonce' ) {
		return 'Your session expired. Please refresh the page and try again or check your Jetpack connection.';
	}

	if ( error?.code === 'rest_forbidden' || error?.status === 403 ) {
		return "You don't have permission to access Jetpack AI features. Please check your user permissions.";
	}

	if ( error?.code === 'rest_no_route' || error?.status === 404 ) {
		return 'Unable to connect to Jetpack. Please ensure the Jetpack plugin is active and up to date.';
	}

	if (
		error?.message?.includes( 'network' ) ||
		error?.message?.includes( 'Network' ) ||
		error?.message?.includes( 'fetch' )
	) {
		return 'Network connection issue. Please check your internet connection and try again.';
	}

	return 'Unable to authenticate with Jetpack. Please try again or contact support if the problem persists.';
}

/**
 * Request a JWT token from Jetpack for API authentication
 * @param useCachedToken - Whether to use cached token if available and valid
 * @return Token data with JWT token and blog ID, or null on failure
 */
export async function requestJetpackToken(
	useCachedToken = true
): Promise< TokenData | null > {
	const token = localStorage.getItem( JWT_TOKEN_ID );
	let tokenData: TokenData | undefined;

	if ( token ) {
		try {
			tokenData = JSON.parse( token ) as TokenData;
		} catch ( error ) {
			// Invalid cached token, continue to fetch new one
			console.warn( 'Invalid cached Jetpack token:', error );
		}
	}

	if (
		tokenData &&
		tokenData?.token &&
		tokenData?.expire &&
		tokenData?.expire > Date.now() &&
		useCachedToken
	) {
		return tokenData;
	}

	const apiNonce = window.JP_CONNECTION_INITIAL_STATE?.apiNonce;
	const siteId = window.Jetpack_Editor_Initial_State?.wpcomBlogId;

	let data: { token: string; blog_id: string } = {
		token: '',
		blog_id: '',
	};

	try {
		if ( ! isSimpleSite() ) {
			// Jetpack-connected site
			data = await apiFetch( {
				path: '/jetpack/v4/jetpack-ai-jwt?_cacheBuster=' + Date.now(),
				credentials: 'same-origin',
				headers: {
					'X-WP-Nonce': apiNonce || '',
				},
				method: 'POST',
			} );
		} else {
			// WordPress.com simple site
			data = await apiFetch( {
				path: '/wpcom/v2/sites/' + siteId + '/jetpack-openai-query/jwt',
				method: 'POST',
			} );
		}
	} catch ( error ) {
		console.log( 'Failed to fetch Jetpack token:', error );
		throw new Error( getJetpackErrorMessage( error as ApiError ) );
	}

	if ( ! data?.token ) {
		throw new Error(
			'Authentication failed. Please ensure Jetpack is properly connected and try again.'
		);
	}

	const newTokenData: TokenData = {
		token: data.token,
		blogId: data.blog_id || '',
		expire: Date.now() + JWT_TOKEN_EXPIRATION_TIME,
	};

	// Cache the token
	try {
		localStorage.setItem( JWT_TOKEN_ID, JSON.stringify( newTokenData ) );
	} catch ( storageError ) {
		console.log( 'Error storing token in localStorage:', storageError );
		// Continue without caching
	}

	return newTokenData;
}

/**
 * Jetpack authentication provider for use with Agenttic client.
 *
 * This provider handles authentication for WordPress sites with Jetpack,
 * automatically managing token caching and refresh.
 *
 * @example
 * ```typescript
 * import { jetpackAuthProvider } from '@automattic/agenttic-client';
 * import { useAgent } from '@automattic/agenttic-client';
 *
 * const { state, sendMessage } = useAgent({
 *   agentId: 'my-agent',
 *   authProvider: jetpackAuthProvider,
 * });
 * ```
 *
 * @return Authentication provider function that returns headers with JWT token
 */
export const jetpackAuthProvider: AuthProvider = async (): Promise<
	Record< string, string >
> => {
	const headers: Record< string, string > = {};

	try {
		const tokenData = await requestJetpackToken();

		if ( tokenData?.token ) {
			headers.Authorization = `${ tokenData.token }`;
		}
	} catch ( error ) {
		console.error( 'Failed to get Jetpack token for auth:', error );
		// Rethrow auth errors so they can be handled properly by the client
		throw error;
	}

	return headers;
};

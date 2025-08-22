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

export interface JetpackApiError {
	code?: string;
	status?: number;
	message?: string;
}

/**
 * Error handler function type for Jetpack authentication errors
 */
export type JetpackErrorHandler = ( error: JetpackApiError ) => string;

/**
 * Check if this is a simple site (WordPress.com)
 */
function isSimpleSite(): boolean {
	// If we have JP_CONNECTION_INITIAL_STATE, it's a Jetpack site (not simple)
	const hasJetpackConnection = Boolean( window.JP_CONNECTION_INITIAL_STATE );
	if ( hasJetpackConnection ) {
		return false;
	}

	// Otherwise check for wpcomBlogId - simple sites have this without JP_CONNECTION_INITIAL_STATE
	const isSimple = Boolean(
		window.Jetpack_Editor_Initial_State?.wpcomBlogId
	);
	return isSimple;
}

/**
 * Request a JWT token from Jetpack for API authentication
 * @param errorHandler   - Function to handle and format error messages
 * @param useCachedToken - Whether to use cached token if available and valid
 * @return Token data with JWT token and blog ID, or null on failure
 */
export async function requestJetpackToken(
	errorHandler: JetpackErrorHandler,
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
		throw new Error( errorHandler( error as JetpackApiError ) );
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
 * Create a Jetpack authentication provider for use with Agenttic client.
 *
 * This factory function creates an authentication provider that handles
 * authentication for WordPress sites with Jetpack, automatically managing
 * token caching and refresh.
 *
 * @example
 * ```typescript
 * import { createJetpackAuthProvider } from '@automattic/agenttic-client';
 * import { useAgent } from '@automattic/agenttic-client';
 *
 * const errorHandler = (error) => {
 *   if (error.code === 'rest_forbidden') {
 *     return 'Permission denied';
 *   }
 *   return 'Authentication failed';
 * };
 *
 * const { state, sendMessage } = useAgent({
 *   agentId: 'my-agent',
 *   authProvider: createJetpackAuthProvider(errorHandler),
 * });
 * ```
 *
 * @param errorHandler - Function to handle and format error messages
 * @return Authentication provider function that returns headers with JWT token
 */
export const createJetpackAuthProvider = (
	errorHandler: JetpackErrorHandler
): AuthProvider => {
	return async (): Promise< Record< string, string > > => {
		const headers: Record< string, string > = {};

		try {
			const tokenData = await requestJetpackToken( errorHandler );

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
};

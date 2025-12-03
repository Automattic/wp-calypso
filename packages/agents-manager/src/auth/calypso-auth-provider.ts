/**
 * Calypso Authentication Provider for Agenttic Client
 *
 * Provides authentication for Calypso using WPCOM OAuth tokens or JWT tokens via apiFetch
 */

import * as oauthToken from '@automattic/oauth-token';
import apiFetch from '@wordpress/api-fetch';
import { __ } from '@wordpress/i18n';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import type { AuthProvider } from '@automattic/agenttic-client';

interface CalypsoAuthError {
	code?: string;
	status?: number;
	message?: string;
}

const JWT_TOKEN_ID = 'jetpack-ai-jwt-token';
const JWT_TOKEN_EXPIRATION_TIME = 30 * 60 * 1000; // 30 minutes

interface TokenData {
	token: string;
	blogId: string;
	expire: number;
}

declare global {
	interface Window {
		_currentSiteType?: string;
		JP_CONNECTION_INITIAL_STATE?: {
			apiNonce: string;
			siteSuffix: string;
			connectionStatus: { isActive: boolean; isRegistered: boolean };
		};
		Jetpack_Editor_Initial_State?: {
			wpcomBlogId: string;
		};
	}
}

/**
 * Get cached JWT token data from sessionStorage
 * @param key - Storage key
 * @returns TokenData or null
 */
function getCachedJwtToken( key: string ): TokenData | null {
	try {
		const cached = sessionStorage.getItem( key );
		if ( cached ) {
			const tokenData = JSON.parse( cached ) as TokenData;
			if ( tokenData?.token && tokenData?.expire && tokenData.expire > Date.now() ) {
				return tokenData;
			}
		}
	} catch {
		// Invalid cached token
	}
	return null;
}

/**
 * Set cached JWT token data in sessionStorage
 * @param key - Storage key
 * @param tokenData - Token data to cache
 */
function setCachedJwtToken( key: string, tokenData: TokenData ): void {
	try {
		sessionStorage.setItem( key, JSON.stringify( tokenData ) );
	} catch {
		// Continue without caching
	}
}

/**
 * Request a JWT token from the WordPress REST API (for wp-admin contexts)
 * Based on big-sky-plugin's requestJetpackToken implementation
 * @param siteId - Optional site ID to use for simple sites (if not available in window)
 * @param useCachedToken - Whether to use cached token
 */
async function requestJWTToken(
	siteId?: string | number,
	useCachedToken = true
): Promise< TokenData | null > {
	// Check for cached token
	if ( useCachedToken ) {
		const cached = getCachedJwtToken( JWT_TOKEN_ID );
		if ( cached ) {
			return cached;
		}
	}

	const apiNonce = window.JP_CONNECTION_INITIAL_STATE?.apiNonce;
	// Use provided siteId or fallback to window
	const effectiveSiteId = siteId || window.Jetpack_Editor_Initial_State?.wpcomBlogId;

	let data: { token: string; blog_id: string } = {
		token: '',
		blog_id: '',
	};

	try {
		if ( canAccessWpcomApis() ) {
			// WordPress.com simple site
			if ( ! effectiveSiteId ) {
				throw new Error( 'Site ID is required for simple sites' );
			}
			data = await apiFetch< { token: string; blog_id: string } >( {
				path: '/wpcom/v2/sites/' + effectiveSiteId + '/jetpack-openai-query/jwt',
				method: 'POST',
			} );
		} else {
			// Jetpack-connected site
			data = await apiFetch< { token: string; blog_id: string } >( {
				path: '/jetpack/v4/jetpack-ai-jwt?_cacheBuster=' + Date.now(),
				credentials: 'same-origin',
				headers: {
					'X-WP-Nonce': apiNonce || '',
				},
				method: 'POST',
			} );
		}
	} catch ( error ) {
		return null;
	}

	if ( ! data?.token ) {
		return null;
	}

	const newTokenData: TokenData = {
		token: data.token,
		blogId: data.blog_id || '',
		expire: Date.now() + JWT_TOKEN_EXPIRATION_TIME,
	};

	// Cache the token
	setCachedJwtToken( JWT_TOKEN_ID, newTokenData );

	return newTokenData;
}

/**
 * Request a JWT token using wpcomRequest (for Calypso contexts)
 * @param siteId - Site ID for fetching JWT tokens
 * @param useCachedToken - Whether to use cached token (default: true)
 */
async function requestJWTTokenViaWpcom(
	siteId: string | number,
	useCachedToken = true
): Promise< string | null > {
	const cacheKey = `${ JWT_TOKEN_ID }-wpcom-${ siteId }`;

	// Check for cached token
	if ( useCachedToken ) {
		const cached = getCachedJwtToken( cacheKey );
		if ( cached ) {
			return cached.token;
		}
	}

	try {
		const data = ( await wpcomRequest( {
			path: `/sites/${ siteId }/jetpack-openai-query/jwt`,
			apiNamespace: 'wpcom/v2',
			method: 'POST',
		} ) ) as { token?: string; jwt?: string };

		const token = data?.token || data?.jwt;

		if ( token ) {
			// Cache the token
			const tokenData: TokenData = {
				token,
				blogId: String( siteId ),
				expire: Date.now() + JWT_TOKEN_EXPIRATION_TIME,
			};

			setCachedJwtToken( cacheKey, tokenData );
		}

		return token || null;
	} catch ( error ) {
		// eslint-disable-next-line no-console
		console.error( 'Failed to get JWT token via wpcomRequest:', error );
		return null;
	}
}

/**
 * Get OAuth token from Calypso
 */
function getOAuthToken(): string | null {
	// Try to get OAuth token from Calypso
	// This package checks both wpcom_token cookie and localStorage
	const oauthTokenValue = oauthToken.getToken();
	// getToken() returns string | boolean, so we need to check it's a string
	if ( oauthTokenValue && typeof oauthTokenValue === 'string' ) {
		return oauthTokenValue;
	}

	// Fallback: try localStorage directly
	if ( typeof window !== 'undefined' && window.localStorage ) {
		try {
			const tokenFromStorage = window.localStorage.getItem( 'wpcom_token' );
			if ( tokenFromStorage ) {
				return tokenFromStorage;
			}
		} catch {
			// localStorage access might fail
		}
	}

	return null;
}

/**
 * Create a Calypso authentication provider for use with Agenttic client.
 *
 * Uses OAuth Bearer token in Calypso environments (wordpress.com, *.calypso.live),
 * or JWT token via apiFetch in non-Calypso environments (wp-admin, widgets.wp.com).
 * @param siteId - Optional site ID for simple sites (used when requesting JWT tokens)
 * @returns Authentication provider function that returns headers
 */
export const createCalypsoAuthProvider = ( siteId?: string | number ): AuthProvider => {
	return async () => {
		const headers: Record< string, string > = {
			'Content-Type': 'application/json',
		};

		if ( canAccessWpcomApis() ) {
			const token = getOAuthToken();
			if ( token ) {
				headers.Authorization = `Bearer ${ token }`;
				return headers;
			}

			// Fallback to JWT via wpcomRequest
			if ( siteId ) {
				const jwtToken = await requestJWTTokenViaWpcom( siteId );
				if ( jwtToken ) {
					headers.Authorization = `Bearer ${ jwtToken }`;
					return headers;
				}
			}
		} else {
			// Not in Calypso: Use JWT token from apiFetch (wp-admin context)
			try {
				const tokenData = await requestJWTToken( siteId );
				if ( tokenData?.token ) {
					// Use token directly without "Bearer" prefix (as per big-sky-plugin)
					headers.Authorization = tokenData.token;
					return headers;
				}
			} catch ( error ) {
				// Silent fail - auth provider will be called again if needed
			}
		}

		return headers;
	};
};

/**
 * Default error handler for Calypso/Jetpack authentication failures
 * Can be used with both createCalypsoAuthProvider and createJetpackAuthProvider
 * @param error - The authentication error
 * @returns User-friendly error message
 */
export const defaultCalypsoErrorHandler = ( error: CalypsoAuthError ): string => {
	if ( error?.code === 'rest_invalid_nonce' ) {
		return __(
			'Your session expired. Please refresh the page and try again.',
			'__i18n_text_domain__'
		);
	}

	if ( error?.code === 'rest_forbidden' || error?.status === 403 ) {
		return __( "You don't have permission to access AI features.", '__i18n_text_domain__' );
	}

	if ( error?.code === 'rest_no_route' || error?.status === 404 ) {
		return __( 'AI service is not available. Please try again later.', '__i18n_text_domain__' );
	}

	if (
		error?.message?.includes( 'network' ) ||
		error?.message?.includes( 'Network' ) ||
		error?.message?.includes( 'fetch' )
	) {
		return __(
			'Network connection issue. Please check your internet connection and try again.',
			'__i18n_text_domain__'
		);
	}

	if ( error?.status === 401 ) {
		return __(
			'Your session expired. Please refresh the page and try again.',
			'__i18n_text_domain__'
		);
	}

	return __( 'Unable to connect to AI service. Please try again.', '__i18n_text_domain__' );
};

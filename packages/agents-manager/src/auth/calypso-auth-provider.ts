/**
 * Calypso Authentication Provider for Agenttic Client
 *
 * Provides authentication for Calypso using WPCOM OAuth tokens or JWT tokens via apiFetch
 */

import * as oauthToken from '@automattic/oauth-token';
import apiFetch from '@wordpress/api-fetch';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import type { AuthProvider } from '@automattic/agenttic-client';

export interface CalypsoAuthError {
	code?: string;
	status?: number;
	message?: string;
}

/**
 * Error handler function type for Calypso authentication errors
 */
export type CalypsoErrorHandler = ( error: CalypsoAuthError ) => string;

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
 * Check if this is a WordPress.com simple site
 */
function isSimpleSite(): boolean {
	return (
		typeof window !== 'undefined' &&
		typeof window._currentSiteType === 'string' &&
		window._currentSiteType === 'simple'
	);
}

/**
 * Check if we're in Calypso proper (not wp-admin widget)
 */
function isCalypsoEnvironment(): boolean {
	if ( typeof window === 'undefined' ) {
		return false;
	}

	const urlOrigin = window.location.origin;
	return (
		/^http(s)?:\/\/calypso\.localhost(:\d+)?$/.test( urlOrigin ) ||
		/^http(s)?:\/\/[a-z0-9-]+\.calypso\.live$/.test( urlOrigin ) ||
		/^https:\/\/wordpress\.com$/.test( urlOrigin )
	);
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
	const cachedToken = localStorage.getItem( JWT_TOKEN_ID );
	if ( cachedToken && useCachedToken ) {
		try {
			const tokenData = JSON.parse( cachedToken ) as TokenData;
			if ( tokenData?.token && tokenData?.expire && tokenData.expire > Date.now() ) {
				return tokenData;
			}
		} catch {
			// Invalid cached token, continue to fetch new one
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
		if ( ! isSimpleSite() ) {
			// Jetpack-connected site
			data = await apiFetch< { token: string; blog_id: string } >( {
				path: '/jetpack/v4/jetpack-ai-jwt?_cacheBuster=' + Date.now(),
				credentials: 'same-origin',
				headers: {
					'X-WP-Nonce': apiNonce || '',
				},
				method: 'POST',
			} );
		} else {
			// WordPress.com simple site
			if ( ! effectiveSiteId ) {
				throw new Error( 'Site ID is required for simple sites' );
			}
			data = await apiFetch< { token: string; blog_id: string } >( {
				path: '/wpcom/v2/sites/' + effectiveSiteId + '/jetpack-openai-query/jwt',
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
	try {
		localStorage.setItem( JWT_TOKEN_ID, JSON.stringify( newTokenData ) );
	} catch {
		// Continue without caching
	}

	return newTokenData;
}

/**
 * Request a JWT token using wpcomRequest (for Calypso contexts)
 * @param siteId - Site ID for fetching JWT tokens
 */
async function requestJWTTokenViaWpcom( siteId: string | number ): Promise< string | null > {
	try {
		const data = ( await wpcomRequest( {
			path: `/sites/${ siteId }/jetpack-openai-query/jwt`,
			apiNamespace: 'wpcom/v2',
			method: 'POST',
		} ) ) as { token?: string; jwt?: string };

		const token = data?.token || data?.jwt;
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

		// Check if we're in Calypso proper
		const inCalypso = isCalypsoEnvironment();

		if ( inCalypso && canAccessWpcomApis() ) {
			// In Calypso: Try OAuth token first, then JWT via wpcomRequest
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
		return 'Your session expired. Please refresh the page and try again.';
	}

	if ( error?.code === 'rest_forbidden' || error?.status === 403 ) {
		return "You don't have permission to access AI features.";
	}

	if ( error?.code === 'rest_no_route' || error?.status === 404 ) {
		return 'AI service is not available. Please try again later.';
	}

	if (
		error?.message?.includes( 'network' ) ||
		error?.message?.includes( 'Network' ) ||
		error?.message?.includes( 'fetch' )
	) {
		return 'Network connection issue. Please check your internet connection and try again.';
	}

	if ( error?.status === 401 ) {
		return 'Your session expired. Please refresh the page and try again.';
	}

	return 'Unable to connect to AI service. Please try again.';
};

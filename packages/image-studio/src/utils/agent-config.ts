/**
 * Agent Configuration utilities for Image Studio
 *
 * Provides a default agent config factory that can be overridden by the parent.
 */

/**
 * External dependencies
 */
import * as oauthToken from '@automattic/oauth-token';
import apiFetch from '@wordpress/api-fetch';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import { registerUpdateCanvasImageAbility } from '../abilities';
import { contextProvider } from './client-context';
import { createToolProvider } from './tool-provider';
import type { AuthProvider, UseAgentChatConfig } from '@automattic/agenttic-client';

/**
 * Constants
 */
const ORCHESTRATOR_AGENT_URL = 'https://public-api.wordpress.com/wpcom/v2/ai/agent';
const ORCHESTRATOR_AGENT_ID = 'wp-orchestrator';
const JWT_TOKEN_ID = 'jetpack-ai-jwt-token';
const JWT_TOKEN_EXPIRATION_TIME = 30 * 60 * 1000; // 30 minutes

/**
 * Agent config factory type
 */
export interface AgentConfigFactory {
	createAgentConfig: ( sessionId: string ) => Promise< UseAgentChatConfig >;
}

interface TokenData {
	token: string;
	blogId: string;
	expire: number;
}

declare global {
	interface Window {
		JP_CONNECTION_INITIAL_STATE?: {
			apiNonce: string;
			siteSuffix: string;
			connectionStatus: { isActive: boolean; isRegistered: boolean };
		};
		Jetpack_Editor_Initial_State?: {
			wpcomBlogId: string;
		};
		_currentSiteId?: number;
	}
}

/**
 * Get cached JWT token data from sessionStorage
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
 */
function setCachedJwtToken( key: string, tokenData: TokenData ): void {
	try {
		sessionStorage.setItem( key, JSON.stringify( tokenData ) );
	} catch {
		// Continue without caching
	}
}

/**
 * Get OAuth token from Calypso
 */
function getOAuthToken(): string | null {
	const oauthTokenValue = oauthToken.getToken();
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
 * Request a JWT token using wpcomRequest (for simple site contexts)
 */
async function requestJWTTokenViaWpcom( siteId: string | number ): Promise< string | null > {
	const cacheKey = `${ JWT_TOKEN_ID }-wpcom-${ siteId }`;

	// Check for cached token
	const cached = getCachedJwtToken( cacheKey );
	if ( cached ) {
		return cached.token;
	}

	try {
		const data = ( await wpcomRequest( {
			path: `/sites/${ siteId }/jetpack-openai-query/jwt`,
			apiNamespace: 'wpcom/v2',
			method: 'POST',
		} ) ) as { token?: string; jwt?: string };

		const token = data?.token || data?.jwt;

		if ( token ) {
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
		console.error( '[Image Studio] Failed to get JWT token via wpcomRequest:', error );
		return null;
	}
}

/**
 * Request a JWT token from the WordPress REST API (for Jetpack-connected sites)
 */
async function requestJWTToken(): Promise< TokenData | null > {
	// Check for cached token
	const cached = getCachedJwtToken( JWT_TOKEN_ID );
	if ( cached ) {
		return cached;
	}

	const apiNonce = window.JP_CONNECTION_INITIAL_STATE?.apiNonce;

	try {
		const data = await apiFetch< { token: string; blog_id: string } >( {
			path: '/jetpack/v4/jetpack-ai-jwt?_cacheBuster=' + Date.now(),
			credentials: 'same-origin',
			headers: {
				'X-WP-Nonce': apiNonce || '',
			},
			method: 'POST',
		} );

		if ( ! data?.token ) {
			return null;
		}

		const newTokenData: TokenData = {
			token: data.token,
			blogId: data.blog_id || '',
			expire: Date.now() + JWT_TOKEN_EXPIRATION_TIME,
		};

		setCachedJwtToken( JWT_TOKEN_ID, newTokenData );
		return newTokenData;
	} catch ( error ) {
		// eslint-disable-next-line no-console
		console.error( '[Image Studio] Failed to get JWT token:', error );
		return null;
	}
}

/**
 * Get the current site ID from various sources
 */
function getSiteId(): number | string | null {
	// Try window._currentSiteId (set by WordPress.com)
	if ( window._currentSiteId ) {
		return window._currentSiteId;
	}

	// Try Jetpack editor state
	if ( window.Jetpack_Editor_Initial_State?.wpcomBlogId ) {
		return window.Jetpack_Editor_Initial_State.wpcomBlogId;
	}

	return null;
}

/**
 * Create an authentication provider
 * Handles both WordPress.com simple sites (OAuth/JWT via wpcom) and Jetpack sites (JWT via apiFetch)
 */
const createAuthProvider = (): AuthProvider => {
	return async () => {
		const headers: Record< string, string > = {
			'Content-Type': 'application/json',
		};

		if ( canAccessWpcomApis() ) {
			// WordPress.com context - try OAuth first
			const token = getOAuthToken();
			if ( token ) {
				headers.Authorization = `Bearer ${ token }`;
				return headers;
			}

			// Fallback to JWT via wpcomRequest
			const siteId = getSiteId();
			if ( siteId ) {
				const jwtToken = await requestJWTTokenViaWpcom( siteId );
				if ( jwtToken ) {
					headers.Authorization = `Bearer ${ jwtToken }`;
					return headers;
				}
			}
		} else {
			// Jetpack-connected site context - use JWT via apiFetch
			try {
				const tokenData = await requestJWTToken();
				if ( tokenData?.token ) {
					headers.Authorization = tokenData.token;
					return headers;
				}
			} catch ( error ) {
				// eslint-disable-next-line no-console
				console.error( '[Image Studio] Auth provider error:', error );
			}
		}

		return headers;
	};
};

/**
 * Create a default agent config for Image Studio
 * @param sessionId - The session ID
 * @returns Agent configuration
 */
async function createDefaultAgentConfig( sessionId: string ): Promise< UseAgentChatConfig > {
	// Register abilities before creating config
	await registerUpdateCanvasImageAbility();

	return {
		agentId: ORCHESTRATOR_AGENT_ID,
		agentUrl: ORCHESTRATOR_AGENT_URL,
		sessionId,
		authProvider: createAuthProvider(),
		contextProvider,
		toolProvider: createToolProvider(),
	};
}

/**
 * Default agent config factory
 */
export const defaultAgentConfigFactory: AgentConfigFactory = {
	createAgentConfig: createDefaultAgentConfig,
};

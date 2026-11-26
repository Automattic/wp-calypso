/**
 * Agent Configuration utilities for Image Studio
 *
 * Provides a default agent config factory that can be overridden by the parent.
 */
import * as oauthToken from '@automattic/oauth-token';
import apiFetch from '@wordpress/api-fetch';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import { registerUpdateCanvasImageAbility } from '../abilities';
import { contextProvider } from './client-context';
import { createToolProvider } from './tool-provider';
import type { AuthProvider, UseAgentChatConfig } from '@automattic/agenttic-client';

const ORCHESTRATOR_AGENT_URL = 'https://public-api.wordpress.com/wpcom/v2/ai/agent';
const ORCHESTRATOR_AGENT_ID = 'wp-orchestrator';
const JWT_TOKEN_ID = 'jetpack-ai-jwt-token';
const JWT_TOKEN_EXPIRATION_TIME = 30 * 60 * 1000; // 30 minutes

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
		// Note: _currentSiteId is declared in @automattic/data-stores/shared-types
	}
}

function getCachedJwtToken( key: string ): TokenData | null {
	try {
		const cached = sessionStorage.getItem( key );
		if ( ! cached ) {
			return null;
		}
		const tokenData = JSON.parse( cached ) as TokenData;
		const isValid = tokenData?.token && tokenData?.expire && tokenData.expire > Date.now();
		return isValid ? tokenData : null;
	} catch {
		return null;
	}
}

function setCachedJwtToken( key: string, tokenData: TokenData ): void {
	try {
		sessionStorage.setItem( key, JSON.stringify( tokenData ) );
	} catch {
		// Storage may be unavailable
	}
}

function getOAuthToken(): string | null {
	const token = oauthToken.getToken();
	if ( token && typeof token === 'string' ) {
		return token;
	}

	// Fallback: try localStorage directly
	try {
		return window?.localStorage?.getItem( 'wpcom_token' ) ?? null;
	} catch {
		return null;
	}
}

async function requestJWTTokenViaWpcom( siteId: string | number ): Promise< string | null > {
	const cacheKey = `${ JWT_TOKEN_ID }-wpcom-${ siteId }`;
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
			setCachedJwtToken( cacheKey, {
				token,
				blogId: String( siteId ),
				expire: Date.now() + JWT_TOKEN_EXPIRATION_TIME,
			} );
		}
		return token || null;
	} catch ( error ) {
		window.console?.error?.( '[Image Studio] Failed to get JWT token via wpcomRequest:', error );
		return null;
	}
}

async function requestJWTToken(): Promise< TokenData | null > {
	const cached = getCachedJwtToken( JWT_TOKEN_ID );
	if ( cached ) {
		return cached;
	}

	try {
		const data = await apiFetch< { token: string; blog_id: string } >( {
			path: '/jetpack/v4/jetpack-ai-jwt?_cacheBuster=' + Date.now(),
			credentials: 'same-origin',
			headers: {
				'X-WP-Nonce': window.JP_CONNECTION_INITIAL_STATE?.apiNonce || '',
			},
			method: 'POST',
		} );

		if ( ! data?.token ) {
			return null;
		}

		const tokenData: TokenData = {
			token: data.token,
			blogId: data.blog_id || '',
			expire: Date.now() + JWT_TOKEN_EXPIRATION_TIME,
		};
		setCachedJwtToken( JWT_TOKEN_ID, tokenData );
		return tokenData;
	} catch ( error ) {
		window.console?.error?.( '[Image Studio] Failed to get JWT token:', error );
		return null;
	}
}

function getSiteId(): number | string | null {
	return window._currentSiteId || window.Jetpack_Editor_Initial_State?.wpcomBlogId || null;
}

/**
 * Create an authentication provider.
 * Handles WordPress.com sites (OAuth/JWT) and Jetpack-connected sites (JWT via apiFetch).
 */
function createAuthProvider(): AuthProvider {
	return async () => {
		const headers: Record< string, string > = {
			'Content-Type': 'application/json',
		};

		if ( canAccessWpcomApis() ) {
			// WordPress.com context - try OAuth first, then JWT via wpcomRequest
			const oauthToken = getOAuthToken();
			if ( oauthToken ) {
				headers.Authorization = `Bearer ${ oauthToken }`;
				return headers;
			}

			const siteId = getSiteId();
			if ( siteId ) {
				const jwtToken = await requestJWTTokenViaWpcom( siteId );
				if ( jwtToken ) {
					headers.Authorization = `Bearer ${ jwtToken }`;
					return headers;
				}
			}
		} else {
			// Jetpack-connected site - use JWT via apiFetch
			const tokenData = await requestJWTToken();
			if ( tokenData?.token ) {
				headers.Authorization = tokenData.token;
				return headers;
			}
		}

		return headers;
	};
}

export async function createDefaultAgentConfig( sessionId: string ): Promise< UseAgentChatConfig > {
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

export const defaultAgentConfigFactory: AgentConfigFactory = {
	createAgentConfig: createDefaultAgentConfig,
};

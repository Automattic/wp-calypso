/**
 * Issues / caches a Jetpack AI JWT for the current site.
 *
 * /wpcom/v2/jetpack-ai-image (and other Jetpack AI endpoints) require a bearer
 * token in addition to the wpcom-proxy-request user auth. The token is minted
 * by POST /wpcom/v2/sites/{siteId}/jetpack-openai-query/jwt and is scoped to
 * the user's Jetpack AI entitlement on that blog.
 *
 * Mirrors the pattern in
 * packages/jetpack-ai-calypso/src/logo-generator/lib/request-token.ts. We use
 * the same localStorage key so the JWT is shared across all Jetpack AI users
 * in the page (logo generator, image studio, dictation, etc.).
 */

import wpcomRequest from 'wpcom-proxy-request';

// Shared with @automattic/jetpack-ai-calypso so the cached token is reused
// across features.
const JWT_STORAGE_KEY = 'jetpack-ai-jwt';
// Server-side expiry is 30 minutes (jetpack-openai-query.php). Shave 5 minutes
// off so a request using a near-expiry cached token still arrives at the
// server with time to spare instead of racing the boundary into a 401.
const JWT_CACHE_TTL_MS = 25 * 60 * 1000;

interface JwtEndpointResponse {
	token?: string;
	blog_id?: string | number;
}

interface CachedJwt {
	token: string;
	blogId: string | number;
	expire: number;
}

declare global {
	interface Window {
		_currentSiteId?: number;
		Jetpack_Editor_Initial_State?: {
			wpcomBlogId: string;
		};
	}
}

function resolveSiteId(): string | null {
	const fromWpcom = window._currentSiteId;
	if ( fromWpcom ) {
		return String( fromWpcom );
	}
	const fromJetpack = window.Jetpack_Editor_Initial_State?.wpcomBlogId;
	if ( fromJetpack ) {
		return String( fromJetpack );
	}
	return null;
}

function readCachedJwt(): CachedJwt | null {
	try {
		const raw = localStorage.getItem( JWT_STORAGE_KEY );
		if ( ! raw ) {
			return null;
		}
		const parsed = JSON.parse( raw ) as CachedJwt;
		if ( ! parsed?.token || ! parsed?.expire ) {
			return null;
		}
		if ( parsed.expire <= Date.now() ) {
			return null;
		}
		return parsed;
	} catch {
		return null;
	}
}

function writeCachedJwt( value: CachedJwt ): void {
	try {
		localStorage.setItem( JWT_STORAGE_KEY, JSON.stringify( value ) );
	} catch {
		// localStorage may be disabled (private mode, full quota); fall through.
	}
}

export async function requestJetpackAiJwt(): Promise< CachedJwt > {
	const cached = readCachedJwt();
	if ( cached ) {
		return cached;
	}

	const siteId = resolveSiteId();
	if ( ! siteId ) {
		throw new Error(
			'Could not resolve current site ID (window._currentSiteId / Jetpack_Editor_Initial_State.wpcomBlogId both missing).'
		);
	}

	const data = await wpcomRequest< JwtEndpointResponse >( {
		path: `/sites/${ siteId }/jetpack-openai-query/jwt`,
		apiNamespace: 'wpcom/v2',
		method: 'POST',
	} );

	if ( ! data?.token ) {
		throw new Error( 'Jetpack AI JWT endpoint returned no token.' );
	}

	const value: CachedJwt = {
		token: data.token,
		blogId: data.blog_id ?? siteId,
		expire: Date.now() + JWT_CACHE_TTL_MS,
	};

	writeCachedJwt( value );
	return value;
}

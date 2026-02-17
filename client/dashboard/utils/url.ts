import { getProtocol } from '@wordpress/url';
import { dashboardOrigins, wpcomLink } from './link';

export function isRelativeUrl( url: string ) {
	if ( ! url ) {
		return false;
	}

	return ! url.startsWith( '//' ) && ! getProtocol( url );
}

export function isOnboardingUrl( url: string ) {
	return [ '/setup', '/start' ].some( ( path ) => url.startsWith( wpcomLink( path ) ) );
}

export function urlToSlug( url: string ) {
	return url.replace( /^https?:\/\//, '' ).replace( /\//g, '::' );
}

export function queryParamToArray( param: unknown ): string[] {
	return typeof param === 'string'
		? param.split( ',' ).map( ( domain: string ) => domain.trim() )
		: [];
}

/**
 * Validates a redirect URL against a list of trusted origins.
 * Prevents open redirect attacks by only allowing relative URLs,
 * URLs pointing to trusted Automattic domains, or URLs matching
 * a specific trusted domain (e.g., a purchase's site domain).
 */
export function isRedirectAllowed( url: string, trustedDomain?: string ): boolean {
	const trimmed = url.trim();
	if ( isRelativeUrl( trimmed ) ) {
		return true;
	}
	try {
		const parsed = new URL( trimmed );
		if ( trustedDomain && parsed.hostname === trustedDomain ) {
			return true;
		}
		return dashboardOrigins().some( ( origin ) => parsed.origin === origin );
	} catch {
		return false;
	}
}

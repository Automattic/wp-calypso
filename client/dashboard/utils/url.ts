import { determineUrlType, URL_TYPE } from '@automattic/calypso-url';
import { dashboardOrigins, wpcomLink } from './link';

export function isRelativeUrl( url: string ) {
	if ( ! url ) {
		return false;
	}

	const type = determineUrlType( url );
	return type === URL_TYPE.PATH_ABSOLUTE || type === URL_TYPE.PATH_RELATIVE;
}

/**
 * The URL, resolved against `base` and normalized, when it's on one of `origins`.
 * A prefix check on the normalized URL is what code scanners recognize as pinning the host.
 */
export function getUrlOnOrigins( url: string, origins: string[], base?: string ) {
	let href;
	try {
		href = new URL( url, base ).href;
	} catch {
		return undefined;
	}
	for ( const allowed of origins ) {
		if ( href.startsWith( `${ new URL( allowed ).origin }/` ) ) {
			return href;
		}
	}
	return undefined;
}

/**
 * The domain's connection setup URL from a `domainConnectionSetupUrl` template, which
 * arrives via the query string. The URL is checked after the domain is filled in, since
 * a template of just `%s` passes any origin check, and must be on this origin or the dashboard's.
 */
export function resolveDomainConnectionSetupUrl(
	template: string | null | undefined,
	domain: string
) {
	if ( ! template ) {
		return undefined;
	}
	return getUrlOnOrigins(
		template.replace( '%s', domain ),
		[ window.location.origin, ...dashboardOrigins() ],
		window.location.origin
	);
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

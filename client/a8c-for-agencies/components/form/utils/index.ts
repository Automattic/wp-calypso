import debugFactory from 'debug';
import wpcom from 'calypso/lib/wp';

const debug = debugFactory( 'calypso:a4a:form-utils' );

/**
 * Extract the root domain from a URL string.
 */
export function extractRootDomain( url: string ): string {
	let cleaned = url.trim().toLowerCase();
	cleaned = cleaned.replace( /^https?:\/\//, '' );
	cleaned = cleaned.replace( /^www\./, '' );
	cleaned = cleaned.split( '/' )[ 0 ];
	cleaned = cleaned.split( '?' )[ 0 ];
	cleaned = cleaned.split( '#' )[ 0 ];
	cleaned = cleaned.split( ':' )[ 0 ];
	return cleaned;
}

/**
 * Check whether a URL's domain is on the non-unique domain denylist.
 *
 * The denylist is fetched from the backend via /agency/signup-context
 * and passed in as a Set. Returns false if no denylist is available.
 */
export function isDeniedNonUniqueDomain( url: string, denylist?: Set< string > ): boolean {
	if ( ! denylist || denylist.size === 0 ) {
		return false;
	}
	const domain = extractRootDomain( url );
	if ( denylist.has( domain ) ) {
		return true;
	}
	const parts = domain.split( '.' );
	if ( parts.length > 2 ) {
		const parentDomain = parts.slice( -2 ).join( '.' );
		if ( denylist.has( parentDomain ) ) {
			return true;
		}
	}
	return false;
}

export function isValidUrl( url: string ) {
	return (
		url.length > 3 &&
		/^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(:[0-9]{1,5})?(\/[^\s]*)?$/i.test( url )
	);
}

export function areURLsUnique( urls: unknown[] ) {
	const urlSet = new Set( urls );
	return urlSet.size === urls.length;
}

export async function isSiteActive( url: string ) {
	// Ensure the URL has a valid protocol (default to HTTPS if missing)
	if ( ! /^https?:\/\//i.test( url ) ) {
		url = `https://${ url }`;
	}

	try {
		// Make a request to the wpcom API to validate the URL
		const response = await wpcom.req.get( {
			path: `/agency/validate/url?value=${ encodeURIComponent( url ) }`,
			apiNamespace: 'wpcom/v2',
		} );

		if ( response?.is_valid ) {
			return true;
		}

		return false;
	} catch ( error ) {
		debug( `Error checking site: ${ error }` );
		return false;
	}
}

export async function isAgencyNameExists( agencyName: string ) {
	const response = await wpcom.req.get( {
		path: `/agency/exists/name?value=${ encodeURIComponent( agencyName ) }`,
		apiNamespace: 'wpcom/v2',
	} );

	if ( response?.exists ) {
		return true;
	}

	return false;
}

export async function isAgencyUrlExists( url: string ) {
	const response = await wpcom.req.get( {
		path: `/agency/exists/url?value=${ encodeURIComponent( url ) }`,
		apiNamespace: 'wpcom/v2',
	} );

	if ( response?.exists ) {
		return true;
	}

	return false;
}

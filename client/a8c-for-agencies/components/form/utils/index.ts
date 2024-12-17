import debugFactory from 'debug';
import wpcom from 'calypso/lib/wp';

const debug = debugFactory( 'calypso:a4a:form-utils' );

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

/**
 * External Dependencies
 */
import url from 'url';
import { startsWith, replace } from 'lodash';

export function isUrl( query ) {
	let parsedUrl = url.parse( query );

	// Make sure the query has a protocol - hostname ends up blank otherwise
	if ( ! parsedUrl.protocol ) {
		parsedUrl = url.parse( 'http://' + query );
	}

	if ( ! parsedUrl.hostname || parsedUrl.hostname.indexOf( '.' ) === -1 ) {
		return false;
	}

	// Check for a valid-looking TLD
	if ( parsedUrl.hostname.lastIndexOf( '.' ) > ( parsedUrl.hostname.length - 3 ) ) {
		return false;
	}

	// Make sure the hostname has at least two parts separated by a dot
	const hostnameParts = parsedUrl.hostname.split( '.' ).filter( Boolean );
	if ( hostnameParts.length < 2 ) {
		return false;
	}

	return true;
}

export function prependUrlProtocol( query ) {
	if ( startsWith( 'http://', query ) || startsWith( 'https://', query ) ) {
		return query;
	}

	return 'http://' + query;
}

export function stripUrlProtocol( query ) {
	return replace( query, /http(s?):\/\//g, '' );
}

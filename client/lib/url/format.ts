/**
 * External dependencies
 */
import { URL as URLString } from 'types';
import { Falsy } from 'utility-types';

/**
 * Internal dependencies
 */
import { determineUrlType, URL_TYPE } from './url-type';

const BASE_URL = `http://__domain__.invalid/`;

/**
 * Format a URL as a particular type.
 * Does not support formatting path-relative URLs.
 *
 * @param url The URL to format.
 * @param urlType The URL type into which to format. If not provided, defaults to the same type as
 *                `url`, which effectively results in the URL being normalized.
 *
 * @returns The formatted URL.
 */
export default function format( url: URLString | URL | Falsy, urlType?: URL_TYPE ): URLString {
	let parsed: URL;
	let originalType: URL_TYPE;

	if ( url instanceof URL ) {
		// The native URL object can only represent absolute URLs.
		parsed = url;
		originalType = URL_TYPE.ABSOLUTE;
	} else {
		originalType = determineUrlType( url );

		if ( originalType === URL_TYPE.INVALID ) {
			throw new Error( 'Cannot format an invalid URL.' );
		}

		if ( originalType === URL_TYPE.PATH_RELATIVE ) {
			throw new Error( 'Cannot format path-relative URLs.' );
		}

		parsed = new URL( url as URLString, BASE_URL );
	}

	if ( urlType === undefined ) {
		urlType = originalType;
	}

	switch ( urlType ) {
		case URL_TYPE.PATH_RELATIVE:
			throw new Error( 'Cannot format into path-relative URLs.' );

		case URL_TYPE.PATH_ABSOLUTE:
			return parsed.href.replace( parsed.origin, '' );

		case URL_TYPE.SCHEME_RELATIVE:
			if ( originalType === URL_TYPE.PATH_ABSOLUTE ) {
				throw new Error( 'Cannot format a path-absolute URL as a scheme-relative URL.' );
			}
			return parsed.href.replace( parsed.protocol, '' );

		case URL_TYPE.ABSOLUTE:
			if ( originalType !== URL_TYPE.ABSOLUTE ) {
				throw new Error( 'Cannot format a partial URL as an absolute URL.' );
			}
			return parsed.href;

		default:
			throw new Error( `Cannot format as \`${ urlType }\` URL type.` );
	}
}

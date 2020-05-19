/**
 * External dependencies
 */
import { pickBy } from 'lodash';
import { Primitive } from 'utility-types';

/**
 * Internal dependencies
 */
import { URL as URLString } from 'types';
import { determineUrlType, URL_TYPE } from './url-type';
import format from './format';

const BASE_URL = 'http://__domain__.invalid';

interface QueryArgs {
	[ key: string ]: Primitive;
}

export default function addQueryArgs( args: QueryArgs, url: URLString ): URLString {
	if ( 'object' !== typeof args ) {
		throw new Error( 'addQueryArgs expects the first argument to be an object.' );
	}

	if ( 'string' !== typeof url ) {
		throw new Error( 'addQueryArgs expects the second argument to be a string.' );
	}

	const urlType = determineUrlType( url );

	if ( urlType === URL_TYPE.INVALID ) {
		throw new Error( 'addQueryArgs expects the second argument to be a valid URL.' );
	}

	// Remove any undefined query args
	args = pickBy( args, ( arg ) => arg != null );

	const parsed = new URL( url, BASE_URL );

	const newSearch = new URLSearchParams( parsed.search );
	for ( const key of Object.keys( args ) ) {
		newSearch.set( key, String( args[ key ] ) );
	}

	// Path-relative URLs require special handling, because they cannot be transformed
	// into an absolute URL without potentially losing path information.
	// E.g. `../foo?bar=baz` becomes `<base>/foo?bar=baz` when fed to `new URL()`
	// with a base, losing the traversal into the parent directory.
	// We need to handle these with a string replace instead.
	if ( urlType === URL_TYPE.PATH_RELATIVE ) {
		let serializedSearch = newSearch.toString();
		if ( serializedSearch !== '' ) {
			serializedSearch = `?${ serializedSearch }`;
		}

		// The URL had some params already.
		if ( parsed.search !== '' ) {
			return url.replace( parsed.search, serializedSearch );
		}

		// The URL didn't have params, but it had a hash.
		if ( parsed.hash ) {
			return url.replace( parsed.hash, `${ serializedSearch }${ parsed.hash }` );
		}

		// The URL didn't have params nor a hash.
		return `${ url }${ serializedSearch }`;
	}

	parsed.search = newSearch.toString();

	// Format the new URL into the same type the original had.
	return format( parsed, urlType );
}

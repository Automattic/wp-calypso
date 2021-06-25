/**
 * Internal dependencies
 */
import { determineUrlType, URL_TYPE } from '@automattic/calypso-url';

const DUMMY_URL = 'http://__domain__.invalid/';

export default function resolveRelativePath( basePath: string, relativePath: string ): string {
	basePath = basePath || '/';
	const baseType = determineUrlType( basePath );

	if ( baseType !== URL_TYPE.PATH_ABSOLUTE ) {
		throw new Error( '`basePath` should be an absolute path' );
	}

	const url = new URL( DUMMY_URL );
	url.pathname = basePath;

	if ( ! relativePath ) {
		return url.pathname;
	}

	url.pathname =
		( url.pathname.endsWith( '/' ) ? url.pathname.slice( 0, -1 ) : url.pathname ) +
		( relativePath.startsWith( '/' ) ? '' : '/' ) +
		relativePath;

	return url.pathname;
}

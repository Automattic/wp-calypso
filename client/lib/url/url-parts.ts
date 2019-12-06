/**
 * External dependencies
 */
import { URL as URLString } from 'types';

/**
 * Internal dependencies
 */
import { determineUrlType, URL_TYPE } from './url-type';

const BASE_URL = `http://__domain__.invalid`;

type UrlPartKey = keyof URL;

const URL_PART_KEYS: UrlPartKey[] = [
	'protocol',
	'host',
	'hostname',
	'port',
	'origin',
	'pathname',
	'hash',
	'search',
	'searchParams',
	'username',
	'password',
];

interface UrlParts {
	protocol: string;
	host: string;
	hostname: string;
	port: string;
	origin: string;
	pathname: string;
	hash: string;
	search: string;
	searchParams: URLSearchParams;
	username: string;
	password: string;
}

function pickUrlParts(
	parsedUrl: URL | undefined,
	include: UrlPartKey[] = URL_PART_KEYS
): UrlParts {
	const result = URL_PART_KEYS.reduce(
		( parts, part ) => ( {
			...parts,
			[ part ]: include.includes( part ) ? parsedUrl?.[ part ] ?? '' : '',
		} ),
		{} as UrlParts
	);
	result.searchParams = result.searchParams || new URLSearchParams();

	return result;
}

/**
 * Returns the various available URL parts.
 *
 * @param url the URL to analyze
 *
 * @returns   the URL parts
 */
export function getUrlParts( url: URLString | URL ): UrlParts {
	const urlType = determineUrlType( url );

	// Invalid URL; return empty URL parts.
	if ( urlType === URL_TYPE.INVALID ) {
		return pickUrlParts( undefined, [] );
	}

	const parsed = url instanceof URL ? url : new URL( url, BASE_URL );

	// Absolute URL; pick all parts.
	if ( urlType === URL_TYPE.ABSOLUTE ) {
		return pickUrlParts( parsed );
	}

	// Scheme-relative URL; pick everything except the protocol and origin.
	if ( urlType === URL_TYPE.SCHEME_RELATIVE ) {
		return pickUrlParts(
			parsed,
			URL_PART_KEYS.filter( item => item !== 'protocol' && item !== 'origin' )
		);
	}

	// Path-absolute or path-relative URL; pick only a few parts.
	const pathPartKeys: UrlPartKey[] = [ 'pathname', 'hash', 'search' ];
	const pathParts = pickUrlParts( parsed, pathPartKeys );

	// Path-relative URLs require special handling, because they cannot be transformed
	// into an absolute URL without potentially losing path information.
	// E.g. `../foo?bar=baz` becomes `<base>/foo?bar=baz` when fed to `new URL()`
	// with a base, losing the traversal into the parent directory.
	// We need to handle these with string functions instead.
	if ( urlType === URL_TYPE.PATH_RELATIVE ) {
		pathParts.pathname = ( url as URLString ).split( /[?#]/, 1 )[ 0 ];
	}

	return pathParts;
}

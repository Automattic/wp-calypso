/**
 * External dependencies
 */
import { URL as URLString } from 'types';

/**
 * Internal dependencies
 */
import { determineUrlType, URL_TYPE } from './url-type';

const BASE_URL = `http://__domain__.invalid`;

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

interface OptionalUrlParts {
	protocol?: string;
	host?: string;
	hostname?: string;
	port?: string;
	origin?: string;
	pathname?: string;
	hash?: string;
	search?: string;
	searchParams?: URLSearchParams;
	username?: string;
	password?: string;
}

type UrlPartKey = keyof UrlParts;

const EMPTY_URL: Readonly< UrlParts > = Object.freeze( {
	protocol: '',
	host: '',
	hostname: '',
	port: '',
	origin: '',
	pathname: '',
	hash: '',
	search: '',
	searchParams: new URLSearchParams(),
	username: '',
	password: '',
} );

const URL_PART_KEYS = Object.keys( EMPTY_URL ) as UrlPartKey[];

function pickUrlParts(
	parsedUrl: URL | undefined,
	include: UrlPartKey[] = URL_PART_KEYS
): UrlParts {
	const pickedUrl = { ...EMPTY_URL };

	include.forEach( < T extends UrlPartKey >( name: T ) => {
		pickedUrl[ name ] = parsedUrl?.[ name ] ?? EMPTY_URL[ name ];
	} );

	return pickedUrl;
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
		return { ...EMPTY_URL };
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
			URL_PART_KEYS.filter( ( item ) => item !== 'protocol' && item !== 'origin' )
		);
	}

	// Path-absolute or path-relative URL; pick only a few parts.
	const pathPartKeys: UrlPartKey[] = [ 'pathname', 'hash', 'search', 'searchParams' ];
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

/**
 * Returns a URL object built from the provided URL parts.
 *
 * @param parts the provided URL parts.
 *
 * @returns the generated URL object.
 */
export function getUrlFromParts( parts: OptionalUrlParts ): URL {
	if ( ! parts?.protocol && ! parts?.origin ) {
		throw new Error( 'getUrlFromParts: protocol missing.' );
	}

	if ( ! parts.host && ! parts.hostname && ! parts.origin ) {
		throw new Error( 'getUrlFromParts: host missing.' );
	}

	const result = new URL( BASE_URL );

	// Apply 'origin' first, since it includes protocol, hostname, and port.
	if ( parts.origin ) {
		try {
			const origin = new URL( parts.origin );
			result.host = origin.host;
			result.protocol = origin.protocol;
		} catch {
			throw new Error( 'getUrlFromParts: invalid origin.' );
		}
	}

	// Apply 'host' next, since it includes both hostname and port.
	result.host = parts.host || result.host;

	// Apply 'searchParams' object if it's specified.
	if ( parts.searchParams?.toString ) {
		result.search = parts.searchParams.toString();
	}

	for ( const part of URL_PART_KEYS ) {
		if ( part !== 'host' && part !== 'origin' && part !== 'searchParams' ) {
			const value = parts[ part ];
			// Avoid some implementation bugs, e.g. https://bugs.webkit.org/show_bug.cgi?id=127958.
			if ( value && value !== result[ part ] ) {
				result[ part ] = value;
			}
		}
	}
	return result;
}

/**
 * Inlined from:
 *   - packages/calypso-url/src/url-type.ts
 *   - packages/calypso-url/src/url-parts.ts
 *   - client/lib/safe-protocol-url/index.js
 */

// For complete definitions of these classifications, see:
// https://url.spec.whatwg.org/#urls
const enum URL_TYPE {
	// A complete URL, with (at least) protocol and host.
	ABSOLUTE = 'ABSOLUTE',
	// A URL with no protocol, but with a host.
	SCHEME_RELATIVE = 'SCHEME_RELATIVE',
	// A URL with no protocol or host, but with a path starting at the root.
	PATH_ABSOLUTE = 'PATH_ABSOLUTE',
	// A URL with no protocol or host, but with a path relative to the current resource.
	PATH_RELATIVE = 'PATH_RELATIVE',
	// Any invalid URL.
	INVALID = 'INVALID',
}

const BASE_HOSTNAME = '__domain__.invalid';
const BASE_URL = `http://${ BASE_HOSTNAME }`;

function determineUrlType( url: string | URL ): URL_TYPE {
	if ( ! ( url instanceof URL ) && typeof url !== 'string' ) {
		return URL_TYPE.INVALID;
	}

	if ( url === '' ) {
		return URL_TYPE.PATH_RELATIVE;
	}

	if ( url instanceof URL ) {
		return URL_TYPE.ABSOLUTE;
	}

	let parsed;

	try {
		parsed = new URL( url );
		if ( parsed.protocol && parsed.protocol !== ':' ) {
			return URL_TYPE.ABSOLUTE;
		}
	} catch {
		// Do nothing.
	}

	try {
		parsed = new URL( url, BASE_URL );
	} catch {
		return URL_TYPE.INVALID;
	}

	if ( parsed.pathname === '' ) {
		return URL_TYPE.INVALID;
	}

	if ( parsed.hostname !== BASE_HOSTNAME ) {
		return URL_TYPE.SCHEME_RELATIVE;
	}

	if ( url.startsWith( '/' ) ) {
		return URL_TYPE.PATH_ABSOLUTE;
	}
	return URL_TYPE.PATH_RELATIVE;
}

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

function getUrlParts( url: string | URL ): UrlParts {
	const urlType = determineUrlType( url );

	if ( urlType === URL_TYPE.INVALID ) {
		return { ...EMPTY_URL };
	}

	const parsed = url instanceof URL ? url : new URL( url, BASE_URL );

	if ( urlType === URL_TYPE.ABSOLUTE ) {
		return pickUrlParts( parsed );
	}

	if ( urlType === URL_TYPE.SCHEME_RELATIVE ) {
		return pickUrlParts(
			parsed,
			URL_PART_KEYS.filter( ( item ) => item !== 'protocol' && item !== 'origin' )
		);
	}

	const pathPartKeys: UrlPartKey[] = [ 'pathname', 'hash', 'search', 'searchParams' ];
	const pathParts = pickUrlParts( parsed, pathPartKeys );

	if ( urlType === URL_TYPE.PATH_RELATIVE ) {
		pathParts.pathname = ( url as string ).split( /[?#]/, 1 )[ 0 ];
	}

	return pathParts;
}

function getUrlFromParts( parts: OptionalUrlParts ): URL {
	if ( ! parts?.protocol && ! parts?.origin ) {
		throw new Error( 'getUrlFromParts: protocol missing.' );
	}

	if ( ! parts.host && ! parts.hostname && ! parts.origin ) {
		throw new Error( 'getUrlFromParts: host missing.' );
	}

	const result = new URL( BASE_URL );

	if ( parts.origin ) {
		try {
			const origin = new URL( parts.origin );
			result.host = origin.host;
			result.protocol = origin.protocol;
		} catch {
			throw new Error( 'getUrlFromParts: invalid origin.' );
		}
	}

	result.host = parts.host || result.host;

	if ( parts.searchParams?.toString ) {
		result.search = parts.searchParams.toString();
	}

	for ( const part of URL_PART_KEYS ) {
		if ( part !== 'host' && part !== 'origin' && part !== 'searchParams' ) {
			const value = parts[ part ];
			if ( value && value !== result[ part ] ) {
				result[ part ] = value;
			}
		}
	}

	return result;
}

export default function safeProtocolUrl( url: string | null | undefined ): string | null {
	if ( null === url || '' === url || undefined === url ) {
		return null;
	}

	if ( /^\/[^/]/.test( url ) ) {
		return url;
	}

	const { protocol, host, hash, search, pathname } = getUrlParts( url );

	if ( 'http:' === protocol || 'https:' === protocol ) {
		return url;
	}

	// Handle hostless protocols, such as `javascript:`.
	// Preserves the behavior of the original implementation.
	if ( ! host ) {
		return 'http:';
	}

	return getUrlFromParts( { host, hash, search, pathname, protocol: 'http' } ).href;
}

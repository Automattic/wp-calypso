import config from '@automattic/calypso-config';
import { Client } from 'memjs';

// Memcached should not be used in the client or environments where the server is
// not configured.
let MEMCACHED_CLIENT: Client | undefined;

const ENV = config( 'env_id' ) as string;

export function createMemcachedClient(): boolean {
	// Only create clients when operating in the server context, if we allow
	// memcached in the environment, and if no client exists already.
	if (
		typeof document !== 'undefined' ||
		! config( 'server_side_memcached' ) ||
		MEMCACHED_CLIENT
	) {
		return false;
	}
	// todo: do we need to handle disconnects/reconnects?
	MEMCACHED_CLIENT = Client.create( 'foo:bar' ); // TODO: commit address or no?
	return true;
}

/**
 * This is helpful for tests, but otherwise probably won't be used.
 */
export function removeMemcachedClient() {
	MEMCACHED_CLIENT = undefined;
}

/**
 * Prepends the environment to the memcached key and removes whitespace.
 *
 * @param key The memcached key
 * @returns The normalized memcached key
 */
function normalizeKey( key: string ): string {
	return ( ENV + key ).replace( /\s+/g, '_' );
}

// note: should probably not be awaited, to avoid blocking.
export async function cacheSet(
	key: string,
	value: string | number | object | Array< unknown >
): Promise< boolean > {
	if ( ! MEMCACHED_CLIENT || value == null ) {
		return false;
	}
	try {
		key = normalizeKey( key );
		return MEMCACHED_CLIENT.set( key, JSON.stringify( value ), {} );
	} catch ( e ) {
		return false;
	}
}

// todo: should we set a timeout to shortcut if cache get takes a while?
export async function cacheGet< T >( key: string ): Promise< T | undefined > {
	if ( ! MEMCACHED_CLIENT ) {
		return undefined;
	}
	try {
		key = normalizeKey( key );
		const response = await MEMCACHED_CLIENT.get( key );
		if ( response?.value == null ) {
			return undefined;
		}

		return JSON.parse( response.value.toString() ) as T;
	} catch ( e ) {
		// TODO: log errors.
		return undefined;
	}
}

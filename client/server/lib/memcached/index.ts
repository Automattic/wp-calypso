import config from '@automattic/calypso-config';
import { Client } from 'memjs';

// Memcached should not be used in the client or environments where the server is
// not configured.
const MEMCACHED_DISABLE = typeof document !== 'undefined' || ! config( 'server_side_memcached' );
let MEMCACHED_CLIENT: Client | undefined;

const ENV = config( 'env_id' ) as string;

export function createMemcachedClient() {
	if ( MEMCACHED_DISABLE || MEMCACHED_CLIENT ) {
		return;
	}
	// todo: do we need to handle disconnects/reconnects?
	MEMCACHED_CLIENT = Client.create( 'foo:bar' ); // TODO: commit address or no?
}

/**
 * Prepends the environment to the memcached key and removes whitespace.
 *
 * @param key The memcached key
 * @returns The normalized memcached key
 */
function normalizeKey( key: string ): string {
	return ( ENV + key ).replace( /\s/g, '_' );
}

// note: should probably not be awaited, to avoid blocking.
export async function cacheSet( key: string, value: string | number | object ): Promise< boolean > {
	if ( MEMCACHED_DISABLE || ! MEMCACHED_CLIENT || value == null ) {
		return Promise.resolve( false );
	}
	key = normalizeKey( key );
	return MEMCACHED_CLIENT.set( key, JSON.stringify( value ), {} );
}

// todo: should we set a timeout to shortcut if cache get takes a while?
export async function cacheGet< T >( key: string ): Promise< T | undefined > {
	if ( MEMCACHED_DISABLE || ! MEMCACHED_CLIENT ) {
		return Promise.resolve( undefined );
	}
	key = normalizeKey( key );
	const { value } = await MEMCACHED_CLIENT.get( key );
	// todo: typecheck value?
	return JSON.parse( value.toString() ) as T;
}

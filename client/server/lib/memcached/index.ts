import config from '@automattic/calypso-config';
import { Client } from 'memjs';
import { getLogger } from 'calypso/server/lib/logger';

const ENV = config( 'env_id' ) as string;

let MEMCACHED_CLIENT: Client | undefined;

const ONE_HOUR = 60 * 60;

const MEMCACHED_SETTINGS = {
	expires: ONE_HOUR, // 0 is never expires. Value in seconds.
	keepAlive: true,
};

/**
 * Creates a memcached client if one does not already exist. Will do nothing if
 * memcached is disabled or if called in the browser. This function should be
 * called when booting the server so that future cacheSet and cacheGet calls have
 * a client to work with.
 *
 * @returns True if the client was created. False otherwise.
 */
export function createMemcachedClient(): boolean {
	if (
		typeof document !== 'undefined' ||
		! config( 'server_side_memcached' ) ||
		MEMCACHED_CLIENT
	) {
		return false;
	}

	MEMCACHED_CLIENT = Client.create( 'foo:bar', MEMCACHED_SETTINGS ); // TODO: commit address or no?
	return true;
}

/**
 * Set the client to undefined, effectively disabling memcached. This is helpful
 * for tests, but otherwise probably won't be used.
 */
export function removeMemcachedClient() {
	MEMCACHED_CLIENT = undefined;
}

/**
 * Set a value in the memcached instance. You likely should not await this function.
 * Let it complete asynchronously and do not block your own code.
 *
 * @param key The cache key. Will be normalized to exclude spaces and prepend the environment.
 * @param value The value to cache. Can be any JSON-serializable value.
 * @returns Resolves true if cache set succeeds. False otherwise.
 */
export async function cacheSet(
	key: string,
	value: string | number | object | Array< unknown >
): Promise< boolean > {
	if ( ! MEMCACHED_CLIENT || value == null ) {
		return false;
	}
	try {
		key = normalizeKey( key );
		return doOperation( MEMCACHED_CLIENT.set( key, JSON.stringify( value ), {} ), 'set' );
	} catch ( e ) {
		// TODO: connect to express for the more detailed logger. (Same with cacheGet.)
		getLogger().error( e, 'Memcached set failed.' );
		return false;
	}
}

/**
 * Retreive a value from the memcached instance.
 *
 * @param key The cache key. Will be normalized in the same way as cacheSet.
 * @returns Resolves the cached value. Undefined otherwise.
 */
export async function cacheGet< T >( key: string ): Promise< T | undefined > {
	if ( ! MEMCACHED_CLIENT ) {
		return undefined;
	}
	try {
		key = normalizeKey( key );
		const response = await doOperation( MEMCACHED_CLIENT.get( key ), 'get' );
		if ( response?.value == null ) {
			return undefined;
		}

		// Note: the value is a binary buffer, inside of which is a JSON string.
		return JSON.parse( response.value.toString( 'utf8' ) ) as T;
	} catch ( e ) {
		getLogger().error( e, 'Memcached get failed.' );
		return undefined;
	}
}

/**
 * Timeboxes memcached operations. If the operation does not complete quickly
 * enough, an error is thrown. Also adds statistics.
 *
 * This is a pre-emptive fix for a known bug in memjs where operations can hang
 * indefinitely if the memcached service becomes unavailable.
 *
 * Note: 200ms is significantly longer than I would expect normal operations to take.
 * We should check how long operations take in production and adjust this value.
 *
 * @see https://github.com/memcachier/memjs/issues/162
 * @see https://github.com/redwoodjs/redwood/pull/6082
 * @param operation The async operation to do, like cache.get.
 * @returns The result of the operation if it completes quickly. Otherwise, an
 *          error is thrown. (Which should be caught and handled.)
 */
export async function doOperation< T >( operation: Promise< T >, name: string ) {
	let timeout: NodeJS.Timeout;
	return Promise.race( [
		operation.then( ( result ) => {
			clearTimeout( timeout );
			return result;
		} ),
		new Promise( ( resolve ) => {
			timeout = setTimeout( resolve, 200 );
		} ).then( () => {
			throw new Error( `Memcached ${ name } operation timed out.` );
		} ),
	] );
}

/**
 * Prepends the environment to the memcached key and removes whitespace.
 *
 * @param key The memcached key.
 * @returns The normalized memcached key.
 */
function normalizeKey( key: string ): string {
	return ( ENV + key ).replace( /\s+/g, '_' );
}

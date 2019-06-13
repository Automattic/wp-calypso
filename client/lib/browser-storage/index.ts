/**
 * Internal dependencies
 */
import memoizeLast from 'lib/memoize-last';
import {
	getStoredItem as bypassGet,
	setStoredItem as bypassSet,
	clearStorage as bypassClear,
} from './bypass';

let shouldBypass = false;

const DB_NAME = 'calypso';
const DB_VERSION = 2; // Match versioning of the previous localforage-based implementation.
const STORE_NAME = 'calypso_store';

const supportsIDB = typeof window !== 'undefined' && window.indexedDB;

const getDB = memoizeLast( () => {
	const request = indexedDB.open( DB_NAME, DB_VERSION );
	return new Promise< IDBDatabase >( ( resolve, reject ) => {
		if ( request ) {
			request.onerror = () => reject( request.error );
			request.onsuccess = () => resolve( request.result );
			request.onupgradeneeded = () => request.result.createObjectStore( STORE_NAME );
		}
	} );
} ) as () => Promise< IDBDatabase >;

/**
 * Whether persistent storage should be bypassed, using a memory store instead.
 *
 * @param shouldBypassPersistentStorage Whether persistent storage should be bypassed.
 */
export function bypassPersistentStorage( shouldBypassPersistentStorage: boolean ) {
	shouldBypass = shouldBypassPersistentStorage;
}

/**
 * Get a stored item.
 *
 * @param key The stored item key.
 * @return A promise with the stored value. `undefined` if missing.
 */
export function getStoredItem< T >( key: string ): Promise< T | undefined > {
	if ( shouldBypass ) {
		return bypassGet( key );
	}

	if ( ! supportsIDB ) {
		const valueString = localStorage.getItem( key );
		try {
			if ( valueString === undefined || valueString === null ) {
				return Promise.resolve( undefined );
			}

			return Promise.resolve( JSON.parse( valueString ) );
		} catch ( error ) {
			return Promise.reject( error );
		}
	}

	return new Promise( ( resolve, reject ) => {
		getDB().then( db => {
			const transaction = db.transaction( STORE_NAME, 'readonly' );
			const get = transaction.objectStore( STORE_NAME ).get( key );

			const success = () => resolve( get.result );
			const error = () => reject( transaction.error );

			transaction.oncomplete = success;
			transaction.onabort = error;
			transaction.onerror = error;
		} );
	} );
}

/**
 * Set an item in storage.
 *
 * @param key The key to store the item under.
 * @param value The value of the item to be stored.
 * @return A promise that gets resolved when the item is successfully stored.
 */
export function setStoredItem< T >( key: string, value: T ): Promise< void > {
	if ( shouldBypass ) {
		return bypassSet( key, value );
	}

	if ( ! supportsIDB ) {
		localStorage.setItem( key, JSON.stringify( value ) );
		return Promise.resolve();
	}

	return new Promise( ( resolve, reject ) => {
		getDB().then( db => {
			const transaction = db.transaction( STORE_NAME, 'readwrite' );
			transaction.objectStore( STORE_NAME ).put( value, key );

			const success = () => resolve();
			const error = () => reject( transaction.error );

			transaction.oncomplete = success;
			transaction.onabort = error;
			transaction.onerror = error;
		} );
	} );
}

/**
 * Clear all stored items.
 *
 * @return A promise that gets resolved when all items are successfully cleared.
 */
export function clearStorage(): Promise< void > {
	if ( shouldBypass ) {
		return bypassClear();
	}

	if ( ! supportsIDB ) {
		localStorage.clear();
		return Promise.resolve();
	}

	return new Promise( ( resolve, reject ) => {
		getDB().then( db => {
			const transaction = db.transaction( STORE_NAME, 'readwrite' );
			transaction.objectStore( STORE_NAME ).clear();

			const success = () => resolve();
			const error = () => reject( transaction.error );

			transaction.oncomplete = success;
			transaction.onabort = error;
			transaction.onerror = error;
		} );
	} );
}

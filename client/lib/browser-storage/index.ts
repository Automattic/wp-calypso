/**
 * Internal dependencies
 */
import { once } from 'lib/memoize-last';
import {
	getStoredItem as bypassGet,
	getAllStoredItems as bypassGetAll,
	setStoredItem as bypassSet,
	clearStorage as bypassClear,
	activate as activateBypass,
} from './bypass';
import { StoredItems } from './types';

let shouldBypass = false;

const DB_NAME = 'calypso';
const DB_VERSION = 2; // Match versioning of the previous localforage-based implementation.
const STORE_NAME = 'calypso_store';

const SANITY_TEST_KEY = 'browser-storage-sanity-test';

const getDB = once( () => {
	const request = window.indexedDB.open( DB_NAME, DB_VERSION );
	return new Promise< IDBDatabase >( ( resolve, reject ) => {
		try {
			if ( request ) {
				request.onerror = event => {
					// InvalidStateError is special in Firefox.
					// We need to `preventDefault` to stop it from reaching the console.
					if ( request.error && request.error.name === 'InvalidStateError' ) {
						event.preventDefault();
					}
					reject( request.error );
				};
				request.onsuccess = () => resolve( request.result );
				request.onupgradeneeded = () => request.result.createObjectStore( STORE_NAME );
			}
		} catch ( error ) {
			reject( error );
		}
	} );
} );

export const supportsIDB = once( async () => {
	if ( typeof window === 'undefined' || ! window.indexedDB ) {
		return false;
	}

	try {
		const testValue = Date.now().toString();
		await idbSet( SANITY_TEST_KEY, testValue );
		await idbGet( SANITY_TEST_KEY );
		return true;
	} catch ( error ) {
		// IDB sanity test failed. Fall back to alternative method.
		return false;
	}
} );

function idbGet< T >( key: string ): Promise< T | undefined > {
	return new Promise( ( resolve, reject ) => {
		getDB()
			.then( db => {
				const transaction = db.transaction( STORE_NAME, 'readonly' );
				const get = transaction.objectStore( STORE_NAME ).get( key );

				const success = () => resolve( get.result );
				const error = () => reject( transaction.error );

				transaction.oncomplete = success;
				transaction.onabort = error;
				transaction.onerror = error;
			} )
			.catch( err => reject( err ) );
	} );
}

type EventTargetWithCursorResult = EventTarget & { result: IDBCursorWithValue | null };

function idbGetAll( pattern?: RegExp ): Promise< StoredItems > {
	return getDB().then(
		db =>
			new Promise( ( resolve, reject ) => {
				const results: StoredItems = {};
				const transaction = db.transaction( STORE_NAME, 'readonly' );
				const getAll = transaction.objectStore( STORE_NAME ).openCursor();

				const success = ( event: Event ) => {
					const cursor = ( event.target as EventTargetWithCursorResult ).result;
					if ( cursor ) {
						const { primaryKey: key, value } = cursor;
						if (
							key &&
							typeof key === 'string' &&
							key !== SANITY_TEST_KEY &&
							( ! pattern || pattern.test( key ) )
						) {
							results[ key ] = value;
						}
						cursor.continue();
					} else {
						// No more results.
						resolve( results );
					}
				};
				const error = () => reject( transaction.error );

				getAll.onsuccess = success;
				transaction.onabort = error;
				transaction.onerror = error;
			} )
	);
}

function idbSet< T >( key: string, value: T ): Promise< void > {
	return new Promise( ( resolve, reject ) => {
		getDB()
			.then( db => {
				const transaction = db.transaction( STORE_NAME, 'readwrite' );
				transaction.objectStore( STORE_NAME ).put( value, key );

				const success = () => resolve();
				const error = () => reject( transaction.error );

				transaction.oncomplete = success;
				transaction.onabort = error;
				transaction.onerror = error;
			} )
			.catch( err => reject( err ) );
	} );
}

function idbClear(): Promise< void > {
	return new Promise( ( resolve, reject ) => {
		getDB()
			.then( db => {
				const transaction = db.transaction( STORE_NAME, 'readwrite' );
				transaction.objectStore( STORE_NAME ).clear();

				const success = () => resolve();
				const error = () => reject( transaction.error );

				transaction.oncomplete = success;
				transaction.onabort = error;
				transaction.onerror = error;
			} )
			.catch( err => reject( err ) );
	} );
}

/**
 * Whether persistent storage should be bypassed, using a memory store instead.
 *
 * @param shouldBypassPersistentStorage Whether persistent storage should be bypassed.
 */
export function bypassPersistentStorage( shouldBypassPersistentStorage: boolean ) {
	shouldBypass = shouldBypassPersistentStorage;

	if ( shouldBypass ) {
		activateBypass();
	}
}

/**
 * Get a stored item.
 *
 * @param key The stored item key.
 * @returns A promise with the stored value. `undefined` if missing.
 */
export async function getStoredItem< T >( key: string ): Promise< T | undefined > {
	if ( shouldBypass ) {
		return await bypassGet( key );
	}

	const idbSupported = await supportsIDB();
	if ( ! idbSupported ) {
		const valueString = window.localStorage.getItem( key );
		if ( valueString === undefined || valueString === null ) {
			return undefined;
		}

		return JSON.parse( valueString );
	}

	return await idbGet( key );
}

/**
 * Get all stored items.
 *
 * @param pattern The pattern to match on returned item keys.
 * @returns A promise with the stored key/value pairs as an object. Empty if none.
 */
export async function getAllStoredItems( pattern?: RegExp ): Promise< StoredItems > {
	if ( shouldBypass ) {
		return await bypassGetAll( pattern );
	}

	const idbSupported = await supportsIDB();
	if ( ! idbSupported ) {
		const results: StoredItems = {};
		for ( let i = 0; i < window.localStorage.length; i++ ) {
			const key = window.localStorage.key( i );
			if ( ! key || ( pattern && ! pattern?.test( key ) ) ) {
				continue;
			}
			const valueString = window.localStorage.getItem( key ) ?? undefined;
			results[ key ] = valueString !== undefined ? JSON.parse( valueString ) : undefined;
		}
		return results;
	}

	return await idbGetAll( pattern );
}

/**
 * Set an item in storage.
 *
 * @param key The key to store the item under.
 * @param value The value of the item to be stored.
 * @returns A promise that gets resolved when the item is successfully stored.
 */
export async function setStoredItem< T >( key: string, value: T ): Promise< void > {
	if ( shouldBypass ) {
		return await bypassSet( key, value );
	}

	const idbSupported = await supportsIDB();
	if ( ! idbSupported ) {
		window.localStorage.setItem( key, JSON.stringify( value ) );
		return;
	}

	return await idbSet( key, value );
}

/**
 * Clear all stored items.
 *
 * @returns A promise that gets resolved when all items are successfully cleared.
 */
export async function clearStorage(): Promise< void > {
	if ( shouldBypass ) {
		return await bypassClear();
	}

	const idbSupported = await supportsIDB();
	if ( ! idbSupported ) {
		window.localStorage.clear();
		return;
	}

	return await idbClear();
}

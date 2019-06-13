/**
 * External dependencies
 */
import debugModule from 'debug';

const debug = debugModule( 'calypso:support-user' );

// This module defines a series of methods which bypasse all persistent storage.
// Any calls to read/write data using browser-storage instead access a temporary
// in-memory store which is lost on page reload. This driver is used to sandbox
// a user's data while support-user is active, ensuring it does not contaminate
// the original user, and vice versa.

const memoryStore = new Map< string, any >();

export function getStoredItem< T >( key: string ): Promise< T | undefined > {
	debug( 'browser-storage bypass', 'getStoredItem', key );

	if ( memoryStore.has( key ) ) {
		return Promise.resolve( memoryStore.get( key ) );
	}

	return Promise.resolve( undefined );
}

export function setStoredItem< T >( key: string, value: T ): Promise< void > {
	debug( 'browser-storage bypass', 'setStoredItem', key );

	memoryStore.set( key, value );
	return Promise.resolve();
}

export function clearStorage(): Promise< void > {
	debug( 'browser-storage bypass', 'clearStorage' );

	memoryStore.clear();
	return Promise.resolve();
}

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

const memoryStore: { [index: string]: any } = {};

export function getStoredItem< T >( key: string ): Promise< T | null > {
	debug( 'browser-storage bypass', 'getStoredItem', key );

	if ( key in memoryStore ) {
		// Match localforage behaviour: unknown keys return null.
		return Promise.resolve( memoryStore[ key ] !== undefined ? memoryStore[ key ] : null );
	}

	return Promise.resolve( null );
}

export function setStoredItem< T >( key: string, value: T ): Promise< void > {
	debug( 'browser-storage bypass', 'setStoredItem', key );

	return new Promise( resolve => {
		memoryStore[ key ] = value !== undefined ? value : null;
		resolve();
	} );
}

export function clearStorage(): Promise< void > {
	debug( 'browser-storage bypass', 'clearStorage' );

	return new Promise( resolve => {
		for ( const key in memoryStore ) {
			if ( memoryStore.hasOwnProperty( key ) ) {
				delete memoryStore[ key ];
			}
		}

		resolve();
	} );
}

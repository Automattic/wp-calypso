/**
 * External dependencies
 */
import debugModule from 'debug';

/**
 * Internal dependencies
 */
import { StoredItems } from './types';

const debug = debugModule( 'calypso:support-user' );

// This module defines a series of methods which bypasse all persistent storage.
// Any calls to read/write data using browser-storage instead access a temporary
// in-memory store which is lost on page reload. This driver is used to sandbox
// a user's data while support-user is active, ensuring it does not contaminate
// the original user, and vice versa.

const memoryStore = new Map();

export async function getAllStoredItems( pattern?: RegExp ): Promise< StoredItems > {
	debug( 'browser-storage bypass', 'getAllStoredItems' );

	// TODO: Replace below with Object.fromEntries when it's available (needs core-js@3).
	const results: StoredItems = {};
	for ( const [ key, value ] of memoryStore.entries() ) {
		if ( ! pattern || pattern?.test( key ) ) {
			results[ key ] = value;
		}
	}
	return results;
}

export async function getStoredItem< T >( key: string ): Promise< T | undefined > {
	debug( 'browser-storage bypass', 'getStoredItem', key );

	if ( memoryStore.has( key ) ) {
		return memoryStore.get( key );
	}

	return undefined;
}

export async function setStoredItem< T >( key: string, value: T ) {
	debug( 'browser-storage bypass', 'setStoredItem', key );
	memoryStore.set( key, value );
}

export async function clearStorage() {
	debug( 'browser-storage bypass', 'clearStorage' );
	memoryStore.clear();
}

export function activate() {
	memoryStore.clear();
}

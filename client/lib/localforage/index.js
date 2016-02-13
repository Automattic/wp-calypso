/**
 * External dependencies
 */
import localforage from 'localforage';

export const config = {
	name: 'calypso',
	storeName: 'calypso_store',
	version: 1.0,
	description: 'Calypso Browser Storage',
	driver: [
		localforage.INDEXEDDB,
		localforage.WEBSQL,
		localforage.LOCALSTORAGE
	]
};

export function getLocalForage() {
	localforage.config( config );
	return localforage;
}

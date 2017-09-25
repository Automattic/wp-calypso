/**
 * External dependencies
 */
import debugFactory from 'debug';

const debug = debugFactory( 'calypso:sync-handler:localforage-mock' );
let localData = {};

export default {
	defineDriver() {
		return Promise.resolve();
	},
	setItem( key, data ) {
		return new Promise( resolve => {
			debug( 'setItem: %o, (%o)', key, data );
			localData[ key ] = data;
			resolve();
		} );
	},
	getItem( key ) {
		return new Promise( resolve => {
			debug( 'getItem: %o', key );
			resolve( localData[ key ] );
		} );
	},
	removeItem( key ) {
		return new Promise( resolve => {
			debug( 'removeItem: %o', key );
			delete localData[ key ];
			resolve();
		} );
	},
	keys() {
		return new Promise( resolve => {
			const keys = Object.keys( localData );
			debug( 'keys: %o', keys );
			resolve( keys );
		} );
	},
	getLocalData() {
		return localData;
	},
	setLocalData( newData ) {
		localData = newData;
	},
	config() {}
};

/**
 * External dependencies
 */
import debugModule from 'debug';

const debug = debugModule( 'calypso:support-user' );

// This module defines a custom localForage driver which bypasses all persistent
// storage. Any calls to read/write data using localForage instead access a temporary
// in-memory store which is lost on page reload. This driver is used to sandbox
// a user's data while support-user is active, ensuring it does not contaminate the
// original user/vice versa.
// Copied with modifications from localForage source: localforage/test/dummyStorageDriver.js

const dummyStorage = {};

// Config the localStorage backend, using options set in the config.
function _initStorage( options ) {
	const dbInfo = {};
	if ( options ) {
		for ( const i in options ) {
			dbInfo[ i ] = options[ i ];
		}
	}

	dbInfo.db = {};
	dummyStorage[ dbInfo.name ] = dbInfo.db;

	this._dbInfo = dbInfo;
	return Promise.resolve();
}

function clear( callback ) {
	debug( 'localForage bypass', 'clear' );

	const promise = new Promise( ( resolve, reject ) => {
		this.ready().then( () => {
			const db = this._dbInfo.db;

			for ( const key in db ) {
				if ( db.hasOwnProperty( key ) ) {
					delete db[ key ];
				}
			}

			resolve();
		} ).catch( reject );
	} );

	executeCallback( promise, callback );
	return promise;
}

function getItem( key, callback ) {
	debug( 'localForage bypass', 'getItem', key );

	// Cast the key to a string, as that's all we can set as a key.
	if ( typeof key !== 'string' ) {
		key = String( key );
	}

	const promise = new Promise( ( resolve, reject ) => {
		this.ready().then( () => {
			try {
				const db = this._dbInfo.db;
				const result = db[ key ];

				resolve( result );
			} catch ( e ) {
				reject( e );
			}
		} ).catch( reject );
	} );

	executeCallback( promise, callback );
	return promise;
}

function iterate( callback ) {
	const promise = new Promise( ( resolve, reject ) => {
		this.ready().then( () => {
			try {
				const db = this._dbInfo.db;

				for ( const key in db ) {
					const result = db[ key ];

					callback( result, key );
				}

				resolve();
			} catch ( e ) {
				reject( e );
			}
		} ).catch( reject );
	} );

	executeCallback( promise, callback );
	return promise;
}

function _key( n, callback ) {
	const promise = new Promise( ( resolve, reject ) => {
		this.ready().then( () => {
			const db = this._dbInfo.db;
			let result = null;
			let index = 0;

			for ( const key in db ) {
				if ( db.hasOwnProperty( key ) && db[ key ] !== undefined ) {
					if ( n === index ) {
						result = key;
						break;
					}
					index++;
				}
			}

			resolve( result );
		} ).catch( reject );
	} );

	executeCallback( promise, callback );
	return promise;
}

function _keys( callback ) {
	const promise = new Promise( ( resolve, reject ) => {
		this.ready().then( () => {
			const db = this._dbInfo.db;
			const keys = [ ];

			for ( const key in db ) {
				if ( db.hasOwnProperty( key ) ) {
					keys.push( key );
				}
			}

			resolve( keys );
		} ).catch( reject );
	} );

	executeCallback( promise, callback );
	return promise;
}

function length( callback ) {
	const promise = new Promise( ( resolve, reject ) => {
		this.keys().then( ( keys ) => {
			resolve( keys.length );
		} ).catch( reject );
	} );

	executeCallback( promise, callback );
	return promise;
}

function removeItem( key, callback ) {
	debug( 'localForage bypass', 'removeItem', key );

	const promise = new Promise( ( resolve, reject ) => {
		if ( typeof key !== 'string' ) {
			return reject();
		}

		this.ready().then( () => {
			const db = this._dbInfo.db;
			if ( db.hasOwnProperty( key ) ) {
				delete db[ key ];
			}

			resolve();
		} ).catch( reject );
	} );

	executeCallback( promise, callback );
	return promise;
}

function setItem( key, value, callback ) {
	debug( 'localForage bypass', 'setItem', key );

	const promise = new Promise( ( resolve, reject ) => {
		if ( typeof key !== 'string' ) {
			return reject();
		}

		this.ready().then( () => {
			// Convert undefined values to null.
			// https://github.com/mozilla/localForage/pull/42
			if ( value === undefined ) {
				value = null;
			}

			// Save the original value to pass to the callback.
			const originalValue = value;

			const db = this._dbInfo.db;
			db[ key ] = value;
			resolve( originalValue );
		} ).catch( reject );
	} );

	executeCallback( promise, callback );
	return promise;
}

function executeCallback( promise, callback ) {
	if ( callback ) {
		promise.then( ( result ) => {
			callback( null, result );
		}, ( error ) => {
			callback( error );
		} );
	}
}

export default {
	_driver: 'localForageBypass',
	_initStorage: _initStorage,
	// _supports: function() { return true; }
	iterate: iterate,
	getItem: getItem,
	setItem: setItem,
	removeItem: removeItem,
	clear: clear,
	length: length,
	key: _key,
	keys: _keys
};

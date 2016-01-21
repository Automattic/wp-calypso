/**
 * Module dependencies
 */
import localforage from 'localforage';
import { blackList } from './endpoints-list';
import debugFactory from 'debug';
import Hashes from 'jshashes';

// expose localforage just to development
window.LF = localforage;

const debug = debugFactory( 'local-sync-handler' );

// default config object
const defaultConfig = {
	driver: localforage.INDEXEDDB,
	name: 'calypso',
	version: 1.0,
	//size: 4980736,
	storeName: 'calypso-store',
	description: 'Calypso app storing fata'
};

/**
 * LocalSyncHandler class
 */
export class LocalSyncHandler {
	/**
	 * Create a LocalSyncHandler instance
	 *
	 * @param {Object} [config] - sync config
	 * @param {Function} handler - wpcom handler function
	 *
	 * @return {Function} sync wrapper function
	 */
	constructor( config, handler ) {
		if ( 'function' === typeof config ) {
			handler = config;
			config = {};
		}

		this.config = Object.assign( {}, defaultConfig, config );
		return this.wrapper( handler );
	}

	wrapper( handler ) {
		const self = this;

		return function( params, fn ) {
			const cloneParams = Object.assign( {}, params );
			const path = params.path;

			// response has been sent flag
			let responseSent = false;

			// generate an unique resource key
			const key = self.generateKey( params );

			console.log( ' ' );
			debug( 'starting to get resurce ...' );
			if ( self.inBlacklist( path ) ) {
				return handler( params, fn );
			};

			self.retrieveResponse( key, function( err, data ) {
				if ( err ) {
					// @TODO improve error handling here
					console.error( err );
				}

				if ( data ) {
					debug( '%o already storaged %o. Let\'s be optimistic.', path, data );
					fn( null, data );
					responseSent = true;
				}

				debug( 'requesting to WP.com' );
				handler( params, ( resErr, resData ) => {
					if ( resErr ) {
						console.log( `-> resErr -> `, resErr );

						if ( responseSent ) {
							return;
						}

						return fn( resErr );
					}

					debug( 'WP.com response is here. %o', resData );

					if ( responseSent ) {
						debug( 'data is already stored. overwriting ...' );
					}

					let storingData = {
						response: resData,
						params: cloneParams
					};

					self.storeResponse( key, storingData );

					if ( ! responseSent ) {
						fn( err, resData );
					}
				} );
			} );
		};
	}

	/**
	 * Generate a key from the given param object
	 *
	 * @param {Object} params - request parameters
	 * @return {String} request key
	 */
	generateKey( params ) {
		var key = params.apiVersion || '';
		key += '-' + params.method;
		key += '-' + params.path;

		if ( params.query ) {
			key += '-' + params.query;
		}

		debug( 'generating hash ... ' );
		let hash = new Hashes.SHA1().b64( key );

		debug( 'key: %o', hash );
		return hash;
	}

	retrieveResponse( key, fn = () => {} ) {
		localforage.config( this.config );

		debug( 'getting data from %o key', key );
		localforage.getItem( key, ( err, data ) => {
			if ( err ) {
				return fn( err )
			};

			if ( ! data ) {
				return fn();
			}

			fn( null, data.response || data );
		} );
	}

	/**
	 * Store the WP.com REST-API response with the given key.
	 *
	 * @param {String} key - local forage key identifier
	 * @param {Object} data - REST-API endoint response
	 * @param {Function} [fn] - callback
	 */
	storeResponse( key, data, fn = () => {} ) {
		debug( 'storing data in %o key', key );

		// clean some fields from endpoint response
		delete data.response._headers;

		localforage.config( this.config );
		localforage.setItem( key, data, fn );
	}

	inBlacklist( path ) {
		let inBlacklist = false;

		for ( let i = 0; i < blackList.length; i++ ) {
			let pattern = blackList[ i ];
			let re = new RegExp( pattern );
			if ( re.test( path ) ) {
				debug( '%o is in the black list', path );
				inBlacklist = true;
				continue;
			}
		}

		return inBlacklist;
	}
}

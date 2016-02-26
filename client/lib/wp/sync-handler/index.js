/**
 * External dependencies
 */
import config from 'config';
import Hashes from 'jshashes';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import warn from 'lib/warn';
import { getLocalForage } from 'lib/localforage';
import { isWhitelisted } from './whitelist-handler';
import { cacheIndex } from './cache-index';

/**
 * Module variables
 */
const localforage = getLocalForage();
const debug = debugFactory( 'calypso:sync-handler' );

/**
 * SyncHandler class
 */
export class SyncHandler {
	/**
	 * Create a SyncHandler instance
	 *
	 * @param {Function} handler - wpcom handler
	 *
	 * @return {Function} sync-handler wrapper
	 */
	constructor( handler ) {
		// expose `syncHandler` global var (dev mode)
		if ( 'development' === config( 'env' ) ) {
			window.syncHandler = this;
		}

		this.reqHandler = handler;
		return this.syncHandlerWrapper( handler );
	}

	syncHandlerWrapper( handler ) {
		return ( params, callback ) => {
			// detect and no-sync proxy connection request
			if ( params.metaAPI && params.metaAPI.accessAllUsersBlogs ) {
				debug( 'skip - non-sync -proxy-handler request detected' );
				return this.reqHandler( params, callback );
			}

			// create a copy of the request params
			const reqParams = Object.assign( {}, params );
			const { path } = reqParams;

			// whitelist barrier
			if ( ! isWhitelisted( params ) ) {
				debug( 'not whitelisted: skip %o request', path );
				return handler( params, callback );
			}

			// generate an unique resource key
			const key = this.generateKey( reqParams );

			debug( 'starting to get resource ...' );

			/**
			 * Send response immediately to the client
			 * getting the data locally (localforage)
			 *
			 * @param {Object} localRecord - response stored locally
			 */
			const localResponseHandler = localRecord => {
				// let's be optimistic
				if ( localRecord ) {
					debug( '%o stored(%o). Let\'s be optimistic ...\n', path, localRecord );
					// try/catch in case cached record does not match expected schema
					try {
						callback( null, localRecord.body );
					} catch ( error ) {
						this.removeRecord( key );
						debug( 'Callback failed with localRecord (%o), deleting record.', localRecord, error );
					}
				} else {
					debug( 'No data for [%s] %o - %o', reqParams.method, path, reqParams );
				}
			};

			/**
			 * Handling Error getting data locally (localforage)
			 *
			 * @param {Error} err - err trying to get the local record
			 */
			const recordErrorHandler = err => {
				// @TODO improve error handling here
				warn( err );
			};

			/**
			 * Fetch data from WP.com.
			 * Run the double callback.
			 *
			 * @return {Promise} promise
			 */
			const networkFetch = () => {
				return new Promise( ( resolve, reject ) => {
					handler( reqParams, ( err, res ) => {
						if ( err ) {
							return reject( err );
						}

						resolve( res );

						debug( 'second callback run: %o, %o', reqParams, res );
						callback( null, res );
					} );
				} );
			};

			/**
			 * Add/Override the data gotten from the
			 * WP.com server-side response.
			 *
			 * @param {Object} serverResponse - server response object
			 */
			const cacheResponse = serverResponse => {
				// get response object without _headers property
				let responseWithoutHeaders = Object.assign( {}, serverResponse );
				delete responseWithoutHeaders._headers;

				let storingData = {
					__sync: {
						key,
						synced: Date.now(),
						syncing: false
					},
					body: responseWithoutHeaders,
					params: reqParams
				};

				// add/override gotten data from server-side
				this.storeRecord( key, storingData ).catch( err => {
					// @TODO error handling
					warn( err );
				} );
			};

			/**
			 * Handle response gotten form the
			 * server-side response
			 *
			 * @param {Error} err - error object
			 */
			const networkErrorHandler = err => {
				if ( err ) {
					// @TODO improve error handling here
					warn( err );
					warn( 'request params: %o', reqParams );
					callback( err );
				}
			};

			// request/response workflow
			this.retrieveRecord( key )
				.then( localResponseHandler, recordErrorHandler )
				.then( networkFetch )
				.then( cacheResponse, networkErrorHandler );
		};
	}

	/**
	 * Generate a key from the given param object
	 *
	 * @param {Object} params - request parameters
	 * @param {Boolean} applyHash - codificate key when it's true
	 * @return {String} request key
	 */
	generateKey( params, applyHash = true ) {
		var key = `${params.apiVersion || ''}-${params.method}-${params.path}`;

		if ( params.query ) {
			key += '-' + params.query;
		}

		if ( applyHash ) {
			key = new Hashes.SHA1().hex( key );
		}

		key = 'sync-record-' + key;

		debug( 'key: %o', key );
		return key;
	}

	retrieveRecord( key ) {
		debug( 'getting data from %o key\n', key );
		return localforage.getItem( key );
	}

	/**
	 * Add/Override a record.
	 *
	 * @param {String} key - record key identifier
	 * @param {Object} data - data to store
	 * @return {Promise} native ES6 promise
	 */
	storeRecord( key, data ) {
		debug( 'storing data in %o key\n', key );

		// add this record to history
		return cacheIndex
			.addItem( key )
			.then( localforage.setItem( key, data ) );
	}

	removeRecord( key ) {
		debug( 'removing %o key\n', key );
		return localforage
			.removeItem( key )
			.then( cacheIndex.removeItem( key ) );
	}
}

export const pruneRecordsFrom = lifetime => {
	return cacheIndex.pruneRecordsFrom( lifetime );
}

export const clearAll = () => {
	return cacheIndex.clearAll();
}

// expose `cacheIndex` global var (dev mode)
if ( 'development' === config( 'env' ) ) {
	window.cacheIndex = cacheIndex;
}

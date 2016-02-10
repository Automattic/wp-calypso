/**
 * Module dependencies
 */
import localforage from 'localforage';
import Hashes from 'jshashes';
import warn from 'lib/warn';
import { isWhitelisted } from './whitelist-handler';
import { defaults } from './defaults';

import debugFactory from 'debug';
const debug = debugFactory( 'calypso:sync-handler' );

/**
 * SyncHandler class
 */
export class SyncHandler {
	/**
	 * Create a SyncHandler instance
	 *
	 * @param {Object} [setup] - localforage sync setup
	 * @param {Function} handler - wpcom handler
	 *
	 * @return {Function} sync-handler wrapper
	 */
	constructor( setup, handler ) {
		if ( typeof setup === 'function' ) {
			handler = setup;
			setup = {};
		}

		this.setup = Object.assign( {}, defaults, setup );
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
			};

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
					callback( null, localRecord.body );
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
			}

			/**
			 * Add/Override the data gotten from the
			 * WP.com server-side response.
			 *
			 * @param {Object} serverResponse - server response object
			 */
			const cacheResponse = serverResponse => {
				// remove _headers from server response
				delete serverResponse._headers;

				let storingData = {
					__sync: {
						key,
						synced: new Date().toString(),
						syncing: false
					},
					body: serverResponse,
					params: reqParams
				};

				// add/override gotten data from server-side
				this.storeRecord( key, storingData, err => {
					if ( err ) {
						// @TODO error handling
						warn( err );
					}
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
			}

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

		debug( 'key: %o', key );
		return key;
	}

	retrieveRecord( key, fn = () => {} ) {
		localforage.config( this.setup );
		debug( 'getting data from %o key\n', key );
		return localforage.getItem( key, fn );
	}

	storeRecord( key, data, fn = () => {} ) {
		localforage.config( this.setup );
		debug( 'storing data in %o key\n', key );
		return localforage.setItem( key, data, fn );
	}

	removeRecord( key, fn = () => {} ) {
		localforage.config( this.setup );
		debug( 'removing %o key\n', key );
		return localforage.removeItem( key, fn );
	}
}

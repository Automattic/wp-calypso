/**
 * External dependencies
 */
import config from 'config';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import warn from 'lib/warn';
import localforage from 'lib/localforage';
import { isWhitelisted } from './whitelist-handler';
import { cacheIndex } from './cache-index';
import { generateKey, generatePageSeriesKey, normalizeRequestParams } from './utils';

/**
 * Module variables
 */
const debug = debugFactory( 'calypso:sync-handler' );

/**
 * Detect pagination changes in local vs request response bodies
 * @param  {Object} serverResponseBody - response object as passed from promise
 * @param  {Object} localResponseBody - local response body
 * @return {Boolean} returns whether pagination has changed
 */
export const hasPaginationChanged = ( serverResponseBody, localResponseBody ) => {
	if ( ! serverResponseBody || ! serverResponseBody.meta || ! serverResponseBody.meta.next_page ) {
		return false;
	}
	if ( ! localResponseBody ) {
		return false;
	}
	if ( localResponseBody && localResponseBody.meta && localResponseBody.meta.next_page === serverResponseBody.meta.next_page ) {
		return false;
	}
	return true;
}

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
		if ( 'development' === config( 'env' ) && typeof window !== 'undefined' ) {
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
				return handler( params, callback );
			}

			// generate an unique resource requestKey
			const requestKey = generateKey( reqParams );

			debug( 'starting to get resource ...' );

			/**
			 * Send response immediately to the client
			 * getting the data locally (localforage)
			 *
			 * @param {Object} localRecord - response stored locally
			 * @returns {Object} localRecord object
			 */
			const localResponseHandler = localRecord => {
				// let's be optimistic
				debug( 'localResponseHandler()', localRecord );
				if ( localRecord && localRecord.body ) {
					debug( 'local callback run => %o, params (%o), response (%o)', path, reqParams, localRecord );
					// try/catch in case cached record does not match expected schema
					localRecord.body.__sync = { requestKey, responseSource: 'local'};
					try {
						callback( null, localRecord.body );
					} catch ( error ) {
						this.removeRecord( requestKey );
						debug( 'Callback failed with localRecord (%o), deleting record.', localRecord, error );
					}
				} else {
					debug( 'No data for [%s] %o - %o', reqParams.method, path, reqParams );
				}
				return localRecord;
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
			 * @param {Object} localRecord - local response body
			 * @return {Promise} promise
			 */
			const networkFetch = localRecord => {
				return new Promise( ( resolve, reject ) => {
					handler( reqParams, ( err, res ) => {
						if ( err ) {
							return reject( err );
						}

						resolve( {
							localResponse: localRecord,
							serverResponse: res,
						} );

						debug( 'server callback run => %o, params (%o), response (%o)', path, reqParams, res );
						if ( res ) {
							res.__sync = { requestKey, responseSource: 'server' };
						}
						callback( null, res );
					} );
				} );
			};

			/**
			 * clear pageSeries if pagination out of alignment
			 *
			 * @param {Object} combinedResponse - object with local and server responses
			 * @returns {Object} - combinedResponse object
			 */
			const adjustPagination = combinedResponse => {
				debug( 'adjustPagination()', combinedResponse );
				if ( ! combinedResponse ) {
					return;
				}
				const { serverResponse, localResponse } = combinedResponse;
				const localResponseBody = localResponse ? localResponse.body : null;
				if ( hasPaginationChanged( serverResponse, localResponseBody ) ) {
					debug( 'run clearPageSeries()' );
					cacheIndex.clearPageSeries( reqParams );
				} else {
					debug( 'do not clearPageSeries()' );
				}
				return combinedResponse;
			};

			/**
			 * Handle response gotten form the
			 * server-side response
			 *AzSX
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

			/**
			 * Add/Override the data gotten from the
			 * WP.com server-side response.
			 *
			 * @param {Object} combinedResponse - object with local and server responses
			 * @returns {Object} - combinedResponse object
			 */
			const cacheResponse = combinedResponse => {
				debug( 'cacheResponse()', combinedResponse );
				if ( ! combinedResponse || ! combinedResponse.serverResponse ) {
					return;
				}

				const { serverResponse } = combinedResponse;
				// get response object without _headers property
				let responseWithoutHeaders = Object.assign( {}, serverResponse );
				delete responseWithoutHeaders._headers;

				let storingData = {
					__sync: {
						requestKey,
						synced: Date.now(),
						syncing: false
					},
					body: responseWithoutHeaders,
					params: reqParams
				};

				// add/override gotten data from server-side
				this.storeRecord( requestKey, storingData ).catch( err => {
					// @TODO error handling
					warn( err );
				} );

				return combinedResponse;
			};

			// request/response workflow
			let request;
			if ( params.__skipLocalSyncRequest ) {
				debug( 'local request skipped => %o, params (%o)', path, reqParams );
				request = networkFetch(); // => combinedResponse { localResponse: undefined, serverResponse }
			} else {
				request = this.retrieveRecord( requestKey ) // => localforage record
					.then( localResponseHandler, recordErrorHandler ) // => localforage record
					.then( networkFetch ); // => combinedResponse { localResponse, serverResponse }
			}

			request
				.then( adjustPagination, networkErrorHandler ) // => combinedResponse { localResponse, serverResponse }
				.then( cacheResponse ); // => combinedResponse { localResponse, serverResponse }
		};
	}

	retrieveRecord( requestKey ) {
		debug( 'getting data from %o requestKey\n', requestKey );
		return localforage.getItem( requestKey );
	}

	/**
	 * Add/Override a record.
	 *
	 * @param {String} requestKey - record requestKey identifier
	 * @param {Object} data - data to store
	 * @return {Promise} native ES6 promise
	 */
	storeRecord( requestKey, data ) {
		debug( 'storing data in %o requestKey\n', requestKey );
		let pageSeriesKey;
		const reqParams = normalizeRequestParams( data.params );
		if ( data && data.body && data.body.meta && data.body.meta.next_page ) {
			pageSeriesKey = generatePageSeriesKey( data.params );
		}

		// add this record to history
		return cacheIndex
			.addItem( requestKey, reqParams, pageSeriesKey )
				.then( localforage.setItem( requestKey, data ) );
	}

	removeRecord( requestKey ) {
		debug( 'removing %o requestKey\n', requestKey );
		return localforage
			.removeItem( requestKey )
				.then( cacheIndex.removeItem( requestKey ) );
	}
}

/**
 * Returns a modified wpcom instance including a `skipLocalSyncResult` method
 * to be used in intentional bypass of local sync handler behavior.
 *
 * @param  {Object} wpcom WPCOM instance
 * @return {Object}       Modified WPCOM instance
 */
export function syncOptOut( wpcom ) {
	const request = wpcom.request.bind( wpcom );
	return Object.assign( wpcom, {
		skipLocalSyncResult() {
			this.__skipLocalSyncRequest = true;
			return this;
		},

		request( params, callback ) {
			if ( this.__skipLocalSyncRequest ) {
				params = Object.assign( {
					__skipLocalSyncRequest: true
				}, params );

				this.__skipLocalSyncRequest = false;
			}

			return request( params, callback );
		}
	} );
}

export const pruneStaleRecords = lifetime => {
	return cacheIndex.pruneStaleRecords( lifetime );
}

export const clearAll = () => {
	return cacheIndex.clearAll();
}

// expose `cacheIndex` global var (dev mode)
if ( 'development' === config( 'env' ) && typeof window !== 'undefined' ) {
	window.cacheIndex = cacheIndex;
}

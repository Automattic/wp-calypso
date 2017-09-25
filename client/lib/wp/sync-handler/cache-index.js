/**
 * External dependencies
 */
import debugFactory from 'debug';
import ms from 'ms';
import { difference, filter, matchesProperty, negate } from 'lodash';

/**
 * Internal dependencies
 */
import localforage from 'lib/localforage';
import { generatePageSeriesKey } from './utils';
import { RECORDS_LIST_KEY, SYNC_RECORD_NAMESPACE, LIFETIME } from './constants';

/**
 * Module variables
 */
const debug = debugFactory( 'calypso:sync-handler:cache' );

/**
 * Check it the given key is a `sync-record-` key
 *
 * @param {String} key - record key
 * @return {Boolean} `true` if it's a sync-record-<key>
 */
const isSyncRecordKey = key => key.indexOf( SYNC_RECORD_NAMESPACE ) === 0;

export const cacheIndex = {
	getAll() {
		return localforage.getItem( RECORDS_LIST_KEY );
	},

	/**
	 * Retrieve all records except the record
	 * that matches with the given key.
	 *
	 * @param {String} key - compare records with this key
	 * @return {Promise} promise
	 */
	getAllExcluding( key ) {
		debug( 'getAllExcluding()', key );
		const dropMatches = records => filter( records,
			negate( matchesProperty( 'key', key ) )
		);

		return new Promise( ( resolve, reject ) => {
			this.getAll()
				.then( dropMatches )
				.then( resolve )
				.catch( reject );
		} );
	},

	/**
	 * Add the given `key` into the records-list object
	 * adding at the same a timestamp (now).
	 * If the pair key-timestamp already exists it will be updated.
	 *
	 * @param {String} key - record key
	 * @param {Object} reqParams - request parameters
	 * @param {String} [pageSeriesKey] - key for records in a page-series (page 1, page 2, etc.)
	 * @return {Promise} promise
	 */
	addItem( key, reqParams, pageSeriesKey = null ) {
		return this.getAllExcluding( key ).then( records => {
			debug( '\n\nadding %o record', key, pageSeriesKey, records );
			const record = {
				key,
				reqParams,
				timestamp: Date.now()
			};
			if ( pageSeriesKey ) {
				record.pageSeriesKey = pageSeriesKey;
			}
			return localforage.setItem( RECORDS_LIST_KEY, [
				...records,
				record
			] );
		} );
	},

	removeItem( key ) {
		debug( 'removeItem()', key );
		return this.getAllExcluding( key ).then( records => {
			debug( '\n\nremoving %o record', key );
			return localforage.setItem( RECORDS_LIST_KEY, records );
		} );
	},

	/**
	 * It's a cleaning method and it should be used to re-sync the whole data.
	 * Calling this method all `sync-records-<key>` records will be
	 * removed plus the `records-list` one.
	 *
	 * @return {Promise} promise
	 */
	clearAll() {
		return localforage.keys().then( keys => {
			const syncHandlerKeys = keys.filter( isSyncRecordKey );
			const itemsPromises = syncHandlerKeys.map( key => localforage.removeItem( key ) );
			const recordsPromise = localforage.removeItem( RECORDS_LIST_KEY );
			return Promise.all( [ ...itemsPromises, recordsPromise ] )
				.then( debug( '%o records removed', syncHandlerKeys.length + 1 ) );
		} );
	},

	/**
	 * Removes individual records and updates the records-list Object
	 * @param  {Object} data - list of items in the form { removeList: [], retainList: [] }
	 * @return {Promise} - resolves with original data parameter
	 */
	removeRecordsByList( data ) {
		debug( 'removeRecordsByList()', data );
		return new Promise( ( resolve ) => {
			const { removeList, retainList } = data;
			if ( ! removeList.length ) {
				debug( 'No records to remove' );
				resolve();
			}
			const droppedPromises = removeList.map( item => localforage.removeItem( item.key ) );
			const recordsListPromise = localforage.setItem( RECORDS_LIST_KEY, retainList );
			return Promise.all( [ ...droppedPromises, recordsListPromise ] )
			.then( () => {
				debug( '%o records removed', removeList.length );
				resolve();
			} );
		} );
	},

	findStaleRecords( lifetime ) {
		const constructRecordsList = records => {
			const removeList = filter( records, rec => {
				return Date.now() - lifetime > rec.timestamp;
			} );

			return {
				removeList,
				retainList: difference( records, removeList )
			};
		};

		return new Promise( ( resolve, reject ) => {
			this.getAll()
			.then( constructRecordsList )
			.then( resolve )
			.catch( reject );
		} );
	},

	/**
	 * Prune old records older than the given lifetime
	 *
	 * @param {Number|String} lifetime - lifetime (ms or natural string)
	 * @return {Promise} promise
	 */
	pruneStaleRecords( lifetime = LIFETIME ) {
		lifetime = typeof lifetime === 'number'
			? lifetime
			: ms( lifetime );

		debug( 'start to prune records older than %s', ms( lifetime, { 'long': true } ) );

		return this.findStaleRecords( lifetime ).then( this.removeRecordsByList );
	},

	findPageSeriesRecords( pageSeriesKey ) {
		debug( 'dropPageSeries()' );
		const pickPageSeries = ( records ) => {
			const removeList = filter( records, record => record.pageSeriesKey === pageSeriesKey );
			const combinedResponse = {
				removeList,
				retainList: difference( records, removeList ),
			};
			debug( 'pickPageSeries()', combinedResponse );
			return combinedResponse;
		};

		return new Promise( ( resolve, reject ) => {
			this.getAll()
				.then( pickPageSeries )
				.then( resolve )
				.catch( reject );
		} );
	},

	clearPageSeries( reqParams ) {
		const pageSeriesKey = generatePageSeriesKey( reqParams );
		debug( 'clearPageSeries()', pageSeriesKey );
		return this.findPageSeriesRecords( pageSeriesKey ).then( this.removeRecordsByList );
	},

	/**
	 * clear records that pass a filter on normalized reqParams object
	 * @param  {Function} paramsFilter - filter function that accepts reqParams object
	 * @returns {Promise} - promise
	 */
	clearRecordsByParamFilter( paramsFilter ) {
		debug( 'clearRecordsByParamFilter()', filter );
		const findRecordsByFilter = ( records ) => {
			const removeList = filter( records, ( record ) => {
				if ( ! record.reqParams ) {
					return false;
				}
				return ( paramsFilter( record.reqParams ) );
			} );
			const combinedResponse = {
				removeList,
				retainList: difference( records, removeList )
			};
			debug( 'findRecordsByFilter()', combinedResponse );
			return combinedResponse;
		};
		return new Promise( ( resolve, reject ) => {
			this.getAll().then( records => {
				const combinedResponse = findRecordsByFilter( records );
				this.removeRecordsByList( combinedResponse ).then( resolve ).catch( reject );
			} );
		} );
	}
};

/**
 * External dependencies
 */
import omit from 'lodash/omit';
import cloneDeep from 'lodash/cloneDeep';
import range from 'lodash/range';
import includes from 'lodash/includes';

/**
 * Internal dependencies
 */
import QueryManager from '../';
import PaginatedQueryKey from './key';
import { DEFAULT_QUERY, PAGINATION_QUERY_KEYS } from './constants';

/**
 * PaginatedQueryManager manages paginated data which can be queried and
 * change over time
 */
export default class PaginatedQueryManager extends QueryManager {
	/**
	 * Returns true if the specified query is an object containing one or more
	 * query pagination keys.
	 *
	 * @param  {Object}  query Query object to check
	 * @return {Boolean}       Whether query contains pagination key
	 */
	static hasQueryPaginationKeys( query ) {
		if ( ! query ) {
			return false;
		}

		return PAGINATION_QUERY_KEYS.some( ( key ) => {
			return ( {} ).hasOwnProperty.call( query, key );
		} );
	}

	/**
	 * Returns items tracked by the instance. If a query is specified, returns
	 * items specific to that query.
	 *
	 * @param  {?Object}  query Optional query object
	 * @return {Object[]}       Items tracked
	 */
	getItems( query ) {
		if ( ! query ) {
			return super.getItems( query );
		}

		// Get all items, ignoring page. Test as truthy to ensure that query is
		// in-fact being tracked, otherwise bail early.
		const dataIgnoringPage = this.getItemsIgnoringPage( query, true );
		if ( ! dataIgnoringPage ) {
			return dataIgnoringPage;
		}

		// Slice the unpaginated set of data
		const page = query.page || this.constructor.DEFAULT_QUERY.page;
		const perPage = query.number || this.constructor.DEFAULT_QUERY.number;
		const startOffset = ( page - 1 ) * perPage;

		return dataIgnoringPage.slice( startOffset, startOffset + perPage );
	}

	/**
	 * Returns items tracked by the instance, ignoring pagination for the given
	 * query.
	 *
	 * @param  {Object}   query         Query object
	 * @param  {Boolean}  includeFiller Whether page structure should be left
	 *                                  intact to reflect found count, with
	 *                                  items yet to be received as `undefined`
	 * @return {Object[]}               Items tracked, ignoring page
	 */
	getItemsIgnoringPage( query, includeFiller = false ) {
		if ( ! query ) {
			return null;
		}

		const items = super.getItems( omit( query, PAGINATION_QUERY_KEYS ) );
		if ( ! items || includeFiller ) {
			return items;
		}

		return items.filter( ( item ) => undefined !== item );
	}

	/**
	 * Returns the number of pages for the specified query, or null if the
	 * query is not known.
	 *
	 * @param  {Object}  query Query object
	 * @return {?Number}       Pages for query
	 */
	getNumberOfPages( query ) {
		const found = this.getFound( query );
		if ( null === found ) {
			return found;
		}

		const perPage = query.number || this.constructor.DEFAULT_QUERY.number;
		return Math.ceil( found / perPage );
	}

	/**
	 * Signal that an item(s) has been received for tracking. Optionally
	 * specify that items received are intended for patch application, or that
	 * they are associated with a query. This function does not mutate the
	 * instance state. Instead, it returns a new instance of QueryManager if
	 * the tracked items have been modified, or the current instance otherwise.
	 *
	 * @param  {(Array|Object)} items              Item(s) to be received
	 * @param  {Object}         options            Options for receive
	 * @param  {Boolean}        options.patch      Apply changes as partial
	 * @param  {Object}         options.query      Query set to set or replace
	 * @param  {Boolean}        options.mergeQuery Add to existing query set
	 * @param  {Number}         options.found      Total found items for query
	 * @return {QueryManager}                      New instance if changed, or
	 *                                             same instance otherwise
	 */
	receive( items, options = {} ) {
		// When tracking queries, remove pagination query arguments. These are
		// simulated in `PaginatedQueryManager.prototype.getItems`.
		let modifiedOptions = options;
		if ( options.query ) {
			modifiedOptions = Object.assign( {
				mergeQuery: true
			}, options, {
				query: omit( options.query, PAGINATION_QUERY_KEYS )
			} );
		}

		// Receive the updated manager, passing a modified set of options to
		// exclude pagination keys, and to indicate appending query.
		const nextManager = super.receive( items, modifiedOptions );

		// If manager is the same instance, assume no changes have been made
		if ( this === nextManager ) {
			return nextManager;
		}

		// If original query does not have any pagination keys, we don't need
		// to update its item set
		if ( ! this.constructor.hasQueryPaginationKeys( options.query ) ) {
			return nextManager;
		}

		const queryKey = this.constructor.QueryKey.stringify( options.query );
		const page = options.query.page || this.constructor.DEFAULT_QUERY.page;
		const perPage = options.query.number || this.constructor.DEFAULT_QUERY.number;
		const startOffset = ( page - 1 ) * perPage;
		const nextQuery = nextManager.data.queries[ queryKey ];

		// Coerce received single item to array
		if ( ! Array.isArray( items ) ) {
			items = [ items ];
		}

		// If the item set for the queried page is identical, there are no
		// updates to be made
		const pageItemKeys = items.map( ( item ) => item[ this.options.itemKey ] );

		// If we've reached this point, we know that we've received a paged
		// set of data where our assumed item set is incorrect.
		const modifiedNextQuery = cloneDeep( nextQuery );

		// Found count is not always reliable, usually in consideration of user
		// capabilities. If we receive a set of items with a count not matching
		// the expected number for the query, we recalculate the found value to
		// reflect that this is the last set we can expect to receive. Found is
		// correct only if the count of items matches expected query number.
		if ( modifiedNextQuery.hasOwnProperty( 'found' ) && perPage !== items.length ) {
			// Otherwise, found count should be corrected to equal the number
			// of items received added to the summed per page total. Note that
			// we can reach this point if receiving the last page of items, but
			// the updated value should still be correct given this logic.
			modifiedNextQuery.found = ( ( page - 1 ) * perPage ) + items.length;
		}

		// Replace the assumed set with the received items.
		modifiedNextQuery.itemKeys = [
			...range( 0, startOffset ).map( ( index ) => {
				// Ensure that item set is comprised of all indices leading up
				// to received page, even if those items are not known.
				const itemKey = nextQuery.itemKeys[ index ];
				if ( ! includes( pageItemKeys, itemKey ) ) {
					return itemKey;
				}
			} ),
			...range( 0, perPage ).map( ( index ) => {
				// Fill page with items from the received set, or undefined to
				// at least ensure page matches expected range
				return pageItemKeys[ index ];
			} ),
			...nextQuery.itemKeys.slice( startOffset + perPage ).filter( ( itemKey ) => {
				// Filter out any item keys which exist in the page set, as
				// this indicates that they've trickled down from later page
				return itemKey && ! includes( pageItemKeys, itemKey );
			} )
		];

		// If found is known from options, ensure that we fill the end of the
		// array with undefined entries until found count
		if ( modifiedNextQuery.hasOwnProperty( 'found' ) ) {
			modifiedNextQuery.itemKeys = range( 0, modifiedNextQuery.found ).map( ( index ) => {
				return modifiedNextQuery.itemKeys[ index ];
			} );
		}

		return new this.constructor(
			Object.assign( {}, nextManager.data, {
				queries: Object.assign( {}, nextManager.data.queries, {
					[ queryKey ]: modifiedNextQuery
				} )
			} ),
			nextManager.options
		);
	}
}

PaginatedQueryManager.QueryKey = PaginatedQueryKey;

PaginatedQueryManager.DEFAULT_QUERY = DEFAULT_QUERY;

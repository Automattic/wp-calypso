/**
 * External dependencies
 */
import omit from 'lodash/omit';
import isEqual from 'lodash/isEqual';
import uniq from 'lodash/uniq';

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
			return query.hasOwnProperty( key );
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
		const dataIgnoringPage = this.getItemsIgnoringPage( query );
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
	 * @param  {Object}   query Query object
	 * @return {Object[]}       Items tracked, ignoring page
	 */
	getItemsIgnoringPage( query ) {
		if ( ! query ) {
			return null;
		}

		return super.getItems( omit( query, PAGINATION_QUERY_KEYS ) );
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

		// If there were previously no items for this query, there's no item
		// set to be updated
		const thisPageItems = this.getItems( options.query );
		if ( ! thisPageItems ) {
			return nextManager;
		}

		const queryKey = this.constructor.QueryKey.stringify( options.query );
		const page = options.query.page || DEFAULT_QUERY.page;
		const perPage = options.query.number || DEFAULT_QUERY.number;
		const startOffset = ( page - 1 ) * perPage;
		const nextQuery = nextManager.data.queries[ queryKey ];

		// Coerce received single item to array
		if ( ! Array.isArray( items ) ) {
			items = [ items ];
		}

		// If the item set for the queried page is identical, there are no
		// updates to be made
		const pageItemKeys = items.map( ( item ) => item[ this.options.itemKey ] );
		const nextManagerPageItemKeys = nextQuery.itemKeys.slice( startOffset, startOffset + perPage );
		if ( isEqual( pageItemKeys, nextManagerPageItemKeys ) ) {
			return nextManager;
		}

		// If we've reached this point, we know that we've received a paged
		// set of data where our assumed item set is incorrect.
		const modifiedNextQuery = Object.assign( {}, nextQuery );

		// Replace the assumed set with the received items.
		modifiedNextQuery.itemKeys = uniq( [
			...nextQuery.itemKeys.slice( 0, startOffset ),
			...pageItemKeys,
			...nextQuery.itemKeys.slice( startOffset + perPage )
		] );

		// Adjust the found count if uniquing the query items reveals that
		// we've lost or gained items
		if ( nextQuery.hasOwnProperty( 'found' ) ) {
			const foundIncrement = modifiedNextQuery.itemKeys.length - this.data.queries[ queryKey ].itemKeys.length;
			if ( 0 !== foundIncrement ) {
				modifiedNextQuery.found += foundIncrement;
			}
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

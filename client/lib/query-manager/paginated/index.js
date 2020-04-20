/**
 * External dependencies
 */
import { cloneDeep, includes, omit, range } from 'lodash';

/**
 * Internal dependencies
 */
import QueryManager from '../';
import PaginatedQueryKey from './key';
import { DEFAULT_PAGINATED_QUERY, PAGINATION_QUERY_KEYS } from './constants';

/**
 * PaginatedQueryManager manages paginated data which can be queried and
 * change over time
 */
export default class PaginatedQueryManager extends QueryManager {
	static QueryKey = PaginatedQueryKey;
	static DefaultQuery = DEFAULT_PAGINATED_QUERY;

	/**
	 * Returns true if the specified query is an object containing one or more
	 * query pagination keys.
	 *
	 * @param  {object}  query Query object to check
	 * @returns {boolean}       Whether query contains pagination key
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
	 * @param  {?object}  query Optional query object
	 * @returns {object[]}       Items tracked
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
		const page = query.page || this.constructor.DefaultQuery.page;
		const perPage = query.number || this.constructor.DefaultQuery.number;
		const startOffset = ( page - 1 ) * perPage;

		return dataIgnoringPage.slice( startOffset, startOffset + perPage );
	}

	/**
	 * Returns items tracked by the instance, ignoring pagination for the given
	 * query.
	 *
	 * @param  {object}   query         Query object
	 * @param  {boolean}  includeFiller Whether page structure should be left
	 *                                  intact to reflect found count, with
	 *                                  items yet to be received as `undefined`
	 * @returns {object[]}               Items tracked, ignoring page
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
	 * @param  {object}  query Query object
	 * @returns {?number}       Pages for query
	 */
	getNumberOfPages( query ) {
		const found = this.getFound( query );
		if ( null === found ) {
			return found;
		}

		const perPage = query.number || this.constructor.DefaultQuery.number;
		return Math.ceil( found / perPage );
	}

	/**
	 * Signal that an item(s) has been received for tracking. Optionally
	 * specify that items received are intended for patch application, or that
	 * they are associated with a query. This function does not mutate the
	 * instance state. Instead, it returns a new instance of QueryManager if
	 * the tracked items have been modified, or the current instance otherwise.
	 *
	 * @param  {(Array|object)} items              Item(s) to be received
	 * @param  {object}         options            Options for receive
	 * @param  {boolean}        options.patch      Apply changes as partial
	 * @param  {object}         options.query      Query set to set or replace
	 * @param  {boolean}        options.mergeQuery Add to existing query set
	 * @param  {number}         options.found      Total found items for query
	 * @returns {QueryManager}                      New instance if changed, or
	 *                                             same instance otherwise
	 */
	receive( items, options = {} ) {
		// When tracking queries, remove pagination query arguments. These are
		// simulated in `PaginatedQueryManager.prototype.getItems`.
		let modifiedOptions = options;
		if ( options.query ) {
			modifiedOptions = Object.assign(
				{
					mergeQuery: true,
				},
				options,
				{
					query: omit( options.query, PAGINATION_QUERY_KEYS ),
				}
			);
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
		const page = options.query.page || this.constructor.DefaultQuery.page;
		const perPage = options.query.number || this.constructor.DefaultQuery.number;
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

		// Found count is not always reliable.  For example, if one or more
		// password-protected posts would appear in a page of API results, but
		// the current user doesn't have access to view them, then they will be
		// omitted from the results entirely.  There are also other situations
		// where this can occur, such as `status: 'inherit'`.
		//
		// Even worse, the WP.com API will decrement the found count in this
		// situation, but only for items missing from the currently requested
		// page.
		//
		// What should we do about all of this?  We decided that given the
		// limitations of this code, it's OK for a page of results to have less
		// than the expected number of items, and we should not try to
		// decrement the "found" count either because then we could end up
		// skipping pages from the end of a result set.
		//
		// Therefore, the only thing we need to do here is take the *maximum*
		// of the previous "found" count and the next "found" count.
		if ( modifiedNextQuery.hasOwnProperty( 'found' ) && items.length < perPage ) {
			const previousQuery = this.data.queries[ queryKey ];
			if ( previousQuery && previousQuery.hasOwnProperty( 'found' ) ) {
				modifiedNextQuery.found = Math.max( previousQuery.found, modifiedNextQuery.found );
			}
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
			} ),
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
					[ queryKey ]: modifiedNextQuery,
				} ),
			} ),
			nextManager.options
		);
	}
}

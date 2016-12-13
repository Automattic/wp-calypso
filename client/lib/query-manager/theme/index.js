/**
 * External dependencies
 */
import { cloneDeep, get, isEqual, keyBy, range } from 'lodash';

/**
 * Internal dependencies
 */
import PaginatedQueryManager from '../paginated';
import ThemeQueryKey from './key';
import { DEFAULT_THEME_QUERY } from './constants';

/**
 * ThemeQueryManager manages themes which can be queried
 */
export default class ThemeQueryManager extends PaginatedQueryManager {
	/**
	 * Signal that an item(s) has been received for tracking. Optionally
	 * specify that items received are intended for patch application, or that
	 * they are associated with a query. This function does not mutate the
	 * instance state. Instead, it returns a new instance of ThemeQueryManager if
	 * the tracked items have been modified, or the current instance otherwise.
	 *
	 * Note that we implement our own receive() method instead of just relying on
	 * that of the base class. We choose to override the base class's receive()
	 * so the results are kept in the order they are received from the endpoint.
	 * The themes query REST API endpoint uses ElasticSearch to sort results by
	 * relevancy, which we cannot easily mimick on the client side.
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
		// Create the updated manager based on this instance, appending the newly received items
		const nextManager = new this.constructor(
			{
				...this.data,
				items: {
					...this.data.items,
					...keyBy( items, this.options.itemKey )
				},
				queries: this.data.queries
			},
			this.options
		);

		// If manager is the same instance, assume no changes have been made
		if ( this === nextManager ) {
			return nextManager;
		}

		// If no query was passed, return the QueryManager with only the new items appended
		if ( ! options.query ) {
			return nextManager;
		}

		// If we're already storing the query and associated items, return this instance.
		if ( isEqual( super.getItems( options.query ), items ) ) {
			return this;
		}

		const queryKey = this.constructor.QueryKey.stringify( options.query );
		const page = options.query.page || this.constructor.DEFAULT_QUERY.page;
		const perPage = options.query.number || this.constructor.DEFAULT_QUERY.number;
		const startOffset = ( page - 1 ) * perPage;
		const nextQuery = get( this.data.queries, queryKey, { itemKeys: [], found: options.found } );

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

		// If found is known from options, ensure that we fill the end of the
		// array with undefined entries until found count
		if ( modifiedNextQuery.hasOwnProperty( 'found' ) ) {
			modifiedNextQuery.itemKeys = range( 0, modifiedNextQuery.found ).map( ( index ) => {
				return modifiedNextQuery.itemKeys[ index ];
			} );
		}

		// Splice results into their proper place
		modifiedNextQuery.itemKeys.splice( startOffset, perPage, ...pageItemKeys );

		return new this.constructor(
			{
				...this.data,
				items: {
					...this.data.items,
					...keyBy( items, this.options.itemKey )
				},
				queries: {
					...this.data.queries,
					[ queryKey ]: modifiedNextQuery
				}
			},
			this.options
		);
	}
}

ThemeQueryManager.QueryKey = ThemeQueryKey;

ThemeQueryManager.DEFAULT_QUERY = DEFAULT_THEME_QUERY;

import { uniq, omit, reduce, isEqual, map, without } from 'lodash';

/**
 * Internal dependencies
 */
import PaginatedQueryManager from '../paginated';
import ThemeQueryKey from './key';
import { DEFAULT_THEME_QUERY, PAGINATION_QUERY_KEYS } from './constants';

/**
 * ThemeQueryManager manages themes which can be queried
 */
export default class ThemeQueryManager extends PaginatedQueryManager {

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
		// Coerce received single item to array
		if ( ! Array.isArray( items ) ) {
			items = [ items ];
		}

		// When tracking queries, remove pagination query arguments. These are
		// simulated in `PaginatedQueryManager.prototype.getItems`.
		let modifiedOptions = options;
		if ( options.query ) {
			modifiedOptions = Object.assign( options, {
				query: omit( options.query, PAGINATION_QUERY_KEYS )
			} );
		}

		const nextItems = reduce( items, ( memo, receivedItem ) => {
			const receivedItemKey = receivedItem[ this.options.itemKey ];
			const item = this.getItem( receivedItemKey );

			if ( isEqual( receivedItem, item ) ) {
				return memo;
			}

			memo[ receivedItemKey ] = receivedItem;
			return memo;
		}, this.data.items );

		const receivedQueryKey = this.constructor.QueryKey.stringify( modifiedOptions.query );
		const isNewlyReceivedQueryKey = ! this.data.queries[ receivedQueryKey ];
		const receivedItemKeys = map( items, this.options.itemKey );
		let nextQueries = this.data.queries;
		let nextQueryReceivedItemKeys;

		if ( isNewlyReceivedQueryKey ) {
			nextQueryReceivedItemKeys = receivedItemKeys;
		} else {
			const mergedItemkeys = uniq( this.data.queries[ receivedQueryKey ].itemKeys.concat( receivedItemKeys ) );
			// get rid of null
			nextQueryReceivedItemKeys = without( mergedItemkeys, null );
		}

		const nextReceivedQuery = {};
		nextReceivedQuery.itemKey = nextQueryReceivedItemKeys;
		nextReceivedQuery.found = options.found;

		nextQueries = Object.assign( {}, nextQueries, {
			[ receivedQueryKey ]: nextReceivedQuery
		} );

		return new this.constructor(
			Object.assign( {}, this.data, {
				items: nextItems,
				queries: nextQueries
			} ),
			this.options
		);
	}

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
	 * A sorting function that defines the sort order of items under
	 * consideration of the specified query.
	 *
	 * Note that this isn't doing anything so the results are kept in the order they
	 * are received from the endpoint.
	 * The themes query REST API endpoint uses ElasticSearch to sort results by
	 * relevancy, which we cannot easily mimick on the client side.
	 */
	sort() {
		return; // Leave the keys argument unchanged.
	}
}

ThemeQueryManager.QueryKey = ThemeQueryKey;

ThemeQueryManager.DEFAULT_QUERY = DEFAULT_THEME_QUERY;

/**
 * External dependencies
 */
import isEqual from 'lodash/isEqual';
import reduce from 'lodash/reduce';
import values from 'lodash/values';
import omit from 'lodash/omit';
import map from 'lodash/map';
import cloneDeep from 'lodash/cloneDeep';

/**
 * Internal dependencies
 */
import QueryKey from './key';

/**
 * QueryManager manages items which can be queried and change over time. It is
 * intended to be extended by a more specific implementation which is
 * responsible for implementing its matching, merging, and sorting behaviors.
 */
export default class QueryManager {
	/**
	 * Returns an instance of QueryManager or extending class given a
	 * serialized string representation of the instance. If the serialized
	 * string is invalid, a new empty instance is returned.
	 *
	 * @param  {String}       serialized Serialized QueryManager
	 * @return {QueryManager}            QueryManager instance
	 */
	static parse( serialized ) {
		try {
			const { data, options } = JSON.parse( serialized );
			return new this.prototype.constructor( data, options );
		} catch ( e ) {
			return new this.prototype.constructor();
		}
	}

	/**
	 * Constructs a new instance of QueryManager
	 *
	 * @param {Object} data            Initial data
	 * @param {Object} options         Manager options
	 * @param {String} options.itemKey Field to key items by
	 */
	constructor( data, options ) {
		this.data = Object.assign( {
			items: {},
			queries: {}
		}, data );

		this.options = Object.assign( {
			itemKey: 'ID'
		}, options );
	}

	/**
	 * Returns a serialized string representation of the instance
	 *
	 * @return {String} String representation of the instance
	 */
	toJSON() {
		const { data, options } = this;
		return JSON.stringify( { data, options } );
	}

	/**
	 * Returns a new item after consideration of incoming revision of that
	 * item. The item can be undefined in the case that the revision is
	 * new. Optionally patch the item to merge, not replace. Returning
	 * undefined indicates that item should be removed from known set.
	 *
	 * @param  {?Object} item        Existing item, if exists
	 * @param  {Object}  revisedItem Incoming revision of item
	 * @param  {Boolean} patch       Use patching application
	 * @return {?Object}             Item to track, or undefined to omit
	 */
	mergeItem( item, revisedItem, patch = false ) {
		if ( patch ) {
			return Object.assign( {}, item, revisedItem );
		}

		return revisedItem;
	}

	/**
	 * Returns true if the item matches the given query, or false otherwise.
	 *
	 * @param  {Object}  query Query object
	 * @param  {Object}  item  Item to consider
	 * @return {Boolean}       Whether item matches query
	 */
	matches( query, item ) {
		return !! item;
	}

	/**
	 * A sort comparison function that defines the sort order of items under
	 * consideration of the specified query.
	 *
	 * @param  {Object} query Query object
	 * @param  {Object} itemA First item
	 * @param  {Object} itemB Second item
	 * @return {Number}       0 if equal, less than 0 if itemA is first,
	 *                        greater than 0 if itemB is first.
	 */
	sort( query, itemA, itemB ) {
		if ( itemA === itemB ) {
			return 0;
		}

		return itemB - itemA;
	}

	/**
	 * Returns items tracked by the instance. If a query is specified, returns
	 * items specific to that query.
	 *
	 * @param  {?Object} query Optional query object
	 * @return {Object[]}      Items tracked
	 */
	getData( query ) {
		if ( ! query ) {
			return values( this.data.items );
		}

		const queryKey = this.constructor.QueryKey.stringify( query );
		if ( ! this.data.queries[ queryKey ] ) {
			return null;
		}

		return this.data.queries[ queryKey ].map( ( itemKey ) => {
			return this.data.items[ itemKey ];
		} );
	}

	/**
	 * Signal that an item(s) has been received for tracking. Optionally
	 * specify that items received are intended for patch application, or that
	 * they are associated with a query. This function does not mutate the
	 * instance state. Instead, it returns a new instance of QueryManager if
	 * the tracked items have been modified, or the current instance otherwise.
	 *
	 * @param  {(Array|Object)} items         Item(s) to be received
	 * @param  {Object}         options       Options for receive
	 * @param  {Boolean}        options.patch Apply changes as partial
	 * @param  {Object}         options.query Query set to set or replace
	 * @return {QueryManager}                 Same instance if no modifications
	 *                                        made, or a new instance otherwise
	 */
	receive( items = [], options = {} ) {
		// Coerce received single item to array
		if ( ! Array.isArray( items ) ) {
			items = [ items ];
		}

		const nextItems = reduce( items, ( memo, receivedItem ) => {
			const receivedItemKey = receivedItem[ this.options.itemKey ];
			const item = this.data.items[ receivedItemKey ];
			const mergedItem = this.mergeItem( item, receivedItem, options.patch );

			if ( undefined === mergedItem ) {
				// `undefined` item is an intended omission from set
				return omit( memo, receivedItemKey );
			}

			if ( ! item || ! isEqual( mergedItem, item ) ) {
				// Did not exist previously or has changed
				if ( memo === this.data.items ) {
					// Create a copy of memo, as we don't want to mutate the
					// original items set
					memo = cloneDeep( memo );
				}

				memo[ receivedItemKey ] = mergedItem;
			}

			return memo;
		}, this.data.items );

		let isModified = nextItems !== this.data.items,
			nextQueries = this.data.queries,
			receivedQueryKey;

		// Skip if no items have been updated, added, or removed. If query
		// specified with received items, we may need to update queries
		if ( ! isModified && ! options.query ) {
			return this;
		}

		if ( options.query ) {
			const receivedItemKeys = map( items, this.options.itemKey );
			receivedQueryKey = this.constructor.QueryKey.stringify( options.query );

			// Consider modified either if the current query set is not tracked
			// or if the keys differ from currently known set
			isModified = ! isEqual( this.data.queries[ receivedQueryKey ], receivedItemKeys );

			if ( isModified ) {
				nextQueries = Object.assign( {}, nextQueries, {
					[ receivedQueryKey ]: receivedItemKeys
				} );
			}
		}

		nextQueries = reduce( nextQueries, ( memo, originalItems, queryKey ) => {
			memo[ queryKey ] = originalItems;

			if ( receivedQueryKey && receivedQueryKey === queryKey ) {
				// We can save the effort testing against received items in
				// the current query, since we know they'll match
				return memo;
			}

			const query = this.constructor.QueryKey.parse( queryKey );
			items.forEach( ( receivedItem ) => {
				// Find item in known data for query
				const receivedItemKey = receivedItem[ this.options.itemKey ];
				const updatedItem = nextItems[ receivedItemKey ];
				const index = memo[ queryKey ].indexOf( receivedItemKey );

				if ( -1 !== index ) {
					// Item already exists in query, check to see whether the
					// updated item is being removed or no longer matches
					if ( ! updatedItem || ! this.matches( query, updatedItem ) ) {
						memo[ queryKey ] = [
							...memo[ queryKey ].slice( 0, index ),
							...memo[ queryKey ].slice( index + 1 )
						];
					}
				} else if ( updatedItem && this.matches( query, updatedItem ) ) {
					// A matching item should be inserted into the query set
					memo[ queryKey ] = ( memo[ queryKey ] || [] ).concat( receivedItemKey );

					// Re-sort the set
					memo[ queryKey ].sort( ( keyA, keyB ) => {
						if ( ! nextItems[ keyA ] || ! nextItems[ keyB ] ) {
							// One of the items has yet to be removed from the
							// set at this point in iteration, so don't bother
							// trying to sort.
							return 0;
						}

						return this.sort( query, nextItems[ keyA ], nextItems[ keyB ] );
					} );
				}
			} );

			isModified = isModified || memo[ queryKey ] !== originalItems;
			return memo;
		}, {} );

		if ( ! isModified ) {
			return this;
		}

		return new this.constructor( {
			items: nextItems,
			queries: nextQueries
		}, this.options );
	}
}

QueryManager.QueryKey = QueryKey;

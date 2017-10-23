/** @format */
/**
 * External dependencies
 */
import { overEvery, get } from 'lodash';

/**
 * Internal dependencies
 */
import QueryManager from 'lib/query-manager';

/**
 * ActivityQueryManager manages Activity which can be queried
 */
export default class ActivityQueryManager extends QueryManager {
	constructor( data, options ) {
		super( data, {
			itemKey: 'activityId',
			...options,
		} );
	}

	/**
	 * Sort descending order, defaulting to end of list if unknown.
	 *
	 * @param  {Object} query Query object (unused).
	 * @param  {Object} itemA First item
	 * @param  {Object} itemB Second item
	 * @return {Number}       0 if equal, less than 0 if itemA is first,
	 *                        greater than 0 if itemB is first.
	 */
	static compare( query, { activityTs: tsA }, { activityTs: tsB } ) {
		return Date.parse( tsB ) - Date.parse( tsA );
	}

	/**
	 * Returns true if the item matches the given query, or false otherwise.
	 *
	 * @param  {Object}  query Query object
	 * @param  {Object}  item  Item to consider
	 * @return {Boolean}       Whether item matches query
	 */
	static matches = overEvery( [
		ActivityQueryManager.matchDateStart,
		ActivityQueryManager.matchDateEnd,
	] );

	/**
	 * Returns true if the item matches query.dateStart if provided
	 *
	 * @param  {Object}  query Query object
	 * @param  {Object}  item  Item to consider
	 * @return {Boolean}       Whether item matches query.dateStart
	 */
	static matchDateStart( query, { activityTs } ) {
		return get( query, 'dateStart', -Infinity ) <= activityTs;
	}

	/**
	 * Returns true if the item matches query.dateEnd if provided
	 *
	 * @param  {Object}  query Query object
	 * @param  {Object}  item  Item to consider
	 * @return {Boolean}       Whether item matches query.dateEnd
	 */
	static matchDateEnd( query, { activityTs } ) {
		return activityTs <= get( query, 'dateEnd', Infinity );
	}
}

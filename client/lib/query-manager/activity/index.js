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
	 * @param  {object} query Query object (unused).
	 * @param  {object} itemA First item
	 * @param  {object} itemB Second item
	 * @returns {number}       0 if equal, less than 0 if itemA is first,
	 *                        greater than 0 if itemB is first.
	 */
	static compare( query, a, b ) {
		if ( a.rewindId && b.rewindId ) {
			return b.rewindId - a.rewindId;
		}

		// if for some reason no rewindId exists
		// (it _should_ exist)
		return b.activityTs - a.activityTs;
	}

	/**
	 * Returns true if the item matches the given query, or false otherwise.
	 *
	 * @param  {object}  query Query object
	 * @param  {object}  item  Item to consider
	 * @returns {boolean}       Whether item matches query
	 */
	static matches = overEvery( [
		ActivityQueryManager.matchDateStart,
		ActivityQueryManager.matchDateEnd,
	] );

	/**
	 * Returns true if the item matches query.dateStart if provided
	 *
	 * @param  {object}  query Query object
	 * @param  {object}  item  Item to consider
	 * @returns {boolean}       Whether item matches query.dateStart
	 */
	static matchDateStart( query, { activityTs } ) {
		return get( query, 'dateStart', -Infinity ) <= activityTs;
	}

	/**
	 * Returns true if the item matches query.dateEnd if provided
	 *
	 * @param  {object}  query Query object
	 * @param  {object}  item  Item to consider
	 * @returns {boolean}       Whether item matches query.dateEnd
	 */
	static matchDateEnd( query, { activityTs } ) {
		return activityTs <= get( query, 'dateEnd', Infinity );
	}
}

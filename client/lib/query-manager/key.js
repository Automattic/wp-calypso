/**
 * External dependencies
 */
import sortBy from 'lodash/sortBy';
import toPairs from 'lodash/toPairs';
import fromPairs from 'lodash/fromPairs';

/**
 * QueryKey manages the serialization and deserialization of a query key for
 * use in tracking query results in an instance of QueryManager.
 */
export default class QueryKey {
	/**
	 * Returns a serialized query, given a query object
	 *
	 * @param  {Object} query Query object
	 * @return {String}       Serialized query
	 */
	static stringify( query ) {
		return JSON.stringify( sortBy( toPairs( query ), ( pair ) => pair[ 0 ] ) );
	}

	/**
	 * Returns a query object, given a serialized query
	 *
	 * @param  {String} key Serialized query
	 * @return {Object}     Query object
	 */
	static parse( key ) {
		return fromPairs( JSON.parse( key ) );
	}
}

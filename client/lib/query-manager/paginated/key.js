/**
 * External dependencies
 */
import omit from 'lodash/omit';

/**
 * Internal dependencies
 */
import QueryKey from '../key';
import { PAGINATION_QUERY_KEYS } from './constants';

/**
 * PaginatedQueryKey manages the serialization and deserialization of a query
 * key for use in tracking query results in an instance of PostQueryManager.
 */
export default class PaginatedQueryKey extends QueryKey {
	/**
	 * Returns a serialized query, given a query object
	 *
	 * @param  {Object} query Query object
	 * @return {String}       Serialized query
	 */
	static stringify( query ) {
		return super.stringify( omit( query, PAGINATION_QUERY_KEYS ) );
	}

	/**
	 * Returns a query object, given a serialized query
	 *
	 * @param  {String} key Serialized query
	 * @return {Object}     Query object
	 */
	static parse( key ) {
		return omit( super.parse( key ), PAGINATION_QUERY_KEYS );
	}
}

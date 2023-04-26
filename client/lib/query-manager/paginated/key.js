import { omit } from 'lodash';
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
	 * @returns {string}       Serialized query
	 */
	static stringify( query ) {
		return super.stringify( omit( query, PAGINATION_QUERY_KEYS ) );
	}

	/**
	 * Returns a query object, given a serialized query
	 *
	 * @param  {string} key Serialized query
	 * @returns {Object}     Query object
	 */
	static parse( key ) {
		return omit( super.parse( key ), PAGINATION_QUERY_KEYS );
	}
}

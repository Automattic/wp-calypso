/**
 * External dependencies
 */
import omitBy from 'lodash/omitBy';

/**
 * Internal dependencies
 */
import PaginatedQueryKey from '../paginated/key';
import { DEFAULT_TERM_QUERY } from './constants';

/**
 * Returns true if the specified key value query pair is identical to that of
 * the default term query.
 *
 * @param  {*}       value Value to check
 * @param  {String}  key   Key to check
 * @return {Boolean}       Whether key value matches default query
 */
function isDefaultQueryValue( value, key ) {
	return DEFAULT_TERM_QUERY[ key ] === value;
}

/**
 * TermQueryKey manages the serialization and deserialization of a query key
 * for use in tracking query results in an instance of TermQueryManager.
 */
export default class TermQueryKey extends PaginatedQueryKey {
	/**
	 * Returns a serialized query, given a query object
	 *
	 * @param  {Object} query Query object
	 * @return {String}       Serialized query
	 */
	static stringify( query ) {
		return super.stringify( omitBy( query, isDefaultQueryValue ) );
	}

	/**
	 * Returns a query object, given a serialized query
	 *
	 * @param  {String} key Serialized query
	 * @return {Object}     Query object
	 */
	static parse( key ) {
		return omitBy( super.parse( key ), isDefaultQueryValue );
	}
}

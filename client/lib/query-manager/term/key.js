import { omitBy } from 'lodash';
import PaginatedQueryKey from '../paginated/key';
import { DEFAULT_TERM_QUERY } from './constants';

/**
 * Returns true if the specified key value query pair is identical to that of
 * the default post query, is null, or is undefined.
 *
 * @param  {*}       value Value to check
 * @param  {string}  key   Key to check
 * @returns {boolean}       Whether key value matches default query or is null
 */
function isDefaultOrNullQueryValue( value, key ) {
	return (
		null == value || DEFAULT_TERM_QUERY[ key ] === value // Double-equals null checks undefined, null
	);
}

/**
 * TermQueryKey manages the serialization and deserialization of a query key
 * for use in tracking query results in an instance of TermQueryManager.
 */
export default class TermQueryKey extends PaginatedQueryKey {
	/**
	 * Returns a serialized query, given a query object
	 *
	 * @param  {object} query Query object
	 * @returns {string}       Serialized query
	 */
	static stringify( query ) {
		return super.stringify( omitBy( query, isDefaultOrNullQueryValue ) );
	}

	/**
	 * Returns a query object, given a serialized query
	 *
	 * @param  {string} key Serialized query
	 * @returns {object}     Query object
	 */
	static parse( key ) {
		return omitBy( super.parse( key ), isDefaultOrNullQueryValue );
	}
}

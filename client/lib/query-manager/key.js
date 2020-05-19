/**
 * External dependencies
 */
import { sortBy, toPairs, fromPairs, omitBy } from 'lodash';

/**
 * QueryKey manages the serialization and deserialization of a query key for
 * use in tracking query results in an instance of QueryManager.
 */
export default class QueryKey {
	/**
	 * If defined in extending class, will omit all parameters where values
	 * match that of the default query
	 *
	 * @type {?object}
	 */
	static DEFAULT_QUERY = null;

	/**
	 * If defined in extending class as true, will omit all null values from
	 * stringified or parsed query objects
	 *
	 * @type {boolean}
	 */
	static OMIT_NULL_VALUES = false;

	/**
	 * Given a query object, determines which values of query are included in
	 * stringification or parsed return value. The base class will omit only
	 * undefined values, but can be extended to omit null values or values
	 * matching those in a default query.
	 *
	 * @param  {object} query Query object
	 * @returns {object}       Pruned query object
	 */
	static omit( query ) {
		const { OMIT_NULL_VALUES, DEFAULT_QUERY } = this;
		if ( ! OMIT_NULL_VALUES && ! DEFAULT_QUERY ) {
			return query;
		}

		return omitBy( query, ( value, key ) => {
			if ( OMIT_NULL_VALUES && null === value ) {
				return true;
			}

			if ( DEFAULT_QUERY && DEFAULT_QUERY[ key ] === value ) {
				return true;
			}

			return false;
		} );
	}

	/**
	 * Returns a serialized query, given a query object
	 *
	 * @param  {object} query Query object
	 * @returns {string}       Serialized query
	 */
	static stringify( query ) {
		const prunedQuery = this.omit( query );

		// A stable query is one which produces the same result regardless of
		// key ordering in the original object, to ensure that:
		//
		// QueryKey.stringify( { a: 1, b: 2 } ) === QueryKey.stringify( { b: 2, a: 1 } )
		const stableQuery = sortBy( toPairs( prunedQuery ), ( pair ) => pair[ 0 ] );

		return JSON.stringify( stableQuery );
	}

	/**
	 * Returns a query object, given a serialized query
	 *
	 * @param  {string} key Serialized query
	 * @returns {object}     Query object
	 */
	static parse( key ) {
		return this.omit( fromPairs( JSON.parse( key ) ) );
	}
}

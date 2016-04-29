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
		return JSON.stringify( query );
	}

	/**
	 * Returns a query object, given a serialized query
	 *
	 * @param  {String} key Serialized query
	 * @return {Object}     Query object
	 */
	static parse( key ) {
		return JSON.parse( key );
	}
}

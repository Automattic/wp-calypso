/**
 * Add persistence support to a reducer, with optional custom serialization methods
 *
 * @param {Function} reducer Reducer to add persistence to
 * @param {Object} options Object with optional custom serialization methods
 * @param {Function} options.serialize Custom serialization method
 * @param {Function} options.deserialize Custom deserialization method
 */
export function withPersistence( reducer, { serialize, deserialize } = {} ) {
	const wrappedReducer = reducer.bind( null );
	wrappedReducer.serialize = serialize || reducer.serialize || ( ( state ) => state );
	wrappedReducer.deserialize = deserialize || reducer.deserialize || ( ( persisted ) => persisted );
	return wrappedReducer;
}

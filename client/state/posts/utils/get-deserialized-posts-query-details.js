const REGEXP_SERIALIZED_QUERY = /^((\d+):)?(.*)$/;

/**
 * Returns an object with details related to the specified serialized query.
 * The object will include siteId and/or query object, if can be parsed.
 *
 * @param  {string} serializedQuery Serialized posts query
 * @returns {object}                 Deserialized posts query details
 */
export function getDeserializedPostsQueryDetails( serializedQuery ) {
	let siteId;
	let query;

	const matches = serializedQuery.match( REGEXP_SERIALIZED_QUERY );
	if ( matches ) {
		siteId = Number( matches[ 2 ] ) || undefined;
		try {
			query = JSON.parse( matches[ 3 ] );
		} catch ( error ) {}
	}

	return { siteId, query };
}

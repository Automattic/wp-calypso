/***
 * Creates a comment target id, a concatenation of siteId and postId basically
 * @param {Number} siteId site identification
 * @param {Number} postId post identification
 * @returns {String} comment target id
 */
export function getCommentParentKey( siteId, postId ) {
	return `${ siteId }-${ postId }`;
}

/***
 * Creates a request id, a concatenation of siteId, postId, and query params basically
 * @param {Number} siteId site identification
 * @param {Number} postId post identification
 * @param {Object} query post identification
 * @returns {String} request id
 */
export function createRequestId( siteId, postId, query ) {
	const queryKeys = Object.keys( query ).sort();
	const queryString = queryKeys.map( ( key ) => `${ key }=${ query[ key ] }` ).join( '-' );

	return `${siteId}-${postId}-${ queryString }`;
}

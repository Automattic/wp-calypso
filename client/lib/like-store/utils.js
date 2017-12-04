/** @format */

export function key( siteId, postId ) {
	if ( ! siteId || ! postId ) {
		throw new Error( 'siteId and postId must be non-empty' );
	}
	return siteId + '-' + postId;
}

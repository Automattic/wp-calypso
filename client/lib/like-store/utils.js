/** @format */

export const key = function( siteId, postId ) {
	if ( ! siteId || ! postId ) {
		throw new Error( 'siteId and postId must be non-empty' );
	}
	return siteId + '-' + postId;
};
export default { key };

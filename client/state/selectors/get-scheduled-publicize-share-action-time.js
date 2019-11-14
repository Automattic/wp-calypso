/**
 * @param {Object} state Global state tree
 * @param {Number} siteId Site ID
 * @param {Number} postId Post ID
 * @return {String|false} time when newly scheduled share action will be published
 */
export default function getScheduledPublicizeShareActionTime( state, siteId, postId ) {
	const date =
		state?.sharing?.publicize?.sharePostActions?.schedulingSharePostActionStatus?.[ siteId ]?.[
			postId
		]?.shareDate ?? false;

	if ( date ) {
		return new Date( date * 1000 );
	}
	return false;
}

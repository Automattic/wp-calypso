/**
 * @param {object} state Global state tree
 * @param {number} siteId Site ID
 * @param {number} postId Post ID
 * @returns {string|boolean} time when newly scheduled share action will be published
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

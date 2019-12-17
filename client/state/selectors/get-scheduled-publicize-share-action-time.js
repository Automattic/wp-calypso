/**
 * @param {object} state Global state tree
 * @param {number} siteId Site ID
 * @param {number} postId Post ID
 * @returns {string|boolean} time (Unix timestamp in seconds) when newly scheduled share action will be published
 */
export default function getScheduledPublicizeShareActionTime( state, siteId, postId ) {
	const actionStatus = state.sharing.publicize.sharePostActions.schedulingSharePostActionStatus;
	return actionStatus[ siteId ]?.[ postId ]?.shareDate ?? false;
}

/**
 * Returns whether comments API is disabled for a site
 *
 * @deprecated This is a temporary workaround for authentication issues with the comments API.
 * The proper solution would be to use wpcom.js for authentication handling, similar to how
 * Notifications handles it. See:
 * - https://github.com/Automattic/wp-calypso/blob/021c5391e1051195862d786bd49ad6926d8c8e5f/packages/wpcom.js/src/lib/site.comment.js#L46-L69
 * - https://github.com/Automattic/wp-calypso/blob/b6b0ad16b00ecb6338d39973bf014c1216d474d4/apps/notifications/src/panel/templates/comment-reply-input.jsx#L173-L177
 *
 * @param {Object} state Global state tree
 * @param {number} siteId Site identifier
 * @returns {boolean} Whether comments API is disabled
 */
export const isCommentsApiDisabled = ( state, siteId ) => {
	return !! state.comments.apiDisabled[ siteId ];
};

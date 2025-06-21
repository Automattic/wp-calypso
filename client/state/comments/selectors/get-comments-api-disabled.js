/**
 * Returns whether comments API is disabled for a site
 * @param {Object} state Global state tree
 * @param {number} siteId Site identifier
 * @returns {boolean} Whether comments API is disabled
 */
export const isCommentsApiDisabled = ( state, siteId ) => {
	return !! state.comments.apiDisabled[ siteId ];
};

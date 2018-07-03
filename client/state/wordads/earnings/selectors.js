/** @format */

/**
 * Returns earnings object for a siteId
 * @param   {Object} state  Global State
 * @param   {Number} siteId Site Id
 * @returns {Object}        WordAds Error
 */
export function getWordAdsEarnings( state, siteId ) {
	if ( ! state.wordads.earnings.items ) {
		return null;
	}

	return state.wordads.earnings.items[ siteId ];
}

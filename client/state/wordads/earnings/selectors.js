/** @format */

/**
 * External dependencies
 */

export function isRequestingWordadsEarnings( state, siteId ) {
	return !! state.wordads.earnings.fetchingItems[ siteId ];
}

/**
 * Returns earnings object for a siteId
 * @param   {Object} state  Global State
 * @param   {Number} siteId Site Id
 * @returns {Object}        WordAds Error
 */
export function getWordAdsEarnings( state, siteId ) {
	return state.wordads.earnings.items[ siteId ];
}

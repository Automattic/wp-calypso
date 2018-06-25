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

/**
 * Sanitizes site object and returns object if the WordAds earnings request was successful
 * @param   {Object} state  Global State
 * @param   {Object} site   Site
 * @returns {Object}        WordAds Error
 */
export function getWordAdsEarningsForSite( state, site ) {
	if ( ! site || ! site.ID ) {
		return null;
	}
	return getWordAdsEarnings( state, site.ID );
}

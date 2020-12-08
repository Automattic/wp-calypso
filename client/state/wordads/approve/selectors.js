/**
 * Internal dependencies
 */
import 'calypso/state/wordads/init';

/**
 * Returns true if we're currently requesting WordAds approval
 *
 * @param   {object} state  Global State
 * @param {number} siteId Site Id
 * @returns {boolean}       requesting state
 */
export function isRequestingWordAdsApproval( state, siteId ) {
	return !! state.wordads.approve.requesting[ siteId ];
}

/**
 * Sanitizes site object and returns true if we're currently requesting WordAds approval
 *
 * @param   {object} state  Global State
 * @param   {object} site   Site
 * @returns {boolean}       requesting state
 */
export function isRequestingWordAdsApprovalForSite( state, site ) {
	if ( ! site || ! site.ID ) {
		return false;
	}
	return isRequestingWordAdsApproval( state, site.ID );
}

/**
 * Returns true if the WordAds approval request has failed for a siteId
 *
 * @param   {object} state  Global State
 * @param   {number} siteId Site Id
 * @returns {?object}       WordAds Error
 */
export function getWordAdsError( state, siteId ) {
	return state.wordads.approve.requestErrors[ siteId ];
}

/**
 * Sanitizes site object and returns true if the WordAds approval request has failed for a siteId
 *
 * @param   {object} state  Global State
 * @param   {object} site   Site
 * @returns {?object}       WordAds Error
 */
export function getWordAdsErrorForSite( state, site ) {
	if ( ! site || ! site.ID ) {
		return null;
	}
	return getWordAdsError( state, site.ID );
}

/**
 * Returns true if the WordAds approval request was successful for a siteId
 *
 * @param   {object} state  Global State
 * @param   {number} siteId Site Id
 * @returns {?object}       WordAds Error
 */
export function getWordAdsSuccess( state, siteId ) {
	return state.wordads.approve.requestSuccess[ siteId ];
}

/**
 * Sanitizes site object and returns true if the WordAds approval request was successful
 *
 * @param   {object} state  Global State
 * @param   {object} site   Site
 * @returns {?object}       WordAds Error
 */
export function getWordAdsSuccessForSite( state, site ) {
	if ( ! site || ! site.ID ) {
		return null;
	}
	return getWordAdsSuccess( state, site.ID );
}

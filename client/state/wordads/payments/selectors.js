import 'calypso/state/wordads/init';

/**
 * Returns payments object for a siteId
 *
 * @param   {Object} state  Global State
 * @param   {number} siteId Site Id
 * @returns {Array}         Array of Payment or WordAds Error
 */
export function getWordAdsPayments( state, siteId ) {
	return state.wordads?.payments?.[ siteId ] ?? [];
}

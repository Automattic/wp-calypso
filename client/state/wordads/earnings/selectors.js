/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns earnings object for a siteId
 *
 * @param   {object} state  Global State
 * @param   {number} siteId Site Id
 * @returns {object}        WordAds Error
 */
export function getWordAdsEarnings( state, siteId ) {
	return get( state, [ 'wordads', 'earnings', siteId ], null );
}

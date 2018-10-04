/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns earnings object for a siteId
 * @param   {Object} state  Global State
 * @param   {Number} siteId Site Id
 * @returns {Object}        WordAds Error
 */
export function getWordAdsEarnings( state, siteId ) {
	return get( state, [ 'wordads', 'earnings', siteId ], null );
}

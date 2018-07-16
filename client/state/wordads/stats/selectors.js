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
export function getWordAdsStats( state, siteId ) {
	return get( state, [ 'wordads', 'stats', siteId ], null );
}

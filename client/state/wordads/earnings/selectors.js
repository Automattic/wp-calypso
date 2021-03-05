/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/wordads/init';

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

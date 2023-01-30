import { get } from 'lodash';

import 'calypso/state/wordads/init';

/**
 * Returns earnings object for a siteId
 *
 * @param   {Object} state  Global State
 * @param   {number} siteId Site Id
 * @returns {Object}        WordAds Error
 */
export function getWordAdsEarnings( state, siteId ) {
	return get( state, [ 'wordads', 'earnings', siteId ], null );
}

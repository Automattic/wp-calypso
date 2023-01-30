import { get } from 'lodash';

import 'calypso/state/wordads/init';

/**
 * Returns payments object for a siteId
 *
 * @param   {Object} state  Global State
 * @param   {number} siteId Site Id
 * @returns {Object}        WordAds Error
 */
export function getWordAdsPayments( state, siteId ) {
	return get( state, [ 'wordads', 'payments', siteId ], null );
}

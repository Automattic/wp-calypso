import { createSelector } from '@automattic/state-utils';
import { needsToRenewSoon } from 'calypso/lib/purchases';
import { getSitePurchases } from './get-site-purchases';

import 'calypso/state/purchases/init';

/**
 * Returns a list of Purchases associated with a Site that may be expiring soon
 * or have expired recently but are still renewable.
 *
 * @param {Object} state      global state
 * @param {number} siteId     the site id
 * @returns {Array} the matching expiring purchases if there are some
 */
export const getRenewableSitePurchases = createSelector(
	( state, siteId ) => getSitePurchases( state, siteId ).filter( needsToRenewSoon ),
	( state, siteId ) => [ state.purchases.data, siteId ]
);

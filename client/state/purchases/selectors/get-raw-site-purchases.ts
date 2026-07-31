import { createSelector } from '@automattic/state-utils';
import type { Purchase } from '@automattic/api-core';
import type { AppState } from 'calypso/types';

import 'calypso/state/purchases/init';

/**
 * Returns the purchases associated with a site as the API returned them, without
 * running them through the camelCase assembler.
 *
 * `blog_id` arrives as either a number or a numeric string depending on the
 * endpoint, so it is coerced before comparison.
 * @param   state  global state
 * @param   siteId the site id
 * @returns the site's purchases
 */
export const getRawSitePurchases = createSelector(
	( state: AppState, siteId: number | null | undefined ): Purchase[] =>
		( state.purchases.data ?? [] ).filter(
			( purchase: Purchase ) => Number( purchase.blog_id ) === siteId
		),
	( state: AppState, siteId: number | null | undefined ) => [ state.purchases.data, siteId ]
);

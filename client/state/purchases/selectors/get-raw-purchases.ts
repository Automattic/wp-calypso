import { normalizePurchase } from '@automattic/api-core';
import { createSelector } from '@automattic/state-utils';
import type { Purchase } from '@automattic/api-core';
import type { AppState } from 'calypso/types';

import 'calypso/state/purchases/init';

/**
 * Returns every purchase in the state tree in the snake_case shape the API
 * serves, rather than the camelCase shape `getPurchases` assembles.
 *
 * The Redux fetch thunks store the response body untouched, so ids may still
 * arrive as numeric strings; `normalizePurchase` coerces them exactly the way
 * `@automattic/api-queries` does, which keeps this list interchangeable with
 * the one `userPurchasesQuery`/`sitePurchasesQuery` return. Once the thunks
 * normalize at the fetch boundary this can become a plain state read.
 */
export const getRawPurchases = createSelector(
	( state: AppState ): Purchase[] =>
		Array.isArray( state.purchases.data ) ? state.purchases.data.map( normalizePurchase ) : [],
	( state: AppState ) => [ state.purchases.data ]
);

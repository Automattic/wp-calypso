import { getRawPurchases } from './get-raw-purchases';
import type { Purchase } from '@automattic/api-core';
import type { AppState } from 'calypso/types';

import 'calypso/state/purchases/init';

/**
 * Returns a single purchase by id in the snake_case API shape.
 */
export const getRawByPurchaseId = ( state: AppState, purchaseId: number ): Purchase | undefined =>
	getRawPurchases( state ).find( ( purchase ) => purchase.ID === purchaseId );

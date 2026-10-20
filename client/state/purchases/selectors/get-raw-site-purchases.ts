import { getRawPurchases } from './get-raw-purchases';
import type { Purchase } from '@automattic/api-core';
import type { AppState } from 'calypso/types';

import 'calypso/state/purchases/init';

/**
 * Returns the purchases belonging to a site in the snake_case API shape.
 */
export const getRawSitePurchases = (
	state: AppState,
	siteId: number | null | undefined
): Purchase[] => getRawPurchases( state ).filter( ( purchase ) => purchase.blog_id === siteId );

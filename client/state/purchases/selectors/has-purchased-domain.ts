import { isDomainRegistration } from '@automattic/calypso-products';
import { getRawSitePurchases } from './get-raw-site-purchases';
import type { AppState } from 'calypso/types';

import 'calypso/state/purchases/init';

export function hasPurchasedDomain( state: AppState, siteId: number | null ): boolean {
	const sitePurchases = getRawSitePurchases( state, siteId );

	return !! sitePurchases.find( isDomainRegistration );
}

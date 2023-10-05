import { isDomainRegistration } from '@automattic/calypso-products';
import { getSitePurchases } from './get-site-purchases';
import type { AppState } from 'calypso/types';

import 'calypso/state/purchases/init';

export function hasPurchasedDomain( state: AppState, siteId: number | null ): boolean {
	const sitePurchases = getSitePurchases( state, siteId );

	return !! sitePurchases.find( isDomainRegistration );
}

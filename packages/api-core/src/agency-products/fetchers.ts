import { wpcom } from '../wpcom-fetcher';
import type { AgencyProductFamily } from './types';

export async function fetchAgencyProducts( agencyId: number ): Promise< AgencyProductFamily[] > {
	return wpcom.req.get(
		{
			path: '/jetpack-licensing/partner/product-families',
			apiNamespace: 'wpcom/v2',
		},
		{ agency_id: agencyId }
	);
}

/**
 * Products with term (monthly/yearly) pricing and volume tiers, from the
 * Billing Dragon endpoint — the same source the production marketplace uses
 * when term pricing is enabled.
 */
export async function fetchAgencyTermProducts(
	agencyId: number
): Promise< AgencyProductFamily[] > {
	return wpcom.req.get(
		{
			path: '/agency/products',
			apiNamespace: 'wpcom/v2',
		},
		{ agency_id: agencyId }
	);
}

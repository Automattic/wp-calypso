import { wpcom } from '../wpcom-fetcher';
import type { AgencyProductFamily } from './types';

// The Billing Dragon catalog: same families as the legacy partner endpoint, plus
// per-term prices, introductory prices, and tier pricing.
export async function fetchAgencyProducts( agencyId: number ): Promise< AgencyProductFamily[] > {
	return wpcom.req.get(
		{
			path: '/agency/products',
			apiNamespace: 'wpcom/v2',
		},
		{ agency_id: agencyId }
	);
}

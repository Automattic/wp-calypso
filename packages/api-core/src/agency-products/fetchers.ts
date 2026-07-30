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

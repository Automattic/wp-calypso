import { wpcom } from '../wpcom-fetcher';
import type { FetchAgencySitesOptions, FetchAgencySitesResponse } from './types';

export async function fetchAgencySites(
	agencyId: number,
	{
		search,
		sort_field = 'url',
		sort_direction = 'asc',
		page,
		per_page,
	}: FetchAgencySitesOptions = {}
): Promise< FetchAgencySitesResponse > {
	const data: FetchAgencySitesResponse = await wpcom.req.get(
		{
			path: '/jetpack-agency/sites',
			apiNamespace: 'wpcom/v2',
		},
		{
			agency_id: agencyId,
			...( search ? { query: search } : {} ),
			...( page ? { page } : {} ),
			...( per_page ? { per_page } : {} ),
			...( sort_field ? { sort_field } : {} ),
			...( sort_direction ? { sort_direction } : {} ),
		}
	);

	return {
		sites: data.sites ?? [],
		total: data.total ?? 0,
	};
}

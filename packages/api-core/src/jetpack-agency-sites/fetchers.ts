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
		not_multisite,
		show_only_favorites,
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
			...( not_multisite ? { not_multisite: true } : {} ),
			...( show_only_favorites ? { show_only_favorites: true } : {} ),
		}
	);

	return {
		sites: data.sites ?? [],
		total: data.total ?? 0,
	};
}

export async function setAgencySiteFavorite(
	agencyId: number,
	siteId: number,
	isFavorite: boolean
): Promise< void > {
	await wpcom.req.post( {
		method: isFavorite ? 'POST' : 'DELETE',
		path: '/jetpack-agency/sites/favorite',
		apiNamespace: 'wpcom/v2',
		body: { site_id: siteId, agency_id: agencyId },
	} );
}

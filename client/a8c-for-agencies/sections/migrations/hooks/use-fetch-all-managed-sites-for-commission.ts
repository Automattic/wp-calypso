import { paginatedAgencySitesQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { urlToSlug } from 'calypso/lib/url/http-utils';
import type { AgencySite } from '@automattic/api-core';

export type SiteItem = {
	id: number;
	site: string;
	rawSite: AgencySite;
};

/**
 * Hook to fetch all managed sites for commission tagging.
 *
 * This hook is specifically designed for the tag sites for commission modal,
 * where we need to show all sites fetched from the API. The site creation date
 * shown in the modal is resolved by the host via `getSiteCreatedAt`.
 *
 * For other use cases that require full site data from Redux (like WooPayments or Reports),
 * use the `useFetchAllManagedSites` hook instead.
 */
export const useFetchAllManagedSitesForCommission = () => {
	// Fetch a single site first to learn the total, then request them all.
	const firstFetch = useQuery( paginatedAgencySitesQuery( { page: 1, per_page: 1 } ) );

	const total = firstFetch.data?.total ?? 0;

	const isEnabled = !! total && ! firstFetch.isFetching;
	const allSites = useQuery( {
		...paginatedAgencySitesQuery( { page: 1, per_page: total } ),
		enabled: isEnabled,
	} );

	// Sites without an `a4a_site_id` are dropped: the modal keys and selects rows
	// by `id`, so an undefined id would collapse distinct sites together.
	const mappedSites: SiteItem[] = ( allSites.data?.sites ?? [] )
		.filter( ( site ) => site.a4a_site_id != null )
		.map( ( site ) => ( {
			id: site.a4a_site_id as number,
			site: urlToSlug( site.url ),
			rawSite: site,
		} ) );

	const showLoading = ! mappedSites.length && ( firstFetch.isFetching || allSites.isFetching );

	return {
		...allSites,
		isLoading: showLoading || firstFetch.isLoading || allSites.isLoading,
		items: mappedSites,
	};
};

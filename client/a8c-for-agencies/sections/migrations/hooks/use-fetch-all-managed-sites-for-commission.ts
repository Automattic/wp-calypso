import { paginatedAgencySitesQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { urlToSlug } from 'calypso/lib/url/http-utils';
import { useSelector } from 'calypso/state';
import getSites from 'calypso/state/selectors/get-sites';
import type { AgencySite } from '@automattic/api-core';

export type SiteItem = {
	id: number;
	site: string;
	date: string;
	rawSite: AgencySite;
};

/**
 * Hook to fetch all managed sites for commission tagging.
 *
 * This hook is specifically designed for the tag sites for commission modal,
 * where we need to show all sites fetched from the API regardless of whether
 * they exist in the Redux store. Sites not in Redux will show a dash for the date.
 *
 * For other use cases that require full site data from Redux (like WooPayments or Reports),
 * use the `useFetchAllManagedSites` hook instead.
 */
export const useFetchAllManagedSitesForCommission = () => {
	// The main sites list, used to backfill each site's creation date.
	const sites = useSelector( getSites );

	// First fetch to get the total number of sites so we can fetch all of them.
	const firstFetch = useQuery( paginatedAgencySitesQuery( { page: 1, per_page: 1 } ) );

	const total = firstFetch.data?.total ?? 0;

	// Second fetch to get all sites, once we know the total and the first fetch
	// has settled.
	const isEnabled = !! total && ! firstFetch.isFetching;
	const allSites = useQuery( {
		...paginatedAgencySitesQuery( { page: 1, per_page: total } ),
		enabled: isEnabled,
	} );

	// Unlike useFetchAllManagedSites, this hook does NOT filter out sites that
	// are not in the Redux store - it includes all sites from the API.
	const mappedSites: SiteItem[] = ( allSites.data?.sites ?? [] ).map( ( site ) => {
		const foundSite = sites.find( ( s ) => s?.ID === site.blog_id );
		return {
			id: site.a4a_site_id as number,
			site: urlToSlug( site.url ),
			date: foundSite?.options?.created_at || '',
			rawSite: site,
		};
	} );

	const showLoading = ! mappedSites.length && ( firstFetch.isFetching || allSites.isFetching );

	return {
		...allSites,
		isLoading: showLoading || firstFetch.isLoading || allSites.isLoading,
		items: mappedSites,
	};
};

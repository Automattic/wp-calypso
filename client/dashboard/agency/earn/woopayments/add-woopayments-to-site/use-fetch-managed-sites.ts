import { paginatedAgencySitesQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { urlToSlug } from '../../../../utils/url';
import type { AgencySite } from '@automattic/api-core';

export type WooPaymentsSiteItem = {
	id: number;
	site: string;
	rawSite: AgencySite;
};

export function useFetchManagedSites( agencyId: number ) {
	// First fetch to discover the total number of managed sites so we can request all of them.
	const firstFetch = useQuery( {
		...paginatedAgencySitesQuery( { per_page: 1, page: 1 }, agencyId ),
		enabled: !! agencyId,
	} );

	const total = firstFetch.data?.total ?? 0;

	// Second fetch to retrieve every managed site, once we know the total and the first is done.
	const allSitesFetch = useQuery( {
		...paginatedAgencySitesQuery( { per_page: total, page: 1 }, agencyId ),
		enabled: !! agencyId && !! total && ! firstFetch.isFetching,
	} );

	const items = useMemo( () => {
		return ( allSitesFetch.data?.sites ?? [] )
			.map( ( site ) =>
				site.a4a_site_id != null
					? { id: site.a4a_site_id, site: urlToSlug( site.url ), rawSite: site }
					: null
			)
			.filter( Boolean ) as WooPaymentsSiteItem[];
	}, [ allSitesFetch.data ] );

	const showLoading = ! items.length && ( firstFetch.isFetching || allSitesFetch.isFetching );
	const isLoading = showLoading || firstFetch.isLoading || allSitesFetch.isLoading;

	return { items, isLoading };
}

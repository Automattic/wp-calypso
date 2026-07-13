import { paginatedAgencySitesQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { urlToSlug } from 'calypso/lib/url/http-utils';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import getSites from 'calypso/state/selectors/get-sites';
import type { AgencySite } from '@automattic/api-core';

export type WooPaymentsSiteItem = {
	id: number;
	site: string;
	date: string;
	rawSite: AgencySite;
};

export const useFetchManagedSites = () => {
	const agencyId = useSelector( getActiveAgencyId );

	// Main sites list, used to resolve each site's creation date.
	const sites = useSelector( getSites );

	// First fetch to discover the total number of managed sites so we can request all of them.
	const firstFetch = useQuery( {
		...paginatedAgencySitesQuery( { per_page: 1, page: 1 }, agencyId ?? 0 ),
		enabled: !! agencyId,
	} );

	const total = firstFetch.data?.total ?? 0;

	// Second fetch to retrieve every managed site, only once we know the total and the first is done.
	const allSitesFetch = useQuery( {
		...paginatedAgencySitesQuery( { per_page: total, page: 1 }, agencyId ?? 0 ),
		enabled: !! agencyId && !! total && ! firstFetch.isFetching,
	} );

	const items = useMemo( () => {
		return ( allSitesFetch.data?.sites ?? [] )
			.map( ( site ) => {
				const foundSite = sites.find( ( s ) => s?.ID === site.blog_id );
				return foundSite && site.a4a_site_id != null
					? {
							id: site.a4a_site_id,
							site: urlToSlug( site.url ),
							date: foundSite.options?.created_at || '',
							rawSite: site,
					  }
					: null;
			} )
			.filter( Boolean ) as WooPaymentsSiteItem[];
	}, [ allSitesFetch.data, sites ] );

	const showLoading = ! items.length && ( firstFetch.isFetching || allSitesFetch.isFetching );
	const isLoading = showLoading || firstFetch.isLoading || allSitesFetch.isLoading;

	return { items, isLoading };
};

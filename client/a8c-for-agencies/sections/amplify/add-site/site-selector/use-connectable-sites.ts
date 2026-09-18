import { paginatedAgencySitesQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import type { AgencySite } from '@automattic/api-core';

export interface ConnectableSite {
	id: number;
	url: string;
}

// Size of the first page. Rendered as soon as it lands so the picker is usable
// quickly; the full list swaps in once the second fetch completes.
const FIRST_PAGE_SIZE = 20;

// The query sorts by URL, so the options land alphabetically without a second pass.
const toConnectableSites = ( list: AgencySite[] ): ConnectableSite[] =>
	list.filter( ( site ) => !! site.url ).map( ( site ) => ( { id: site.blog_id, url: site.url } ) );

// The sites a user can amplify: the agency's connected sites, sourced from the
// same dashboard endpoint that powers the Sites list so the two stay in sync.
export default function useConnectableSites(): { sites: ConnectableSite[]; isLoading: boolean } {
	const agencyId = useSelector( getActiveAgencyId );

	// First fetch returns a usable page plus the total, so we can show results
	// immediately and only fetch the rest when there is more than one page.
	const firstFetch = useQuery( {
		...paginatedAgencySitesQuery( { page: 1, per_page: FIRST_PAGE_SIZE }, agencyId ),
		enabled: !! agencyId,
	} );

	const total = firstFetch.data?.total ?? 0;

	const allSites = useQuery( {
		...paginatedAgencySitesQuery( { page: 1, per_page: total || FIRST_PAGE_SIZE }, agencyId ),
		enabled: !! agencyId && total > FIRST_PAGE_SIZE && ! firstFetch.isFetching,
	} );

	const sites = useMemo< ConnectableSite[] >(
		() => toConnectableSites( allSites.data?.sites ?? firstFetch.data?.sites ?? [] ),
		[ allSites.data?.sites, firstFetch.data?.sites ]
	);

	// Stop showing the loading state once the first page is in, even while the
	// full list is still loading in the background.
	const isLoading = ! sites.length && firstFetch.isLoading;

	return { sites, isLoading };
}

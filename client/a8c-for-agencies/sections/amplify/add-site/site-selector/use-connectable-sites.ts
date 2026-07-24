import { useMemo } from 'react';
import useFetchDashboardSites from 'calypso/data/agency-dashboard/use-fetch-dashboard-sites';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import type { Site } from 'calypso/a8c-for-agencies/sections/sites/types';

export interface ConnectableSite {
	id: number;
	url: string;
}

// Size of the first page. Rendered as soon as it lands so the picker is usable
// quickly; the full list swaps in once the second fetch completes.
const FIRST_PAGE_SIZE = 20;

const defaultFilter = {
	issueTypes: [],
	showOnlyFavorites: false,
	showOnlyDevelopmentSites: false,
};

const toConnectableSites = ( list: Site[] ): ConnectableSite[] =>
	list
		.filter( ( site ): site is Site & { url: string } => !! site.url )
		.map( ( site ) => ( { id: site.blog_id, url: site.url } ) )
		.sort( ( a, b ) => b.id - a.id );

// The sites a user can amplify: the agency's connected sites, sourced from the
// same dashboard endpoint that powers the Sites list so the two stay in sync.
export default function useConnectableSites(): { sites: ConnectableSite[]; isLoading: boolean } {
	const agencyId = useSelector( getActiveAgencyId );

	const defaultArgs = {
		isPartnerOAuthTokenLoaded: false,
		searchQuery: '',
		currentPage: 1,
		agencyId,
		filter: defaultFilter,
	};

	// First fetch returns a usable page plus the total, so we can show results
	// immediately and only fetch the rest when there is more than one page.
	const firstFetch = useFetchDashboardSites( { ...defaultArgs, perPage: FIRST_PAGE_SIZE } );

	const total = firstFetch?.data?.total || 0;
	const isEnabled = total > FIRST_PAGE_SIZE && ! firstFetch.isFetching;
	const allSites = useFetchDashboardSites( { ...defaultArgs, perPage: total }, isEnabled );

	const sites = useMemo< ConnectableSite[] >(
		() => toConnectableSites( allSites?.data?.sites ?? firstFetch?.data?.sites ?? [] ),
		[ allSites?.data?.sites, firstFetch?.data?.sites ]
	);

	// Stop showing the loading state once the first page is in, even while the
	// full list is still loading in the background.
	const isLoading = ! sites.length && firstFetch.isLoading;

	return { sites, isLoading };
}

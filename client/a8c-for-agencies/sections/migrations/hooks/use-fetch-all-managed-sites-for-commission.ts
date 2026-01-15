import useFetchDashboardSites from 'calypso/data/agency-dashboard/use-fetch-dashboard-sites';
import { urlToSlug } from 'calypso/lib/url/http-utils';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import getSites from 'calypso/state/selectors/get-sites';
import { Site } from '../../sites/types';

export type SiteItem = {
	id: number;
	site: string;
	date: string;
	rawSite: Site;
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
	const agencyId = useSelector( getActiveAgencyId );

	const defaultArgs = {
		isPartnerOAuthTokenLoaded: false,
		searchQuery: '',
		currentPage: 1,
		perPage: 1,
		agencyId,
		filter: {
			issueTypes: [],
			showOnlyFavorites: false,
			showOnlyDevelopmentSites: false,
		},
	};

	// Get the main sites list
	const sites = useSelector( getSites );

	// First fetch to get the total number of sites so we can fetch all of them
	const firstFetchData = useFetchDashboardSites( defaultArgs );

	// Second fetch to get all sites using the total number of sites
	// Only fetch if we have a total and are not fetching to
	// ensure we don't fetch before the first fetch is complete
	const isEnabled = !! firstFetchData?.data?.total && ! firstFetchData.isFetching;
	const allSitesData = useFetchDashboardSites(
		{
			...defaultArgs,
			perPage: firstFetchData?.data?.total || 0,
		},
		isEnabled
	);

	// Map the sites to the format needed for the table
	// Unlike useFetchAllManagedSites, this hook does NOT filter out sites
	// that are not in the Redux store - it includes all sites from the API
	const mappedSites = allSitesData?.data?.sites.map( ( site: Site ) => {
		// Find the site in the main sites list to get the created_at date
		// If not found in Redux store, use empty string as fallback
		const foundSite = sites.find( ( s ) => s?.ID === site.blog_id );
		return {
			id: site.a4a_site_id,
			site: urlToSlug( site.url ),
			date: foundSite?.options?.created_at || '',
			rawSite: site,
		};
	} ) as SiteItem[];

	// Show loading if no sites and is fetching
	const showLoading =
		! mappedSites?.length && ( firstFetchData.isFetching || allSitesData.isFetching );

	// Show loading if first fetch is loading or all sites data is loading
	const isLoading = firstFetchData.isLoading || allSitesData.isLoading;

	return {
		...allSitesData,
		isLoading: showLoading || isLoading,
		items: mappedSites ?? [],
	};
};

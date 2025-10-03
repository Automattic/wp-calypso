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

export const useFetchAllManagedSites = () => {
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
	const mappedSites = allSitesData?.data?.sites
		.map( ( site: Site ) => {
			// Find the site in the main sites list to get the created_at date
			const foundSite = sites.find( ( s ) => s?.ID === site.blog_id );
			return foundSite
				? {
						id: site.a4a_site_id,
						site: urlToSlug( site.url ),
						date: foundSite.options?.created_at || '',
						rawSite: site,
				  }
				: null;
		} )
		.filter( Boolean ) as SiteItem[];

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

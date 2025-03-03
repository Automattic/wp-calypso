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
	const { data } = useFetchDashboardSites( defaultArgs );

	// Second fetch to get all sites using the total number of sites
	const allSitesData = useFetchDashboardSites( {
		...defaultArgs,
		perPage: data?.total || 0,
	} );

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

	return {
		...allSitesData,
		items: mappedSites ?? [],
	};
};

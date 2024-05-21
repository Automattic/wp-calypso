import useFetchDashboardSites from 'calypso/data/agency-dashboard/use-fetch-dashboard-sites';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';

export default function useNoActiveSite() {
	const agencyId = useSelector( getActiveAgencyId );

	const { data, isFetched } = useFetchDashboardSites( {
		isPartnerOAuthTokenLoaded: false,
		searchQuery: '',
		currentPage: 1,
		filter: {
			issueTypes: [],
			siteTags: [],
			showOnlyFavorites: false,
		},
		sort: {
			field: '',
			direction: '',
		},
		agencyId,
	} );

	return isFetched && ! data?.sites?.length;
}

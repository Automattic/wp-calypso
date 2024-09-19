import { useMemo } from 'react';
import useFetchDashboardSites from 'calypso/data/agency-dashboard/use-fetch-dashboard-sites';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';

type Props = {
	size?: number;
};

export default function useManagedSitesMap( { size = 100 }: Props ) {
	const agencyId = useSelector( getActiveAgencyId );

	const { data, isPending } = useFetchDashboardSites( {
		isPartnerOAuthTokenLoaded: false,
		searchQuery: '',
		currentPage: 1,
		perPage: size,
		agencyId,
		filter: {
			issueTypes: [],
			showOnlyFavorites: false,
			showOnlyDevelopmentSites: false,
		},
	} );

	return useMemo( () => {
		return {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			map: data?.sites.reduce( ( map: Record< number, boolean >, site: any ) => {
				map[ site.blog_id ] = true;
				return map;
			}, {} ),
			isPending,
		};
	}, [ data?.sites, isPending ] );
}

import { useContext } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import SitesOverviewContext from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/context';
import { Site } from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/types';
import wpcom from 'calypso/lib/wp';

const useFetchTestConnection = (
	isPartnerOAuthTokenLoaded: boolean,
	isConnectionHealthy: boolean,
	siteId: number
) => {
	const queryClient = useQueryClient();
	const { search, currentPage, filter, sort } = useContext( SitesOverviewContext );
	return useQuery(
		[ 'jetpack-agency-test-connection', siteId ],
		() =>
			wpcom.req.get(
				{
					path: `/jetpack-blogs/${ siteId }/test-connection`,
					apiNamespace: 'rest/v1.1',
				},
				{
					// We call the current health state "stale", as it might be different than the actual state.
					is_stale_connection_healthy: Boolean( isConnectionHealthy ),
				}
			),
		{
			enabled: isPartnerOAuthTokenLoaded,
			refetchOnWindowFocus: false,
			// We don't want to trigger another API request to the /test-connection endpoint for a given site
			// five minutes after the first successful one.
			staleTime: 1000 * 60 * 5,
			onSuccess: ( data ) => {
				const queryKey = [ 'jetpack-agency-dashboard-sites', search, currentPage, filter, sort ];
				queryClient.setQueryData( queryKey, ( oldSites: any ) => {
					return {
						...oldSites,
						sites: oldSites?.sites.map( ( site: Site ) => {
							if ( site.blog_id === siteId ) {
								return {
									...site,
									is_connected: data.connected,
								};
							}
							return site;
						} ),
					};
				} );
			},
		}
	);
};

export default useFetchTestConnection;

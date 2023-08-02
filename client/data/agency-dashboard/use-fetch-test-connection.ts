import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useContext } from 'react';
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
	return useQuery( {
		queryKey: [ 'jetpack-agency-test-connection', siteId ],
		queryFn: () =>
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
		enabled: isPartnerOAuthTokenLoaded,
		refetchOnWindowFocus: false,
		// We don't want to trigger another API request to the /test-connection endpoint for a given site
		// one minute after the first successful one.
		staleTime: 1000 * 60,
		onSuccess: ( data ) => {
			// We are setting the "is_connected" property of the site in the query cache of the "sites"
			// API to the value returned by the /test-connection endpoint. We are doing this to filter
			// the site with connection issues easily in the UI and to have a single source of truth for
			// the connection state of a site to avoid inconsistencies.
			const queryKey = [ 'jetpack-agency-dashboard-sites', search, currentPage, filter, sort ];
			queryClient.setQueryData( queryKey, ( oldSites: any ) => {
				return {
					...oldSites,
					sites: oldSites?.sites.map( ( site: Site ) => {
						if ( site.blog_id === siteId ) {
							return {
								...site,
								is_connected: data?.hasOwnProperty( 'connected' ) ? data.connected : true,
							};
						}
						return site;
					} ),
				};
			} );
		},
	} );
};

export default useFetchTestConnection;

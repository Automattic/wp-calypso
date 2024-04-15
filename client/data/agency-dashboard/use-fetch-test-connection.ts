import { useQueries, useQuery } from '@tanstack/react-query';
import { Site } from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/types';
import wpcom from 'calypso/lib/wp';

// We don't want to trigger another API request to the /test-connection endpoint for a given site
// one minute after the first successful one.
const STALE_TIME = 1000 * 60;

const getQueryKey = ( ID: Site[ 'blog_id' ] ) => [ 'jetpack-fetch-test-connection', ID ];

const queryOptions = {
	staleTime: STALE_TIME,
};

const createQueryFn =
	( siteId: Site[ 'blog_id' ], isConnectionHealthy: Site[ 'is_connection_healthy' ] ) => () =>
		wpcom.req.get(
			{
				path: `/jetpack-blogs/${ siteId }/test-connection`,
				apiNamespace: 'rest/v1.1',
			},
			{
				// We call the current health state "stale", as it might be different than the actual state.
				is_stale_connection_healthy: Boolean( isConnectionHealthy ),
			}
		);

export const useFetchTestConnections = ( isPartnerOAuthTokenLoaded: boolean, sites: Site[] ) => {
	const results = useQueries( {
		queries: sites.map( ( site ) => ( {
			queryKey: getQueryKey( site.blog_id ),
			queryFn: createQueryFn( site.blog_id, site.is_connection_healthy ),
			enabled: isPartnerOAuthTokenLoaded && Array.isArray( sites ) && sites.length > 0,
			...queryOptions,
		} ) ),
	} );

	return results.map( ( result, index ) => ( {
		ID: sites[ index ].blog_id,
		connected: result.data?.connected ?? true,
	} ) );
};

export const useFetchTestConnection = (
	isPartnerOAuthTokenLoaded: boolean,
	isConnectionHealthy: boolean,
	siteId: number
) => {
	return useQuery( {
		queryKey: getQueryKey( siteId ),
		queryFn: createQueryFn( siteId, isConnectionHealthy ),
		...queryOptions,
		select( data ) {
			return {
				ID: siteId,
				connected: data?.connected ?? true,
			};
		},
	} );
};

export default useFetchTestConnection;

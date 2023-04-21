import { useQuery } from 'react-query';
import wpcom from 'calypso/lib/wp';

const useFetchTestConnection = (
	isPartnerOAuthTokenLoaded: boolean,
	isConnectionHealthy: boolean,
	siteId: number
) => {
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
		}
	);
};

export default useFetchTestConnection;

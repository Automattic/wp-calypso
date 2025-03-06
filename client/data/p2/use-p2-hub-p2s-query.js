import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import wpcom from 'calypso/lib/wp';
import isSiteP2Hub from 'calypso/state/selectors/is-site-p2-hub';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';

const useP2HubP2sQuery = ( siteId, fetchOptions = {}, queryOptions = {} ) => {
	const isWPForTeamsSite = useSelector( ( state ) => isSiteWPForTeams( state, siteId ) );
	const isP2Hub = useSelector( ( state ) => isSiteP2Hub( state, siteId ) );
	// For sites that are not P2 Hubs, we don't need to make the query.
	const requestUnnecessary = ! isWPForTeamsSite || ! isP2Hub;

	return useQuery( {
		queryKey: [ 'p2-hub-p2s', siteId, fetchOptions ],
		queryFn: () =>
			wpcom.req.get(
				{
					path: '/p2/workspace/sites/all',
					apiNamespace: 'wpcom/v2',
				},
				{
					hub_id: siteId,
					...fetchOptions,
				}
			),
		...queryOptions,
		enabled: !! siteId && ! requestUnnecessary,
		retryDelay: 3000,
	} );
};

export default useP2HubP2sQuery;

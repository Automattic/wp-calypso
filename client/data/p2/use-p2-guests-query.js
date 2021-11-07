import { useQuery } from 'react-query';
import { useSelector } from 'react-redux';
import wpcom from 'calypso/lib/wp';
import isSiteP2Hub from 'calypso/state/selectors/is-site-p2-hub';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';

const useP2GuestsQuery = ( siteId, queryOptions = {} ) => {
	const isWPForTeamsSite = useSelector( ( state ) => isSiteWPForTeams( state, siteId ) );
	const isP2Hub = useSelector( ( state ) => isSiteP2Hub( state, siteId ) );
	// For sites that can't have P2 guests, don't even make the request.
	const requestUnnecessary = ! isWPForTeamsSite || isP2Hub;

	return useQuery(
		[ 'p2-guest-users', siteId ],
		() =>
			requestUnnecessary
				? () => {}
				: wpcom.req.get(
						{
							path: `/p2/users/guests/`,
							apiNamespace: 'wpcom/v2',
						},
						{
							blog_id: siteId,
						}
				  ),
		{
			...queryOptions,
			enabled: !! siteId,
			retryDelay: 3000,
		}
	);
};

export default useP2GuestsQuery;

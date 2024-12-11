import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

// Limit this lookup to once per 24 hours.
const FETCH_TRAFFIC_STALE_TIME = 24 * 60 * 60 * 1000;

async function fetchHighlights( siteId: number ) {
	const response = await wpcom.req.get(
		{
			path: `/sites/${ siteId }/stats/highlights`,
		},
		{
			source: 'stats-feedback',
		}
	);

	return response;
}

function useHighlightsQuery( siteId: number ) {
	const response = useQuery( {
		queryKey: [ 'fetchHighlights', siteId ],
		queryFn: () => fetchHighlights( siteId ),
		staleTime: FETCH_TRAFFIC_STALE_TIME,
	} );

	return response;
}

export default useHighlightsQuery;

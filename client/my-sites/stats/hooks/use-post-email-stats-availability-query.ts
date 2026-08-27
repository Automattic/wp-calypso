import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import getDefaultQueryParams from './default-query-params';

interface EmailRateResponse {
	total_sends?: number;
	total_opens?: number;
}

function hasEmailStats( data?: EmailRateResponse ) {
	return ( data?.total_sends ?? 0 ) > 0 || ( data?.total_opens ?? 0 ) > 0;
}

function queryEmailRate( siteId: number, postId: number ): Promise< EmailRateResponse > {
	return wpcom.req.get( `/sites/${ siteId }/stats/opens/emails/${ postId }/rate` );
}

/**
 * Whether a post was ever sent as a newsletter email, based on the email stats themselves
 * rather than post metadata, which does not always reflect what was actually sent.
 */
export default function usePostEmailStatsAvailabilityQuery(
	siteId: number | null,
	postId: number,
	enabled = true
) {
	return useQuery( {
		...getDefaultQueryParams(),
		queryKey: [ 'stats', 'emails', 'rate', siteId, postId ],
		queryFn: () => queryEmailRate( siteId as number, postId ),
		enabled: enabled && !! siteId && postId > 0,
		// A "no email stats" answer can be transient while a newsletter is still being sent,
		// so only a positive result is kept for a while.
		staleTime: ( query ) => ( hasEmailStats( query.state.data ) ? 1000 * 60 * 5 : 0 ),
		select: hasEmailStats,
	} );
}

import { queryOptions, useQuery, type QueryClient } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import getDefaultQueryParams from './default-query-params';

interface EmailRateResponse {
	total_sends?: number | null;
	total_opens?: number | null;
}

export function hasEmailStats( data?: EmailRateResponse ) {
	return ( data?.total_sends ?? 0 ) > 0 || ( data?.total_opens ?? 0 ) > 0;
}

function queryEmailRate( siteId: number | null, postId: number ): Promise< EmailRateResponse > {
	return wpcom.req.get( `/sites/${ siteId }/stats/opens/emails/${ postId }/rate` );
}

export function postEmailStatsAvailabilityQueryOptions( siteId: number | null, postId: number ) {
	return queryOptions( {
		...getDefaultQueryParams(),
		queryKey: [ 'stats', 'emails', 'opens', 'rate', siteId, postId ],
		queryFn: () => queryEmailRate( siteId, postId ),
		// A "no email stats" answer can be transient while a newsletter is still being sent,
		// so only a positive result is kept for a while.
		staleTime: ( query ) => ( hasEmailStats( query.state.data ) ? 1000 * 60 * 5 : 1000 * 30 ),
		// A failed request reads the same as "no email stats" and hides the tabs, so
		// let a remount retry instead of pinning the error until a full reload
		// (the shared defaults set retryOnMount: false).
		retryOnMount: true,
		meta: { persist: false },
	} );
}

/**
 * Mark a post as having email stats without waiting for the request, for navigations
 * from a page that already proves they exist (e.g. the email detail tabs). The counts
 * are a placeholder; nothing reads them besides hasEmailStats. Real responses win.
 */
export function seedPostEmailStatsAvailability(
	queryClient: QueryClient,
	siteId: number | null,
	postId: number
) {
	const { queryKey } = postEmailStatsAvailabilityQueryOptions( siteId, postId );
	if ( queryClient.getQueryData( queryKey ) === undefined ) {
		queryClient.setQueryData( queryKey, { total_sends: 1 } );
	}
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
		...postEmailStatsAvailabilityQueryOptions( siteId, postId ),
		enabled: !! enabled && !! siteId && postId > 0,
		select: hasEmailStats,
	} );
}

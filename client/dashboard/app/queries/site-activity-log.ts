import { queryOptions } from '@tanstack/react-query';
import { fetchSiteActivityLog, fetchSiteRewindableActivityLog } from '../../data/site-activity-log';

export const siteLastFiveActivityLogEntriesQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'activity-log', 'last-five' ],
		queryFn: () => fetchSiteActivityLog( siteId, { number: 5 } ),
		select: ( data ) => data.current?.orderedItems?.slice( 0, 5 ) ?? [],
	} );

export const siteRewindableActivityLogEntriesQuery = (
	siteId: number,
	number: number = 1000 // 1000 is the maximum number of entries that can be fetched.
) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'activity-log', 'rewindable', number ],
		queryFn: () => fetchSiteRewindableActivityLog( siteId, { number } ),
		select: ( data ) => data.current?.orderedItems?.slice( 0, number ) ?? [],
	} );

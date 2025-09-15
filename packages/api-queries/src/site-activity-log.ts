import {
	fetchSiteActivityLog,
	fetchSiteRewindableActivityLog,
	ActivityLogParams,
} from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const siteLastFiveActivityLogEntriesQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'activity-log', 'last-five' ],
		queryFn: () => fetchSiteActivityLog( siteId, { number: 5 } ),
		select: ( data ) => data.activityLogs?.slice( 0, 5 ) ?? [],
	} );

export const siteRewindableActivityLogEntriesQuery = (
	siteId: number,
	number: number = 1000, // 1000 is the maximum number of entries that can be fetched.
	aggregate: boolean = false
) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'activity-log', 'rewindable', number, aggregate ],
		queryFn: () => fetchSiteRewindableActivityLog( siteId, { number, aggregate } ),
		select: ( data ) => data.current?.orderedItems?.slice( 0, number ) ?? [],
	} );

export const siteActivityLogQuery = ( siteId: number, activityLogQueryParams: ActivityLogParams ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'activity-log', activityLogQueryParams ],
		queryFn: () => fetchSiteActivityLog( siteId, activityLogQueryParams ),
	} );

import {
	fetchSiteActivityLog,
	ActivityLogParams,
	fetchSiteActivityLogGroupCounts,
} from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const siteLastFiveActivityLogEntriesQuery = ( siteId: number, notGroup?: string[] ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'activity-log', 'last-five', notGroup ],
		queryFn: () =>
			fetchSiteActivityLog( siteId, {
				number: 5,
				...( notGroup?.length && { not_group: notGroup } ),
			} ),
		select: ( data ) => data.activityLogs?.slice( 0, 5 ) ?? [],
	} );

export const siteActivityLogQuery = ( siteId: number, activityLogQueryParams: ActivityLogParams ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'activity-log', activityLogQueryParams ],
		queryFn: () => fetchSiteActivityLog( siteId, activityLogQueryParams ),
	} );

export const siteActivityLogGroupCountsQuery = (
	siteId: number,
	activityLogQueryParams: ActivityLogParams = { number: 1000 } // we're getting the count for the latest 1000 items to list the available groups
) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'activity-log', 'group-counts', activityLogQueryParams ],
		queryFn: () => fetchSiteActivityLogGroupCounts( siteId, activityLogQueryParams ),
	} );

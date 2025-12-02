import {
	fetchSiteBackupActivityLog,
	fetchSiteBackupActivityLogGroupCounts,
} from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const siteBackupActivityLogEntriesQuery = (
	siteId: number,
	number: number = 1000, // 1000 is the maximum number of entries that can be fetched.
	aggregate: boolean = false,
	after?: string,
	before?: string
) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'backup-activity-log', number, aggregate, after, before ],
		queryFn: () => fetchSiteBackupActivityLog( siteId, { number, aggregate, after, before } ),
		select: ( data ) => data.current?.orderedItems?.slice( 0, number ) ?? [],
	} );

export const siteBackupActivityLogGroupCountsQuery = (
	siteId: number,
	after?: string,
	before?: string
) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'backup-activity-log', 'group-counts', after, before ],
		queryFn: () => fetchSiteBackupActivityLogGroupCounts( siteId, { after, before } ),
	} );

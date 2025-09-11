import { fetchSiteRewindableActivityLog } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

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

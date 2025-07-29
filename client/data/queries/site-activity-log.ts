import { fetchSiteActivityLog } from '../api/site-activity-log';
import type { ActivityLog } from '../api/site-activity-log';

export const siteLastFiveActivityLogEntriesQuery = ( siteId: number ) => ( {
	queryKey: [ 'site', siteId, 'activity-log', 'last-five' ],
	queryFn: () => fetchSiteActivityLog( siteId, { number: 5 } ),
	select: ( data: ActivityLog ) => data.current?.orderedItems?.slice( 0, 5 ) ?? [],
} );

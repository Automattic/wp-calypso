import { fetchSiteRewindableActivityLog } from '../api/site-activity-log';
import type { ActivityLog } from '../api/site-activity-log';

export const siteLastBackupQuery = ( siteId: number ) => ( {
	queryKey: [ 'site', siteId, 'backups', 'last' ],
	queryFn: () => fetchSiteRewindableActivityLog( siteId, { number: 1 } ),
	select: ( data: ActivityLog ) => data.current?.orderedItems[ 0 ] ?? null,
} );

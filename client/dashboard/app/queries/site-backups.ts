import { queryOptions } from '@tanstack/react-query';
import { fetchSiteRewindableActivityLog } from '../../data/site-activity-log';

export const siteLastBackupQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'backups', 'last' ],
		queryFn: () => fetchSiteRewindableActivityLog( siteId, { number: 1 } ),
		select: ( data ) => data.current?.orderedItems[ 0 ] ?? null,
	} );

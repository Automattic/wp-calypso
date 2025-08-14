import { queryOptions } from '@tanstack/react-query';
import { fetchSiteRewindableActivityLog } from '../../data/site-activity-log';
import { fetchSiteBackups } from '../../data/site-backups';

export const siteLastBackupQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'backups', 'last' ],
		queryFn: () => fetchSiteRewindableActivityLog( siteId, { number: 1 } ),
		select: ( data ) => data.current?.orderedItems[ 0 ] ?? null,
	} );

export const siteBackupsQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'rewind', 'backups' ],
		queryFn: () => fetchSiteBackups( siteId ),
	} );

import { fetchSiteBackups } from '../../data/site-jetpack-rewind-backups';
import type { Backup } from '../../data/site-jetpack-rewind-backups';

export const siteBackupsQuery = ( siteId: number ) => ( {
	queryKey: [ 'site', siteId, 'backups' ],
	queryFn: () => fetchSiteBackups( siteId ),
} );

export const siteLastBackupQuery = ( siteId: number ) => ( {
	...siteBackupsQuery( siteId ),
	select: ( backups: Backup[] ) => {
		if ( ! Array.isArray( backups ) ) {
			return null;
		}

		return backups.find( ( backup ) => backup.status === 'finished' ) ?? null;
	},
} );

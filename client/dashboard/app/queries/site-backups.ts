import { fetchSiteBackups } from '../../data/site-jetpack-rewind-backups';
import type { Backup } from '../../data/site-jetpack-rewind-backups';

export const siteBackupsQuery = ( siteId: number ) => ( {
	queryKey: [ 'site', siteId, 'backups' ],
	queryFn: () => fetchSiteBackups( siteId ),
} );

export const siteLastBackupTimeQuery = ( siteId: number ) => ( {
	...siteBackupsQuery( siteId ),
	select: ( backups: Backup[] ) => {
		if ( ! Array.isArray( backups ) ) {
			return null;
		}

		const lastBackup = backups.find( ( backup ) => backup.status === 'finished' );
		if ( ! lastBackup ) {
			return null;
		}

		// Return last_updated in UTC in ISO-8601 format.
		return lastBackup.last_updated.replace( ' ', 'T' ) + 'Z';
	},
} );

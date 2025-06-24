import { fetchSiteBackups, Backup } from '../../data/site-jetpack-rewind-backups';

export const siteBackupLastEntryQuery = ( siteId: number ) => ( {
	queryKey: [ 'site', siteId, 'backup-last-entry' ],
	queryFn: () => fetchSiteBackups( siteId ),
	select: ( backups: Backup[] ) => {
		if ( ! Array.isArray( backups ) ) {
			return null;
		}

		return backups.find( ( backup ) => backup.status === 'finished' );
	},
} );

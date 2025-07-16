import wpcom from 'calypso/lib/wp';

export interface Backup {
	last_updated: string;
	status: 'started' | 'finished' | 'error';
}

export async function fetchSiteBackups( siteId: number ): Promise< Backup[] > {
	return wpcom.req.get( {
		path: `/sites/${ siteId }/rewind/backups`,
		apiNamespace: 'wpcom/v2',
	} );
}

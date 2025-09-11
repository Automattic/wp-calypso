import { wpcom } from '../wpcom-fetcher';

export async function cancelSiteMigration( siteId: number ): Promise< void > {
	return wpcom.req.post( {
		path: `/sites/${ siteId }/automated-migration/cancel-migration`,
		apiNamespace: 'wpcom/v2',
	} );
}

export async function deleteSiteMigrationPendingStatus( siteId: number ): Promise< void > {
	return wpcom.req.post( {
		path: `/sites/${ siteId }/site-migration-status-sticker`,
		apiNamespace: 'wpcom/v2',
		method: 'DELETE',
		body: {
			type: 'pending',
		},
	} );
}

import { wpcom } from '../wpcom-fetcher';

export async function fetchSiteMigrationKey( siteId: number ): Promise< string > {
	const { migration_key } = await wpcom.req.get( {
		path: `/sites/${ siteId }/atomic-migration-status/wpcom-migration-key`,
		apiNamespace: 'wpcom/v2',
	} );

	return migration_key;
}

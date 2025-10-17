import { wpcom } from '../wpcom-fetcher';

export async function fetchSiteMigrationKey( siteId: number ): Promise< string > {
	const { migration_key } = await wpcom.req.get( {
		path: `/sites/${ siteId }/atomic-migration-status/wpcom-migration-key`,
		apiNamespace: 'wpcom/v2',
	} );

	return migration_key;
}

export async function fetchSiteMigrationZendeskTicket( siteId: number ): Promise< string > {
	const { ticket_id } = await wpcom.req.get( {
		path: `/sites/${ siteId }/automated-migration/find-ticket`,
		apiNamespace: 'wpcom/v2',
	} );

	return ticket_id;
}

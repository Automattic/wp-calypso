import { wpcom } from '../wpcom-fetcher';

type MigrationSource = {
	url?: string;
	platform?: string;
	platform_data?: { is_wpcom?: boolean };
};

export function analyzeSiteMigrationSource< Source extends MigrationSource = MigrationSource >(
	source: string
): Promise< Source > {
	return wpcom.req.get( {
		path: `/imports/analyze-url?site_url=${ encodeURIComponent( source ) }`,
		apiNamespace: 'wpcom/v2',
	} );
}

export async function fetchSiteMigrationZendeskTicket( siteId: number ): Promise< string > {
	const { ticket_id } = await wpcom.req.get( {
		path: `/sites/${ siteId }/automated-migration/find-ticket`,
		apiNamespace: 'wpcom/v2',
	} );

	return ticket_id;
}

import { wpcom } from '../wpcom-fetcher';

type MigrationAccess =
	| { migration_type: 'backup'; from_url: string; notes?: string }
	| {
			migration_type: 'credentials';
			from_url: string;
			username: string;
			password: string;
			notes?: string;
			bypass_verification?: boolean;
	  };

export function setupSiteMigrationAuthorization(
	siteId: number,
	source: string
): Promise< { application_passwords_enabled: boolean; authorization_url?: string } > {
	return wpcom.req.post( {
		path: `/sites/${ siteId }/automated-migration/application-passwords/setup`,
		apiNamespace: 'wpcom/v2',
		body: { source },
	} );
}

export function shareSiteMigrationAccess(
	siteIdOrSlug: number | string,
	siteSlug: string,
	locale: string,
	access: MigrationAccess
): Promise< { success: boolean } > {
	return wpcom.req.post(
		{
			path: `/sites/${ siteIdOrSlug }/automated-migration?_locale=${ encodeURIComponent( locale ) }`,
			apiNamespace: 'wpcom/v2',
		},
		{},
		{ ...access, blog_url: siteSlug }
	);
}

export function saveSiteMigrationApplicationPassword(
	siteIdOrSlug: number | string,
	credentials: { from_url: string; username: string; password: string }
): Promise< { success: boolean } > {
	return wpcom.req.post(
		{
			path: `/sites/${ siteIdOrSlug }/automated-migration/application-passwords`,
			apiNamespace: 'wpcom/v2',
		},
		{},
		credentials
	);
}

export function requestSiteMigrationHelp( body: {
	locale: string;
	blog_url: string;
	from_url: string;
	context?: string;
} ): Promise< { success: boolean } > {
	return wpcom.req.post(
		{ path: '/help/migration-ticket/new', apiNamespace: 'wpcom/v2' },
		{},
		body
	);
}

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

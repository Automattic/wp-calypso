import { wpcom } from '../wpcom-fetcher';
import type {
	RequestReverificationInput,
	TagSitesForCommissionInput,
	TagSitesForCommissionResponse,
} from './types';

export async function tagAgencySitesForCommission(
	agencyId: number,
	{ siteIds, tags, migrationSourceHost }: TagSitesForCommissionInput
): Promise< TagSitesForCommissionResponse > {
	return wpcom.req.put( {
		method: 'PUT',
		path: `/agency/${ agencyId }/sites/tag-for-commission`,
		apiNamespace: 'wpcom/v2',
		body: {
			tags,
			site_ids: siteIds,
			migration_source_host: migrationSourceHost,
		},
	} );
}

export async function requestMigrationReverification(
	agencyId: number,
	{ siteId, reason }: RequestReverificationInput
): Promise< void > {
	return wpcom.req.post( {
		path: `/agency/${ agencyId }/sites/${ siteId }/request-migration-reverification`,
		apiNamespace: 'wpcom/v2',
		body: { reason },
	} );
}

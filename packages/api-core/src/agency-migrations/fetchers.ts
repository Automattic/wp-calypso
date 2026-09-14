import { wpcom } from '../wpcom-fetcher';
import type { MigrationCommissionSite, MigrationCommissionSitesResponse } from './types';

export async function fetchAgencyMigrationCommissionSites(
	agencyId: number
): Promise< MigrationCommissionSite[] > {
	const response: MigrationCommissionSitesResponse = await wpcom.req.get( {
		path: `/agency/${ agencyId }/sites`,
		apiNamespace: 'wpcom/v2',
	} );

	return Array.isArray( response ) ? response : response.sites ?? [];
}

import { wpcom } from '../wpcom-fetcher';
import type { ProvisionAgencySiteParams } from './types';

/**
 * Starts provisioning a pending agency site with the given configuration.
 */
export async function provisionAgencySite(
	agencyId: number,
	params: ProvisionAgencySiteParams
): Promise< { success: boolean } > {
	return wpcom.req.post( {
		apiNamespace: 'wpcom/v2',
		path: `/agency/${ agencyId }/sites/${ params.id }/provision`,
		body: params,
	} );
}

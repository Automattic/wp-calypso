import { wpcom } from '../wpcom-fetcher';
import type {
	ProvisionAgencyDevSiteParams,
	ProvisionAgencyDevSiteResponse,
	ProvisionAgencySiteParams,
} from './types';

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

/**
 * Creates a free development site against one of the agency's dev licenses.
 *
 * Unlike a paid site there is nothing to provision against, so this one call
 * issues the license and creates the site, and returns the site it made.
 */
export async function provisionAgencyDevSite(
	agencyId: number,
	params: ProvisionAgencyDevSiteParams
): Promise< ProvisionAgencyDevSiteResponse > {
	return wpcom.req.post( {
		apiNamespace: 'wpcom/v2',
		path: `/agency/${ agencyId }/sites/provision-dev-site`,
		body: params,
	} );
}

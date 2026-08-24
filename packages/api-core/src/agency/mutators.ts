import { wpcom } from '../wpcom-fetcher';
import type { Agency, AgencyPartnerDirectoryApplicationUpdate } from './types';

/**
 * Updates the agency's partner directory application and returns the updated agency.
 */
export async function updateAgencyPartnerDirectoryApplication(
	agencyId: number,
	update: AgencyPartnerDirectoryApplicationUpdate
): Promise< Agency > {
	return wpcom.req.put(
		{
			path: `/agency/${ agencyId }/profile/application`,
			apiNamespace: 'wpcom/v2',
			method: 'PUT',
		},
		update
	);
}

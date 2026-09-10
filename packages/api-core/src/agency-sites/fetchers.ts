import { wpcom } from '../wpcom-fetcher';
import type { AgencySiteAddressValidation, AgencySiteWithPlugin, PendingAgencySite } from './types';

export async function fetchAgencySitesWithPlugins(
	agencyId: number,
	plugins: string[]
): Promise< AgencySiteWithPlugin[] > {
	return wpcom.req.get(
		{
			apiNamespace: 'wpcom/v2',
			path: `/agency/${ agencyId }/sites`,
		},
		{
			filters: {
				plugins,
			},
		}
	);
}

/**
 * Sites the agency has purchased but not yet provisioned.
 */
export async function fetchPendingAgencySites( agencyId: number ): Promise< PendingAgencySite[] > {
	return wpcom.req.get( {
		apiNamespace: 'wpcom/v2',
		path: `/agency/${ agencyId }/sites/pending`,
	} );
}

/**
 * Checks whether the agency can claim `{siteName}.wordpress.com`. A POST, but
 * it only validates: the address is not reserved until the site is provisioned.
 */
export async function validateAgencySiteAddress(
	agencyId: number,
	siteName: string
): Promise< AgencySiteAddressValidation > {
	return wpcom.req.post(
		{
			apiNamespace: 'wpcom/v2',
			path: `/agency/${ agencyId }/validate-site-address`,
		},
		{ site_name: siteName, domain: 'wordpress.com', type: 'blog' }
	);
}

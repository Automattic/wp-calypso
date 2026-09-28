import { FreeSiteAddressType } from '../site-address-change/types';
import { wpcom } from '../wpcom-fetcher';
import type {
	AgencyPendingSite,
	AgencySiteAddressValidation,
	AgencySiteWithPlugin,
	CreateAgencySiteResponse,
} from './types';

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

export async function fetchAgencyPendingSites( agencyId: number ): Promise< AgencyPendingSite[] > {
	return wpcom.req.get( {
		apiNamespace: 'wpcom/v2',
		path: `/agency/${ agencyId }/sites/pending`,
	} );
}

/** Brings a site the user already owns under the agency's management. */
export async function createAgencySite(
	agencyId: number,
	blogId: number
): Promise< CreateAgencySiteResponse > {
	return wpcom.req.post( {
		apiNamespace: 'wpcom/v2',
		path: `/agency/${ agencyId }/sites`,
		body: { blog_id: blogId },
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
		{ site_name: siteName, domain: 'wordpress.com', type: FreeSiteAddressType.BLOG }
	);
}

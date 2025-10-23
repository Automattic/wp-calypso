import { JOINED_SITE_FIELDS, JOINED_SITE_OPTIONS } from '../site';
import { wpcom } from '../wpcom-fetcher';
import type { Site } from '../site';

export interface FetchSitesOptions {
	include_a8c_owned: boolean;
	site_visibility: 'all' | 'visible' | 'hidden' | 'deleted';
	site_filters?: ( 'atomic' | 'jetpack' | 'wpcom' | 'jetpack-full' | 'commerce-garden' )[];
}

export async function fetchSites( {
	include_a8c_owned,
	site_visibility,
	site_filters,
}: FetchSitesOptions ): Promise< Site[] > {
	const { sites } = await wpcom.req.get(
		{
			path: '/me/sites',
			apiVersion: '1.2',
		},
		{
			include_a8c_owned,
			include_domain_only: false,
			site_activity: 'active',
			site_visibility,
			fields: JOINED_SITE_FIELDS,
			options: JOINED_SITE_OPTIONS,
			filters: site_filters ? site_filters.join( ',' ) : undefined,
		}
	);
	return sites;
}

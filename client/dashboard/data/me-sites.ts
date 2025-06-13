import wpcom from 'calypso/lib/wp';
import { JOINED_SITE_FIELDS, JOINED_SITE_OPTIONS } from './site';
import type { Site } from './site';

export interface FetchSitesOptions {
	site_visibility: 'all' | 'visible' | 'hidden' | 'deleted';
}

export async function fetchSites( { site_visibility }: FetchSitesOptions ): Promise< Site[] > {
	const { sites } = await wpcom.req.get(
		{
			path: '/me/sites',
			apiVersion: '1.2',
		},
		{
			site_visibility,
			include_domain_only: 'true',
			site_activity: 'active',
			fields: JOINED_SITE_FIELDS,
			options: JOINED_SITE_OPTIONS,
		}
	);
	return sites;
}

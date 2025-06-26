import wpcom from 'calypso/lib/wp';
import { JOINED_SITE_FIELDS, JOINED_SITE_OPTIONS } from './site';
import type { Site } from './site';

export interface FetchSitesOptions {
	include_a8c_owned: boolean;
	site_visibility: 'all' | 'visible' | 'hidden' | 'deleted';
}

export async function fetchSites( {
	include_a8c_owned,
	site_visibility,
}: FetchSitesOptions ): Promise< Site[] > {
	// Some P2 sites are not retrievable unless site_visibility is set to 'all'.
	// See: https://github.com/Automattic/wp-calypso/pull/104220.
	if ( include_a8c_owned ) {
		site_visibility = 'all';
	}

	const { sites } = await wpcom.req.get(
		{
			path: '/me/sites',
			apiVersion: '1.2',
		},
		{
			include_a8c_owned,
			include_domain_only: false,
			include_redirect: false,
			site_activity: 'active',
			site_visibility,
			fields: JOINED_SITE_FIELDS,
			options: JOINED_SITE_OPTIONS,
		}
	);
	return sites;
}

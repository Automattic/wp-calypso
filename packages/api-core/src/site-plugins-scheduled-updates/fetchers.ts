import { wpcom } from '../wpcom-fetcher';
import type { MultisiteScheduledUpdatesResponse, SiteScheduledUpdatesResponse } from './types';

// Single-site list
export async function fetchSiteScheduledUpdates(
	siteId: number
): Promise< SiteScheduledUpdatesResponse > {
	return await wpcom.req.get( {
		path: `/sites/${ siteId }/update-schedules`,
		apiNamespace: 'wpcom/v2',
	} );
}

// Multisite list (aggregated by hosting endpoint)
export async function fetchMultisiteScheduledUpdates(): Promise< MultisiteScheduledUpdatesResponse > {
	return await wpcom.req.get( {
		path: '/hosting/update-schedules',
		apiNamespace: 'wpcom/v2',
	} );
}

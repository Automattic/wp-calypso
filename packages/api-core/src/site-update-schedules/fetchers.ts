import { wpcom } from '../wpcom-fetcher';
import type { SiteUpdateSchedulesResponse } from './types';

// Single-site list
export async function fetchSiteUpdateSchedules(
	siteId: number
): Promise< SiteUpdateSchedulesResponse > {
	return await wpcom.req.get( {
		path: `/sites/${ siteId }/update-schedules`,
		apiNamespace: 'wpcom/v2',
	} );
}

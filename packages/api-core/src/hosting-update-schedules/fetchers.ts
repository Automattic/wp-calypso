import { wpcom } from '../wpcom-fetcher';
import type { HostingUpdateSchedulesResponse } from './types';

// Multisite list (aggregated by hosting endpoint)
export async function fetchHostingUpdateSchedules(): Promise< HostingUpdateSchedulesResponse > {
	return await wpcom.req.get( {
		path: '/hosting/update-schedules',
		apiNamespace: 'wpcom/v2',
	} );
}

import { wpcom } from '../wpcom-fetcher';
import type {
	CreateUpdateScheduleBody,
	EditUpdateScheduleBody,
	MultisiteSchedulesUpdatesResponse,
	ScheduleUpdates,
} from './types';

// Single-site list
export async function fetchSiteUpdateSchedules(
	siteId: number
): Promise< Record< string, ScheduleUpdates > > {
	return await wpcom.req.get( {
		path: `/sites/${ siteId }/update-schedules`,
		apiNamespace: 'wpcom/v2',
	} );
}

// Single-site create
export async function createSiteUpdateSchedule(
	siteId: number,
	body: CreateUpdateScheduleBody
): Promise< unknown > {
	return await wpcom.req.post( {
		path: `/sites/${ siteId }/update-schedules`,
		apiNamespace: 'wpcom/v2',
		body,
	} );
}

// Single-site edit
export async function editSiteUpdateSchedule(
	siteId: number,
	scheduleId: string,
	body: EditUpdateScheduleBody
): Promise< unknown > {
	return await wpcom.req.put( {
		path: `/sites/${ siteId }/update-schedules/${ scheduleId }`,
		apiNamespace: 'wpcom/v2',
		body,
	} );
}

// Single-site delete
export async function deleteSiteUpdateSchedule(
	siteId: number,
	scheduleId: string
): Promise< unknown > {
	return await wpcom.req.delete( {
		path: `/sites/${ siteId }/update-schedules/${ scheduleId }`,
		apiNamespace: 'wpcom/v2',
	} );
}

// Multisite list (aggregated by hosting endpoint)
export async function fetchMultisiteUpdateSchedules(): Promise< MultisiteSchedulesUpdatesResponse > {
	return await wpcom.req.get( {
		path: '/hosting/update-schedules',
		apiNamespace: 'wpcom/v2',
	} );
}

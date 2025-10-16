import { wpcom } from '../wpcom-fetcher';
import type { CreateSiteUpdateScheduleBody, EditSiteUpdateScheduleBody } from './types';

// Single-site create
export async function createSiteUpdateSchedule(
	siteId: number,
	body: CreateSiteUpdateScheduleBody
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
	body: EditSiteUpdateScheduleBody
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
	return await wpcom.req.post( {
		path: `/sites/${ siteId }/update-schedules/${ scheduleId }`,
		method: 'DELETE',
		apiNamespace: 'wpcom/v2',
	} );
}

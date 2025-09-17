import { wpcom } from '../wpcom-fetcher';
import type { CreateScheduledUpdateBody, EditScheduledUpdateBody } from './types';

// Single-site create
export async function createSiteScheduledUpdate(
	siteId: number,
	body: CreateScheduledUpdateBody
): Promise< unknown > {
	return await wpcom.req.post( {
		path: `/sites/${ siteId }/update-schedules`,
		apiNamespace: 'wpcom/v2',
		body,
	} );
}

// Single-site edit
export async function editSiteScheduledUpdate(
	siteId: number,
	scheduleId: string,
	body: EditScheduledUpdateBody
): Promise< unknown > {
	return await wpcom.req.put( {
		path: `/sites/${ siteId }/update-schedules/${ scheduleId }`,
		apiNamespace: 'wpcom/v2',
		body,
	} );
}

// Single-site delete
export async function deleteSiteScheduledUpdate(
	siteId: number,
	scheduleId: string
): Promise< unknown > {
	return await wpcom.req.delete( {
		path: `/sites/${ siteId }/update-schedules/${ scheduleId }`,
		apiNamespace: 'wpcom/v2',
	} );
}

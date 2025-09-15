import { wpcom } from '../wpcom-fetcher';
import type {
	CreateScheduledUpdateBody,
	EditScheduledUpdateBody,
	MultisiteScheduledUpdatesResponse,
	ScheduledUpdate,
} from './types';

// Single-site list
export async function fetchSiteScheduledUpdates(
	siteId: number
): Promise< Record< string, ScheduledUpdate > > {
	return await wpcom.req.get( {
		path: `/sites/${ siteId }/update-schedules`,
		apiNamespace: 'wpcom/v2',
	} );
}

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

// Multisite list (aggregated by hosting endpoint)
export async function fetchMultisiteScheduledUpdates(): Promise< MultisiteScheduledUpdatesResponse > {
	return await wpcom.req.get( {
		path: '/hosting/update-schedules',
		apiNamespace: 'wpcom/v2',
	} );
}

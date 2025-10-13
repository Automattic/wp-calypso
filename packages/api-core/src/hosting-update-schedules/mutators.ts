import { wpcom } from '../wpcom-fetcher';

export function deleteHostingUpdateSchedule( siteId: number, scheduleId: string ): Promise< void > {
	return wpcom.req.get( {
		path: `/sites/${ siteId }/update-schedules/${ encodeURIComponent( scheduleId ) }`,
		method: 'DELETE',
		apiNamespace: 'wpcom/v2',
	} );
}

export function updateActiveStatusHostingUpdateSchedule(
	siteId: number,
	scheduleId: string,
	active: boolean
): Promise< unknown > {
	return wpcom.req.put( {
		path: `/sites/${ siteId }/update-schedules/${ encodeURIComponent( scheduleId ) }/active`,
		apiNamespace: 'wpcom/v2',
		body: { active },
	} );
}

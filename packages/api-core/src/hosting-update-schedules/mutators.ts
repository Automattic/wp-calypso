import { wpcom } from '../wpcom-fetcher';

export function deleteHostingUpdateSchedule( siteId: number, scheduleId: string ): Promise< void > {
	return wpcom.req.get( {
		path: `/sites/${ siteId }/update-schedules/${ encodeURIComponent( scheduleId ) }`,
		method: 'DELETE',
		apiNamespace: 'wpcom/v2',
	} );
}

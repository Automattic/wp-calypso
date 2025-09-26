import { wpcom } from '../wpcom-fetcher';
import type { ActivityLogParams, ActivityLogsData, ActivityLogGroupCountResponse } from './types';

export async function fetchSiteActivityLog(
	siteId: number,
	params: ActivityLogParams
): Promise< ActivityLogsData > {
	const response = await wpcom.req.get(
		{
			path: `/sites/${ siteId }/activity`,
			apiNamespace: 'wpcom/v2',
		},
		params
	);

	return {
		activityLogs: response.current?.orderedItems ?? [],
		totalItems: response.totalItems,
		pages: response.pages,
		itemsPerPage: response.itemsPerPage,
		totalPages: response.totalPages,
	};
}

export async function fetchSiteActivityLogGroupCounts(
	siteId: number,
	params: ActivityLogParams
): Promise< ActivityLogGroupCountResponse > {
	const response = await wpcom.req.get(
		{
			path: `/sites/${ siteId }/activity/count/group`,
			apiNamespace: 'wpcom/v2',
		},
		params
	);

	return response;
}

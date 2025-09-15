import { wpcom } from '../wpcom-fetcher';
import type { ActivityLogAPIResponse, ActivityLogParams, ActivityLogsData } from './types';

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

export async function fetchSiteRewindableActivityLog(
	siteId: number,
	{ number }: { number: number }
): Promise< ActivityLogAPIResponse > {
	return wpcom.req.get(
		{
			path: `/sites/${ siteId }/activity/rewindable`,
			apiNamespace: 'wpcom/v2',
		},
		{
			number,
		}
	);
}

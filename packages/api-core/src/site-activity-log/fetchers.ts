import { wpcom } from '../wpcom-fetcher';
import type { ActivityLogParams, ActivityLogsData } from './types';

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

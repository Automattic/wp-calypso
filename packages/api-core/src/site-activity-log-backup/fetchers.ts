import { wpcom } from '../wpcom-fetcher';
import type { ActivityLogResponse } from '../site-activity-log/types';

export async function fetchSiteBackupActivityLog(
	siteId: number,
	{
		number,
		aggregate = false,
		after,
		before,
	}: {
		number: number;
		aggregate?: boolean;
		after?: string;
		before?: string;
	}
): Promise< ActivityLogResponse > {
	return wpcom.req.get(
		{
			path: `/sites/${ siteId }/activity/rewindable`,
			apiNamespace: 'wpcom/v2',
		},
		{
			number,
			aggregate,
			after,
			before,
		}
	);
}

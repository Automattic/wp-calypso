import { wpcom } from '../wpcom-fetcher';
import type {
	ActivityLogResponse,
	ActivityLogGroupCountResponse,
} from '../site-activity-log/types';

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

export async function fetchSiteBackupActivityLogGroupCounts(
	siteId: number,
	{ after, before }: { after?: string; before?: string }
): Promise< ActivityLogGroupCountResponse > {
	return wpcom.req.get(
		{
			path: `/sites/${ siteId }/activity/rewindable/count/group`,
			apiNamespace: 'wpcom/v2',
		},
		{
			after,
			before,
		}
	);
}

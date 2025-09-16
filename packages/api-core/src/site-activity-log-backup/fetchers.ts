import { wpcom } from '../wpcom-fetcher';
import type { ActivityLogAPIResponse } from '../site-activity-log/types';

export async function fetchSiteBackupActivityLog(
	siteId: number,
	{ number, aggregate = false }: { number: number; aggregate?: boolean }
): Promise< ActivityLogAPIResponse > {
	return wpcom.req.get(
		{
			path: `/sites/${ siteId }/activity/rewindable`,
			apiNamespace: 'wpcom/v2',
		},
		{
			number,
			aggregate,
		}
	);
}

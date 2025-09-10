import { wpcom } from '../wpcom-fetcher';
import type { ActivityLog, ActivityLogParams } from './types';

export async function fetchSiteActivityLog(
	siteId: number,
	params: ActivityLogParams
): Promise< ActivityLog > {
	return wpcom.req.get(
		{
			path: `/sites/${ siteId }/activity`,
			apiNamespace: 'wpcom/v2',
		},
		params
	);
}

export async function fetchSiteRewindableActivityLog(
	siteId: number,
	{ number }: { number: number }
): Promise< ActivityLog > {
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

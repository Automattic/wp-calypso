import { wpcom } from '../wpcom-fetcher';
import type { ActivityLog } from './types';

export async function fetchSiteActivityLog(
	siteId: number,
	{ number }: { number: number }
): Promise< ActivityLog > {
	return wpcom.req.get(
		{
			path: `/sites/${ siteId }/activity`,
			apiNamespace: 'wpcom/v2',
		},
		{
			number,
		}
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

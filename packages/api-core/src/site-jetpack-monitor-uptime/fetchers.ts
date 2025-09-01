import { wpcom } from '../wpcom-fetcher';
import type { SiteUptime } from './types';

export async function fetchSiteUptime(
	siteId: number,
	period?: string
): Promise< Record< string, SiteUptime > > {
	return wpcom.req.get(
		{
			path: `/sites/${ siteId }/jetpack-monitor-uptime`,
			apiNamespace: 'wpcom/v2',
		},
		{ period: period ?? '30 days' }
	);
}

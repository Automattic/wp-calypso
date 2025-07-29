import wpcom from 'calypso/lib/wp';

export interface SiteUptime {
	status: 'up' | 'down' | 'monitor_inactive';
	downtime_in_minutes?: number;
}

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
